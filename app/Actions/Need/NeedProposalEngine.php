<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\DTOs\Need\NeedProposalPayload;
use App\Models\FundingSource;
use App\Models\Need;
use App\Models\NeedAttachment;
use App\Models\NeedDetail;
use App\Models\User;
use BackedEnum;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class NeedProposalEngine
{
    public function __construct(
        protected ?NeedStrategicAlignmentEngine $alignmentEngine = null,
        protected ?NeedLockLifecycle $lockLifecycle = null,
    ) {
        $this->alignmentEngine ??= app(NeedStrategicAlignmentEngine::class);
        $this->lockLifecycle ??= app(NeedLockLifecycle::class);
    }

    /**
     * Submit a new need proposal with its alignments, details, and attachments.
     */
    public function submit(NeedProposalPayload $payload, ?User $actor = null): Need
    {
        return DB::transaction(function () use ($payload, $actor) {
            $attributes = $payload->attributes;

            $urgency = $this->normalizeEnumValue($attributes['urgency'] ?? null);
            $impact = $this->normalizeEnumValue($attributes['impact'] ?? null);
            $attributes['is_priority'] = $urgency === 'high' && $impact === 'high';

            if (array_key_exists('volume', $attributes) && array_key_exists('unit_price', $attributes)) {
                $attributes['total_price'] = round((float) $attributes['volume'] * (float) $attributes['unit_price'], 2);
            }

            $attributes['status'] = $attributes['status'] ?? Need::STATUS_DRAFT;

            /** @var Need $need */
            $need = Need::query()->create($attributes);

            $this->alignmentEngine->syncForNeed($need, $payload, isPartialUpdate: false);
            $this->saveDetail($need, $payload->detail, $payload->fundingSources, $actor);
            $this->storeAttachments($need, $payload);
            if ($payload->shouldSubmit) {
                $this->lockLifecycle->lockForExecutiveReview($need, $actor);
            }

            return $need;
        });
    }

    /**
     * Update an existing need proposal with partial alignment sync, detail updates,
     * attachment deletions, and new attachment uploads.
     */
    public function update(Need $need, NeedProposalPayload $payload, ?User $actor = null): Need
    {
        return DB::transaction(function () use ($need, $payload, $actor) {
            $attributes = $payload->attributes;

            $urgency = $this->normalizeEnumValue($attributes['urgency'] ?? $need->urgency);
            $impact = $this->normalizeEnumValue($attributes['impact'] ?? $need->impact);
            $attributes['is_priority'] = $urgency === 'high' && $impact === 'high';

            $volume = array_key_exists('volume', $attributes) ? (float) $attributes['volume'] : (float) $need->volume;
            $unitPrice = array_key_exists('unit_price', $attributes) ? (float) $attributes['unit_price'] : (float) $need->unit_price;
            $attributes['total_price'] = round($volume * $unitPrice, 2);

            // Proposal lock & status transition are handled via lockLifecycle if submitted

            $need->update($attributes);
            $this->alignmentEngine->syncForNeed($need, $payload, isPartialUpdate: true);

            if ($payload->detail !== null) {
                $this->saveDetail($need, $payload->detail, $payload->fundingSources, $actor);
            }

            if (! empty($payload->deletedAttachmentIds)) {
                /** @var Collection<int, NeedAttachment> $attachmentsToDelete */
                $attachmentsToDelete = $need->attachments()
                    ->whereIn('id', $payload->deletedAttachmentIds)
                    ->get();

                foreach ($attachmentsToDelete as $attToDel) {
                    $this->deleteAttachment($attToDel);
                }
            }

            $this->storeAttachments($need, $payload);
            if ($payload->shouldSubmit) {
                $this->lockLifecycle->submit($need, $actor);
            }

            return $need;
        });
    }

    /**
     * Upload and attach a single file to a need proposal.
     *
     * @param  array{file: UploadedFile, display_name?: ?string, extension?: ?string, file_size?: ?int, category?: ?string}  $data
     */
    public function addAttachment(Need $need, array $data): NeedAttachment
    {
        $file = $data['file'];
        $category = in_array($data['category'] ?? 'general', ['general', 'technical_specifications'], true)
            ? ($data['category'] ?? 'general')
            : 'general';
        $displayName = $data['display_name'] ?? $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $fileSize = $file->getSize();
        $disk = (string) config('filesystems.attachments_disk', config('filesystems.default', 'local'));

        $folder = $category === 'technical_specifications'
            ? "needs/{$need->id}/technical_specifications"
            : "needs/{$need->id}";

        $path = $file->store($folder, $disk);

        /** @var NeedAttachment $attachment */
        $attachment = $need->attachments()->create([
            'category' => $category,
            'display_name' => $displayName,
            'file_path' => $path,
            'file_size' => $fileSize,
            'mime_type' => $file->getMimeType(),
            'extension' => $extension,
        ]);

        return $attachment;
    }

    /**
     * Delete an attachment from storage and database.
     */
    public function deleteAttachment(NeedAttachment $attachment): void
    {
        $disk = (string) config('filesystems.attachments_disk', config('filesystems.default', 'local'));

        if (Storage::disk($disk)->exists($attachment->file_path)) {
            Storage::disk($disk)->delete($attachment->file_path);
        }

        $attachment->delete();
    }

    /**
     * Save detail and resolve dynamic funding sources.
     *
     * @param  array<string, mixed>|null  $detailData
     * @param  array<int|string>|null  $fundingSourceIds
     */
    protected function saveDetail(Need $need, ?array $detailData, ?array $fundingSourceIds, ?User $actor = null): void
    {
        if ($detailData === null && $fundingSourceIds === null) {
            return;
        }

        $resolvedIds = $this->resolveFundingSourceIds($fundingSourceIds, $actor);

        /** @var NeedDetail $detail */
        $detail = $need->detail()->updateOrCreate(
            ['need_id' => $need->id],
            $detailData ?? []
        );

        if ($fundingSourceIds !== null) {
            $detail->fundingSources()->sync($resolvedIds);
        }
    }

    /**
     * Resolve dynamic funding source names or existing IDs.
     *
     * @param  array<int|string>|null  $fundingSourceIds
     * @return array<int, int>
     */
    public function resolveFundingSourceIds(?array $fundingSourceIds, ?User $actor = null): array
    {
        if (empty($fundingSourceIds)) {
            return [];
        }

        $canManageMasterFundingSources = $actor !== null && (
            $actor->hasRole('super-admin') || $actor->can('manage funding sources')
        );

        $resolvedIds = [];
        foreach ($fundingSourceIds as $idOrName) {
            if (! is_numeric($idOrName) && ! empty($idOrName)) {
                if ($canManageMasterFundingSources) {
                    $source = FundingSource::query()->firstOrCreate(['name' => (string) $idOrName]);
                    $resolvedIds[] = $source->id;
                }
            } elseif (! empty($idOrName)) {
                $id = (int) $idOrName;
                if (FundingSource::query()->where('id', $id)->exists()) {
                    $resolvedIds[] = $id;
                }
            }
        }

        return array_values(array_unique($resolvedIds));
    }

    /**
     * Store general and technical specification attachments.
     */
    protected function storeAttachments(Need $need, NeedProposalPayload $payload): void
    {
        $disk = (string) config('filesystems.attachments_disk', config('filesystems.default', 'local'));

        if (! empty($payload->generalAttachments)) {
            foreach ($payload->generalAttachments as $index => $file) {
                $displayName = $payload->generalAttachmentNames[$index] ?? $file->getClientOriginalName();
                $path = $file->store("needs/{$need->id}", $disk);

                $need->attachments()->create([
                    'category' => 'general',
                    'display_name' => $displayName,
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'extension' => $file->getClientOriginalExtension(),
                ]);
            }
        }

        if (! empty($payload->technicalSpecificationAttachments)) {
            foreach ($payload->technicalSpecificationAttachments as $index => $file) {
                $displayName = $payload->technicalSpecificationAttachmentNames[$index] ?? $file->getClientOriginalName();
                $path = $file->store("needs/{$need->id}/technical_specifications", $disk);

                $need->attachments()->create([
                    'category' => 'technical_specifications',
                    'display_name' => $displayName,
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'extension' => $file->getClientOriginalExtension(),
                ]);
            }
        }
    }

    /**
     * Normalize an enum instance or primitive value to its scalar backing value.
     */
    protected function normalizeEnumValue(mixed $value): mixed
    {
        return $value instanceof BackedEnum ? $value->value : $value;
    }
}
