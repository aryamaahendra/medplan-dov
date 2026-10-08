<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Models\Need;
use App\Models\NeedAttachment;
use App\Models\NeedDetail;
use App\Models\NeedGroup;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RolloverNeedAction
{
    public function __construct(
        protected ?NeedStrategicAlignmentEngine $alignmentEngine = null,
    ) {
        $this->alignmentEngine ??= app(NeedStrategicAlignmentEngine::class);
    }

    /**
     * Rollover (clone) a single unapproved need into a target need group.
     */
    public function execute(Need $sourceNeed, NeedGroup $targetGroup, ?User $actor = null): Need
    {
        return DB::transaction(function () use ($sourceNeed, $targetGroup) {
            $sourceNeed->loadMissing([
                'detail.fundingSources',
                'sasarans',
                'indicators',
                'kpiIndicators',
                'strategicServicePlans',
                'planningActivityVersions',
                'planningActivityIndicators',
                'attachments',
            ]);

            // Create cloned Need record
            /** @var Need $newNeed */
            $newNeed = Need::query()->create([
                'need_group_id' => $targetGroup->id,
                'source_need_id' => $sourceNeed->id,
                'organizational_unit_id' => $sourceNeed->organizational_unit_id,
                'need_type_id' => $sourceNeed->need_type_id,
                'year' => $targetGroup->year,
                'title' => $sourceNeed->title,
                'description' => $sourceNeed->description,
                'current_condition' => $sourceNeed->current_condition,
                'required_condition' => $sourceNeed->required_condition,
                'volume' => $sourceNeed->volume,
                'unit' => $sourceNeed->unit,
                'unit_price' => $sourceNeed->unit_price,
                'total_price' => $sourceNeed->total_price,
                'urgency' => $sourceNeed->urgency,
                'impact' => $sourceNeed->impact,
                'is_priority' => $sourceNeed->is_priority,
                'status' => Need::STATUS_DRAFT,
                'checklist_percentage' => 0,
                'notes' => null,
                'approved_by_director_at' => null,
                'is_locked' => null,
                'locked_at' => null,
                'locked_by_user_id' => null,
                'lock_reason' => null,
                'unlocked_until' => null,
            ]);

            // Clone NeedDetail if exists
            if ($sourceNeed->detail) {
                $detailAttributes = collect($sourceNeed->detail->toArray())
                    ->except(['id', 'need_id', 'created_at', 'updated_at', 'funding_sources'])
                    ->all();

                /** @var NeedDetail $newDetail */
                $newDetail = $newNeed->detail()->create($detailAttributes);

                $fundingSourceIds = $sourceNeed->detail->fundingSources->pluck('id')->toArray();
                if (! empty($fundingSourceIds)) {
                    $newDetail->fundingSources()->sync($fundingSourceIds);
                }
            }

            // Sync strategic alignments
            $this->alignmentEngine->cloneAlignments($sourceNeed, $newNeed);

            // Clone attachments & isolate stored files
            $disk = (string) config('filesystems.attachments_disk', config('filesystems.default', 'local'));
            /** @var NeedAttachment $attachment */
            foreach ($sourceNeed->attachments as $attachment) {
                $newFilePath = $attachment->file_path;

                if (Storage::disk($disk)->exists($attachment->file_path)) {
                    $filename = basename($attachment->file_path);
                    $subfolder = $attachment->category === 'technical_specifications'
                        ? "needs/{$newNeed->id}/technical_specifications"
                        : "needs/{$newNeed->id}";
                    $newFilePath = "{$subfolder}/".Str::random(40)."_{$filename}";

                    Storage::disk($disk)->copy($attachment->file_path, $newFilePath);
                }

                $newNeed->attachments()->create([
                    'category' => $attachment->category,
                    'display_name' => $attachment->display_name,
                    'file_path' => $newFilePath,
                    'file_size' => $attachment->file_size,
                    'mime_type' => $attachment->mime_type,
                    'extension' => $attachment->extension,
                ]);
            }

            return $newNeed;
        });
    }

    /**
     * Bulk rollover multiple needs into a target need group.
     *
     * @param  array<int, int>  $sourceNeedIds
     * @return Collection<int, Need>
     */
    public function executeMany(array $sourceNeedIds, NeedGroup $targetGroup, ?User $actor = null): Collection
    {
        $needs = Need::query()
            ->whereIn('id', $sourceNeedIds)
            ->whereNull('approved_by_director_at')
            ->where('need_group_id', '!=', $targetGroup->id)
            ->whereDoesntHave('rolloverNeeds', fn ($q) => $q->where('need_group_id', $targetGroup->id))
            ->get();

        $rolledOver = new Collection;
        foreach ($needs as $sourceNeed) {
            $rolledOver->push($this->execute($sourceNeed, $targetGroup, $actor));
        }

        return $rolledOver;
    }
}
