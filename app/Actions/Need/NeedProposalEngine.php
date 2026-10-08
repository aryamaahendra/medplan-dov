<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Models\FundingSource;
use App\Models\Need;
use App\Models\NeedAttachment;
use App\Models\NeedDetail;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class NeedProposalEngine
{
    public function __construct(
        protected ?NeedStrategicAlignmentEngine $alignmentEngine = null,
    ) {
        $this->alignmentEngine ??= app(NeedStrategicAlignmentEngine::class);
    }

    /**
     * Submit a new need proposal with its alignments, details, and attachments.
     */
    public function submit(NeedProposalPayload $payload): Need
    {
        return DB::transaction(function () use ($payload) {
            $attributes = $payload->attributes;

            $isPriority = ($attributes['urgency'] ?? '') === 'high' && ($attributes['impact'] ?? '') === 'high';
            $attributes['is_priority'] = $isPriority;

            /** @var Need $need */
            $need = Need::query()->create($attributes);

            $this->alignmentEngine->syncForNeed($need, $payload, isPartialUpdate: false);
            $this->saveDetail($need, $payload->detail, $payload->fundingSources);
            $this->storeAttachments($need, $payload);

            return $need;
        });
    }

    /**
     * Update an existing need proposal with partial alignment sync, detail updates,
     * attachment deletions, and new attachment uploads.
     */
    public function update(Need $need, NeedProposalPayload $payload): Need
    {
        return DB::transaction(function () use ($need, $payload) {
            $attributes = $payload->attributes;

            $urgency = $attributes['urgency'] ?? $need->urgency;
            $impact = $attributes['impact'] ?? $need->impact;
            $attributes['is_priority'] = $urgency === 'high' && $impact === 'high';

            $need->update($attributes);

            $this->alignmentEngine->syncForNeed($need, $payload, isPartialUpdate: true);

            if ($payload->detail !== null) {
                $this->saveDetail($need, $payload->detail, $payload->fundingSources);
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
        $category = $data['category'] ?? 'general';
        $displayName = $data['display_name'] ?? $file->getClientOriginalName();
        $extension = $data['extension'] ?? $file->getClientOriginalExtension();
        $fileSize = $data['file_size'] ?? $file->getSize();

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
    protected function saveDetail(Need $need, ?array $detailData, ?array $fundingSourceIds): void
    {
        if ($detailData === null && $fundingSourceIds === null) {
            return;
        }

        $resolvedIds = $this->resolveFundingSourceIds($fundingSourceIds);

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
    protected function resolveFundingSourceIds(?array $fundingSourceIds): array
    {
        if (empty($fundingSourceIds)) {
            return [];
        }

        $resolvedIds = [];
        foreach ($fundingSourceIds as $idOrName) {
            if (! is_numeric($idOrName) && ! empty($idOrName)) {
                $source = FundingSource::query()->firstOrCreate(['name' => (string) $idOrName]);
                $resolvedIds[] = $source->id;
            } elseif (! empty($idOrName)) {
                $resolvedIds[] = (int) $idOrName;
            }
        }

        return $resolvedIds;
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
}
