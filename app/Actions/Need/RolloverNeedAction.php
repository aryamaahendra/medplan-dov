<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Models\Need;
use App\Models\NeedAttachment;
use App\Models\NeedDetail;
use App\Models\NeedGroup;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
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
    public function handle(Need $sourceNeed, NeedGroup $targetGroup, ?User $actor = null): Need
    {
        return $this->execute($sourceNeed, $targetGroup, $actor);
    }

    public function execute(Need $sourceNeed, NeedGroup $targetGroup, ?User $actor = null): Need
    {
        if ($actor !== null && ! $this->isAuthorizedForNeed($actor, $sourceNeed)) {
            throw new AuthorizationException('Unauthorized to rollover this proposal.');
        }

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

            $targetVolume = $sourceNeed->getEffectiveRolloverVolume();
            $unitPrice = (float) $sourceNeed->unit_price;
            $targetTotalPrice = round($targetVolume * $unitPrice, 2);

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
                'volume' => $targetVolume,
                'unit' => $sourceNeed->unit,
                'unit_price' => $unitPrice,
                'total_price' => $targetTotalPrice,
                'urgency' => $sourceNeed->urgency,
                'impact' => $sourceNeed->impact,
                'is_priority' => $sourceNeed->is_priority,
                'status' => Need::STATUS_DRAFT,
                'checklist_percentage' => 0,
                'notes' => null,
                'approved_by_director_at' => null,
                'approved_volume' => null,
                'approved_unit_price' => null,
                'approved_total_price' => null,
                'is_recommended_for_next_cycle' => false,
                'recommended_volume' => null,
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
        $query = Need::query()
            ->whereIn('id', $sourceNeedIds);

        if ($actor !== null) {
            $query->unapprovedCandidates($targetGroup->id, $actor);
        } else {
            $query->eligibleForRollover($targetGroup->id);
        }

        $needs = $query->get();

        $rolledOver = new Collection;
        foreach ($needs as $sourceNeed) {
            $rolledOver->push($this->execute($sourceNeed, $targetGroup, $actor));
        }

        return $rolledOver;
    }

    protected function isAuthorizedForNeed(User $actor, Need $need): bool
    {
        if ($actor->hasAnyRole(['super-admin', 'admin', 'planner']) || $actor->can('view any needs') || $actor->can('create any needs')) {
            return true;
        }

        if (($actor->can('view descendant needs') || $actor->can('create descendant needs')) && $actor->organizational_unit_id) {
            if ($actor->organizational_unit_id === $need->organizational_unit_id) {
                return true;
            }

            $needUnit = $need->organizationalUnit;
            if ($needUnit instanceof OrganizationalUnit && $needUnit->isDescendantOf($actor->organizational_unit_id)) {
                return true;
            }

            return false;
        }

        return $actor->organizational_unit_id === $need->organizational_unit_id;
    }
}
