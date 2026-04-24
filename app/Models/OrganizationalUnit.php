<?php

namespace App\Models;

use Database\Factories\OrganizationalUnitFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'code', 'parent_id'])]
class OrganizationalUnit extends Model
{
    /** @use HasFactory<OrganizationalUnitFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the parent unit.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class, 'parent_id');
    }

    /**
     * Get all parent units recursively.
     */
    public function parentsRecursive(): BelongsTo
    {
        return $this->parent()->with('parentsRecursive');
    }

    /**
     * Get the sub-units.
     */
    public function children(): HasMany
    {
        return $this->hasMany(OrganizationalUnit::class, 'parent_id');
    }

    /**
     * Get all child units recursively.
     */
    public function descendantsRecursive(): HasMany
    {
        return $this->children()->with('descendantsRecursive');
    }

    /**
     * Check if this unit is a descendant of the given unit ID.
     */
    public function isDescendantOf(int $parentId): bool
    {
        $currentParentId = $this->parent_id;

        while ($currentParentId !== null) {
            if ($currentParentId === $parentId) {
                return true;
            }

            // Fetch the parent's parent_id without loading the whole model if possible,
            // or just load the parent. Since we might do this multiple times, it's
            // better if parentsRecursive was already loaded.
            if ($this->relationLoaded('parentsRecursive')) {
                // If loaded, we can traverse the loaded relations
                return $this->isDescendantOfUsingLoadedRelations($parentId, $this->parent);
            }

            $parent = OrganizationalUnit::find($currentParentId);
            $currentParentId = $parent ? $parent->parent_id : null;
        }

        return false;
    }

    private function isDescendantOfUsingLoadedRelations(int $parentId, ?OrganizationalUnit $parent): bool
    {
        while ($parent) {
            if ($parent->id === $parentId) {
                return true;
            }
            $parent = $parent->parent;
        }

        return false;
    }
}
