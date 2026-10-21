import {
  RiAlignJustify,
  RiCalendarLine,
  RiChat1Line,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiFeedbackLine,
  RiFileTextLine,
  RiFilterLine,
  RiFilterOffLine,
  RiLayoutGridLine,
  RiSendPlaneLine,
  RiShareForwardLine,
  RiStarFill,
  RiTableLine,
  RiTimeLine,
} from '@remixicon/react';
import { useMemo, useState } from 'react';

import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Switch } from '@/components/ui/switch';
import type {
  AttentionCounts,
  AttentionFilterKey,
} from '@/features/need/types/need.types';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { cn } from '@/lib/utils';

export type { AttentionFilterKey };

function getFilterArray(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function useNeedsTableFilters({
  filters,
}: {
  filters: DataTableFilters & Record<string, any>;
}) {
  const activeManualCount = useMemo(() => {
    const keys = [
      'year',
      'status',
      'need_type_id',
      'organizational_unit_id',
      'urgency',
      'impact',
      'is_priority',
      'is_recommended_for_next_cycle',
      'min_checklist_score',
    ];

    return keys.reduce((acc, key) => {
      const val = (filters as Record<string, any>)[key];

      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val) ? val.length > 0 : true) {
          return acc + 1;
        }
      }

      return acc;
    }, 0);
  }, [filters]);

  const [isAdvance, setIsAdvance] = useState(() => activeManualCount > 0);
  const [showFilters, setShowFilters] = useState(false);

  return {
    isAdvance,
    setIsAdvance,
    showFilters,
    setShowFilters,
    activeManualCount,
  };
}

export interface NeedsTableToolbarActionsProps {
  viewMode: 'table' | 'grid' | 'list' | 'loading';
  setViewMode: (mode: 'table' | 'grid' | 'list') => void;
  showFilters: boolean;
  onToggleShowFilters: () => void;
  isAdvance: boolean;
  onToggleAdvance: (advance: boolean) => void;
  activeManualCount: number;
}

export function NeedsTableToolbarActions({
  viewMode,
  setViewMode,
  showFilters,
  onToggleShowFilters,
  isAdvance,
  onToggleAdvance,
  activeManualCount,
}: NeedsTableToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* 1. List view (view mode switcher) */}
      <ButtonGroup>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewMode('table')}
          className={cn('border', {
            'bg-muted': viewMode === 'table',
          })}
        >
          <RiTableLine />
          <span className="sr-only">Table view</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewMode('list')}
          className={cn('border', {
            'bg-muted': viewMode === 'list',
          })}
        >
          <RiAlignJustify />
          <span className="sr-only">List card view</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewMode('grid')}
          className={cn('border', {
            'bg-muted': viewMode === 'grid',
          })}
        >
          <RiLayoutGridLine />
          <span className="sr-only">Grid view</span>
        </Button>
      </ButtonGroup>

      {/* 2. Filter show/close & Simple/Advance switch */}
      <div className="flex h-8 items-center gap-2 rounded-lg border bg-muted/20 px-2.5">
        <button
          type="button"
          onClick={onToggleShowFilters}
          className={cn(
            'inline-flex cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden',
            showFilters && 'text-foreground',
          )}
          title={showFilters ? 'Sembunyikan filter' : 'Tampilkan filter'}
          aria-label={showFilters ? 'Sembunyikan filter' : 'Tampilkan filter'}
        >
          {showFilters ? (
            <RiFilterLine className="size-4" />
          ) : (
            <RiFilterOffLine className="size-4" />
          )}
        </button>

        <span className="h-full w-px bg-border" />

        <span
          role="button"
          tabIndex={0}
          onClick={() => {
            onToggleAdvance(false);

            if (!showFilters) {
              onToggleShowFilters();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onToggleAdvance(false);

              if (!showFilters) {
                onToggleShowFilters();
              }
            }
          }}
          className={cn(
            'cursor-pointer text-xs transition-colors select-none',
            !isAdvance
              ? 'font-semibold text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Simple
        </span>

        <Switch
          id="filter-mode-switch"
          size="sm"
          checked={isAdvance}
          onCheckedChange={(checked) => {
            onToggleAdvance(checked);

            if (!showFilters) {
              onToggleShowFilters();
            }
          }}
          aria-label="Ganti mode filter antara Simple dan Advance"
        />

        <span
          role="button"
          tabIndex={0}
          onClick={() => {
            onToggleAdvance(true);

            if (!showFilters) {
              onToggleShowFilters();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onToggleAdvance(true);

              if (!showFilters) {
                onToggleShowFilters();
              }
            }
          }}
          className={cn(
            'cursor-pointer text-xs transition-colors select-none',
            isAdvance
              ? 'font-semibold text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Advance
        </span>

        {isAdvance && activeManualCount > 0 && (
          <Badge variant="secondary">{activeManualCount}</Badge>
        )}
      </div>
    </div>
  );
}

export interface NeedsTableFiltersProps {
  filters: DataTableFilters & {
    year?: string | string[];
    status?: string | string[];
    need_type_id?: string | string[];
    organizational_unit_id?: string | string[];
    urgency?: string | string[];
    impact?: string | string[];
    is_priority?: string | string[];
    is_recommended_for_next_cycle?: string | string[];
    min_checklist_score?: string | string[];
  };
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  needTypes: { id: number; name: string }[];
  mergeParams: (params: DataTableFilters) => void;
  isAdvance: boolean;
  attentionCounts?: AttentionCounts;
  activeAttentionFilter: AttentionFilterKey | null;
  onAttentionFilterChange: (filter: AttentionFilterKey | null) => void;
  activeManualCount?: number;
}

export function NeedsTableFilters({
  filters,
  organizationalUnits,
  needTypes,
  mergeParams,
  isAdvance,
  attentionCounts,
  activeAttentionFilter,
  onAttentionFilterChange,
  activeManualCount: propActiveManualCount,
}: NeedsTableFiltersProps) {
  const activeManualCount = useMemo(() => {
    if (propActiveManualCount !== undefined) {
      return propActiveManualCount;
    }

    const keys = [
      'year',
      'status',
      'need_type_id',
      'organizational_unit_id',
      'urgency',
      'impact',
      'is_priority',
      'is_recommended_for_next_cycle',
      'min_checklist_score',
    ];

    return keys.reduce((acc, key) => {
      const val = (filters as Record<string, any>)[key];

      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val) ? val.length > 0 : true) {
          return acc + 1;
        }
      }

      return acc;
    }, 0);
  }, [filters, propActiveManualCount]);

  const attentionChips: Array<{
    key: AttentionFilterKey;
    label: string;
    count: number;
    icon: React.ElementType;
  }> = [
    {
      key: 'low_checklist',
      label: 'Checklist < 85%',
      count: attentionCounts?.low_checklist ?? 0,
      icon: RiErrorWarningLine,
    },
    {
      key: 'revision_closing',
      label: 'Revisi Berakhir Segera',
      count: attentionCounts?.revision_closing ?? 0,
      icon: RiTimeLine,
    },
    {
      key: 'submission_closing',
      label: 'Periode Segera Ditutup',
      count: attentionCounts?.submission_closing ?? 0,
      icon: RiCalendarLine,
    },
    {
      key: 'has_notes',
      label: 'Catatan Direktur',
      count: attentionCounts?.has_notes ?? 0,
      icon: RiChat1Line,
    },
    {
      key: 'priority_only',
      label: 'Prioritas Saja',
      count: attentionCounts?.priority_only ?? 0,
      icon: RiStarFill,
    },
  ];

  // Options for manual faceted filters
  const statusOptions = [
    { label: 'Draft', value: 'draft', icon: RiFileTextLine },
    { label: 'Diajukan', value: 'submitted', icon: RiSendPlaneLine },
    { label: 'Disetujui', value: 'approved', icon: RiCheckboxCircleLine },
    { label: 'Ditolak', value: 'rejected', icon: RiCloseCircleLine },
    { label: 'Perlu Revisi', value: 'revision', icon: RiFeedbackLine },
  ];

  const recommendationOptions = [
    {
      label: 'Rekomendasi Siklus Berikutnya',
      value: '1',
      icon: RiShareForwardLine,
    },
  ];

  const isRecommendationActive = useMemo(() => {
    const rec = filters.is_recommended_for_next_cycle;

    if (!rec) {
      return false;
    }

    return getFilterArray(rec).includes('1');
  }, [filters.is_recommended_for_next_cycle]);

  const handleToggleRecommendation = () => {
    mergeParams({
      is_recommended_for_next_cycle: isRecommendationActive ? undefined : '1',
      page: 1,
    });
  };

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i)
      .reverse()
      .map((year) => ({ label: year.toString(), value: year.toString() }));
  }, []);

  const typeOptions = useMemo(
    () =>
      needTypes.map((type) => ({
        label: type.name,
        value: type.id.toString(),
      })),
    [needTypes],
  );

  const unitOptions = useMemo(
    () => [
      ...organizationalUnits.map((unit) => ({
        label: unit.name,
        value: unit.id.toString(),
      })),
      { label: 'Unit Terhapus / Tidak Aktif', value: 'trashed' },
    ],
    [organizationalUnits],
  );

  const urgencyOptions = [
    { label: 'Tinggi', value: 'high' },
    { label: 'Sedang', value: 'medium' },
    { label: 'Rendah', value: 'low' },
  ];

  const impactOptions = [
    { label: 'Tinggi', value: 'high' },
    { label: 'Sedang', value: 'medium' },
    { label: 'Rendah', value: 'low' },
  ];

  const priorityOptions = [
    { label: 'Ya', value: '1' },
    { label: 'Tidak', value: '0' },
  ];

  const scoreOptions = [{ label: '≥ 85%', value: '85' }];

  const handleResetManualFilters = () => {
    mergeParams({
      year: undefined,
      status: undefined,
      need_type_id: undefined,
      organizational_unit_id: undefined,
      urgency: undefined,
      impact: undefined,
      is_priority: undefined,
      is_recommended_for_next_cycle: undefined,
      min_checklist_score: undefined,
      page: 1,
    });
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-2.5">
      {!isAdvance ? (
        <>
          {/* Quick filter pills */}
          {attentionChips.map((chip) => {
            const Icon = chip.icon;
            const isActive = activeAttentionFilter === chip.key;

            return (
              <Button
                key={chip.key}
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onAttentionFilterChange(isActive ? null : chip.key)
                }
                className={cn(
                  'border transition-colors',
                  isActive
                    ? 'border-foreground/30 bg-muted font-semibold text-foreground hover:bg-muted/80'
                    : 'border-border/80 bg-background text-foreground/80 hover:bg-muted/60',
                )}
              >
                <Icon data-icon="inline-start" />
                <span>{chip.label}</span>
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  className={cn(
                    isActive && 'bg-primary text-primary-foreground',
                  )}
                >
                  {chip.count}
                </Badge>
              </Button>
            );
          })}

          {/* Dedicated recommendation filter toggle in Simple mode */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleRecommendation}
            className={cn(
              'border transition-colors',
              isRecommendationActive
                ? 'border-foreground/30 bg-muted font-semibold text-foreground hover:bg-muted/80'
                : 'border-border/80 bg-background text-foreground/80 hover:bg-muted/60',
            )}
          >
            <RiShareForwardLine data-icon="inline-start" />
            <span>Rekomendasi Siklus Berikutnya</span>
          </Button>

          {activeAttentionFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onAttentionFilterChange(null)}
            >
              Reset
              <RiCloseLine data-icon="inline-end" />
            </Button>
          )}
        </>
      ) : (
        <>
          {/* Manual faceted filters */}
          <DataTableFacetedFilter
            title="Tahun"
            options={yearOptions}
            selectedValues={getFilterArray(filters.year)}
            onSelect={(values) => mergeParams({ year: values, page: 1 })}
          />
          <DataTableFacetedFilter
            title="Status"
            options={statusOptions}
            selectedValues={getFilterArray(filters.status)}
            onSelect={(values) =>
              mergeParams({
                status: values.length > 0 ? values : undefined,
                page: 1,
              })
            }
          />
          <DataTableFacetedFilter
            title="Rekomendasi"
            options={recommendationOptions}
            selectedValues={getFilterArray(
              filters.is_recommended_for_next_cycle,
            )}
            onSelect={(values) =>
              mergeParams({
                is_recommended_for_next_cycle:
                  values.length > 0 ? values : undefined,
                page: 1,
              })
            }
          />
          <DataTableFacetedFilter
            title="Jenis"
            options={typeOptions}
            selectedValues={getFilterArray(filters.need_type_id)}
            onSelect={(values) =>
              mergeParams({ need_type_id: values, page: 1 })
            }
          />
          <DataTableFacetedFilter
            title="Unit Kerja"
            options={unitOptions}
            selectedValues={getFilterArray(filters.organizational_unit_id)}
            onSelect={(values) =>
              mergeParams({ organizational_unit_id: values, page: 1 })
            }
          />
          <DataTableFacetedFilter
            title="Urgensi"
            options={urgencyOptions}
            selectedValues={getFilterArray(filters.urgency)}
            onSelect={(values) => mergeParams({ urgency: values, page: 1 })}
          />
          <DataTableFacetedFilter
            title="Dampak"
            options={impactOptions}
            selectedValues={getFilterArray(filters.impact)}
            onSelect={(values) => mergeParams({ impact: values, page: 1 })}
          />
          <DataTableFacetedFilter
            title="Prioritas"
            options={priorityOptions}
            selectedValues={getFilterArray(filters.is_priority)}
            onSelect={(values) => mergeParams({ is_priority: values, page: 1 })}
          />

          <DataTableFacetedFilter
            title="Skor Checklist"
            options={scoreOptions}
            selectedValues={getFilterArray(filters.min_checklist_score)}
            onSelect={(values) =>
              mergeParams({ min_checklist_score: values, page: 1 })
            }
          />

          {activeManualCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleResetManualFilters}
            >
              Reset Filter
              <RiCloseLine data-icon="inline-end" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export { NeedsTableFilters as NeedsTableToolbar };
