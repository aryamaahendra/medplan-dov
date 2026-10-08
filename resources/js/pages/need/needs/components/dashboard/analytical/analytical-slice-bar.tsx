import { Link } from '@inertiajs/react';
import {
  RiFilterLine,
  RiBuildingLine,
  RiPriceTag3Line,
  RiTimeLine,
  RiStarLine,
  RiShieldCheckLine,
  RiCloseLine,
  RiArrowRightLine,
  RiInformationLine,
  RiExchangeLine,
  RiSearchLine,
} from '@remixicon/react';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type {
  DashboardGroupOption,
  NeedTypeStat,
  UnitBudgetStat,
} from '@/types/needs-dashboard';

import type { DerivedStage, SliceState } from './analytical-types';

interface AnalyticalSliceBarProps {
  groupId?: number;
  slice: SliceState;
  onSliceChange: (updater: (prev: SliceState) => SliceState) => void;
  onResetSlice: () => void;
  units: UnitBudgetStat[];
  needTypes: NeedTypeStat[];
  matchingCount: number;
  matchingBudget: number;
  compareGroup?: DashboardGroupOption | null;
  className?: string;
}

export function AnalyticalSliceBar({
  groupId,
  slice,
  onSliceChange,
  onResetSlice,
  units,
  needTypes,
  matchingCount,
  matchingBudget,
  compareGroup,
  className,
}: AnalyticalSliceBarProps) {
  const [unitSearch, setUnitSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');

  // Filtered unit list for popover
  const filteredUnits = useMemo(() => {
    if (!unitSearch.trim()) {
      return units;
    }

    const q = unitSearch.toLowerCase();

    return units.filter((u) => u.name.toLowerCase().includes(q));
  }, [units, unitSearch]);

  // Filtered type list for popover
  const filteredTypes = useMemo(() => {
    if (!typeSearch.trim()) {
      return needTypes;
    }

    const q = typeSearch.toLowerCase();

    return needTypes.filter((t) => t.name.toLowerCase().includes(q));
  }, [needTypes, typeSearch]);

  // Check if any filter is active
  const hasActiveFilters =
    slice.unitIds.length > 0 ||
    slice.typeIds.length > 0 ||
    slice.stages.length > 0 ||
    slice.priority !== 'all' ||
    slice.urgencies.length > 0 ||
    slice.impacts.length > 0 ||
    slice.checklistBand !== 'all' ||
    slice.attentions.length > 0;

  // Active filter count
  const activeFiltersCount =
    slice.unitIds.length +
    slice.typeIds.length +
    slice.stages.length +
    (slice.priority !== 'all' ? 1 : 0) +
    slice.urgencies.length +
    slice.impacts.length +
    (slice.checklistBand !== 'all' ? 1 : 0) +
    slice.attentions.length;

  // Generate URL for Needs List with the complete active slice
  const listUrl = useMemo(() => {
    return needRoutes.index.url({
      query: {
        need_group_id: groupId,
        stage: slice.stages.length > 0 ? slice.stages : undefined,
        organizational_unit_id:
          slice.unitIds.length > 0 ? slice.unitIds.map(String) : undefined,
        include_descendants:
          slice.unitIds.length > 0 && slice.includeDescendants
            ? '1'
            : undefined,
        need_type_id:
          slice.typeIds.length > 0 ? slice.typeIds.map(String) : undefined,
        urgency: slice.urgencies.length > 0 ? slice.urgencies : undefined,
        impact: slice.impacts.length > 0 ? slice.impacts : undefined,
        is_priority:
          slice.priority === 'priority_only'
            ? ['1']
            : slice.priority === 'non_priority'
              ? ['0']
              : undefined,
        min_checklist_score:
          slice.checklistBand === 'ready' ? ['85'] : undefined,
        attention: slice.attentions.length > 0 ? slice.attentions : undefined,
      },
    });
  }, [groupId, slice]);

  // Handlers for toggles
  const toggleUnit = (unitId: number) => {
    onSliceChange((prev) => ({
      ...prev,
      unitIds: prev.unitIds.includes(unitId)
        ? prev.unitIds.filter((id) => id !== unitId)
        : [...prev.unitIds, unitId],
    }));
  };

  const toggleType = (typeId: number) => {
    onSliceChange((prev) => ({
      ...prev,
      typeIds: prev.typeIds.includes(typeId)
        ? prev.typeIds.filter((id) => id !== typeId)
        : [...prev.typeIds, typeId],
    }));
  };

  const toggleStage = (stage: DerivedStage) => {
    onSliceChange((prev) => ({
      ...prev,
      stages: prev.stages.includes(stage)
        ? prev.stages.filter((s) => s !== stage)
        : [...prev.stages, stage],
    }));
  };

  const toggleUrgency = (u: 'high' | 'medium' | 'low') => {
    onSliceChange((prev) => ({
      ...prev,
      urgencies: prev.urgencies.includes(u)
        ? prev.urgencies.filter((item) => item !== u)
        : [...prev.urgencies, u],
    }));
  };

  const toggleImpact = (imp: 'high' | 'medium' | 'low') => {
    onSliceChange((prev) => ({
      ...prev,
      impacts: prev.impacts.includes(imp)
        ? prev.impacts.filter((item) => item !== imp)
        : [...prev.impacts, imp],
    }));
  };

  return (
    <div
      className={cn(
        'sticky top-0 z-20 flex flex-col gap-3 rounded-xl border border-border/80 bg-card/95 p-3.5 shadow-xs backdrop-blur-md transition-all',
        className,
      )}
    >
      {/* Top Bar: Title, Counters, and Primary "Buka di daftar" Link */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <RiFilterLine className="size-4 text-primary" />
            <span className="text-xs tracking-tight">
              Irisan Analitis Global
            </span>
          </div>

          {activeFiltersCount > 0 && (
            <Badge
              variant="default"
              className="h-5 px-1.5 font-mono text-[10px] font-semibold"
            >
              {activeFiltersCount} aktif
            </Badge>
          )}

          {compareGroup && (
            <Badge
              variant="outline"
              className="h-5 gap-1 border-border/80 bg-muted/40 px-2 text-[10px] font-normal"
            >
              <RiExchangeLine className="size-3 text-muted-foreground" />
              <span>
                Basis Perbandingan: {compareGroup.name} ({compareGroup.year})
              </span>
            </Badge>
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  aria-label="Informasi tingkat penguncian"
                >
                  <RiInformationLine className="size-3.5" />
                </button>
              }
            />
            <TooltipContent className="max-w-xs text-xs">
              Catatan: Tingkat penguncian (lock tier) ditentukan dinamis dan
              tidak difilter langsung.
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Match Count & Link to List */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-xs">
            <span className="text-muted-foreground">Hasil Irisan:</span>
            <span className="font-mono font-semibold text-foreground">
              {formatNumber(matchingCount)} usulan
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="font-mono font-semibold text-primary">
              {formatCompactIDR(matchingBudget)}
            </span>
          </div>

          <Link
            href={listUrl}
            className={cn(
              buttonVariants({ size: 'sm' }),
              'h-8 gap-1.5 px-3 text-xs font-medium shadow-xs',
            )}
          >
            <span>Buka di daftar</span>
            <RiArrowRightLine className="size-3.5" />
          </Link>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetSlice}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              Reset Irisan
            </Button>
          )}
        </div>
      </div>

      {/* Filter Popover Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. Unit Kerja Popover */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant={slice.unitIds.length > 0 ? 'secondary' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 cursor-pointer gap-1.5 text-xs font-normal',
                  slice.unitIds.length > 0 &&
                    'border-primary/40 font-medium text-foreground',
                )}
              >
                <RiBuildingLine className="size-3.5 text-muted-foreground" />
                <span>Unit Kerja</span>
                {slice.unitIds.length > 0 && (
                  <span className="py-0.2 ml-1 rounded-full bg-primary/20 px-1.5 font-mono text-[10px] font-semibold text-primary">
                    {slice.unitIds.length}
                  </span>
                )}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-72 p-3">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Filter Unit Kerja</span>
                {slice.unitIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      onSliceChange((prev) => ({ ...prev, unitIds: [] }))
                    }
                    className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Hapus pilihan
                  </button>
                )}
              </div>

              <div className="relative">
                <RiSearchLine className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari unit kerja..."
                  value={unitSearch}
                  onChange={(e) => setUnitSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 border-b border-border/60 pb-2 text-[11px] text-muted-foreground">
                <Checkbox
                  checked={slice.includeDescendants}
                  onCheckedChange={(checked) =>
                    onSliceChange((prev) => ({
                      ...prev,
                      includeDescendants: Boolean(checked),
                    }))
                  }
                />
                <span>Termasuk unit kerja turunan (anak unit)</span>
              </label>

              <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                {filteredUnits.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    Tidak ditemukan unit kerja
                  </p>
                ) : (
                  filteredUnits.map((unit) => {
                    const isSelected =
                      unit.unit_id !== null &&
                      slice.unitIds.includes(unit.unit_id);

                    return (
                      <div
                        key={unit.unit_id ?? 'root'}
                        onClick={() => {
                          if (unit.unit_id !== null) {
                            toggleUnit(unit.unit_id);
                          }
                        }}
                        className={cn(isSelected && 'bg-accent/70 font-medium')}
                      >
                        <span className="truncate pr-2">{unit.name}</span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                          <span>{unit.count}</span>
                          <Checkbox checked={isSelected} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 2. Kategori Kebutuhan Popover */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant={slice.typeIds.length > 0 ? 'secondary' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 cursor-pointer gap-1.5 text-xs font-normal',
                  slice.typeIds.length > 0 &&
                    'border-primary/40 font-medium text-foreground',
                )}
              >
                <RiPriceTag3Line className="size-3.5 text-muted-foreground" />
                <span>Kategori</span>
                {slice.typeIds.length > 0 && (
                  <span className="py-0.2 ml-1 rounded-full bg-primary/20 px-1.5 font-mono text-[10px] font-semibold text-primary">
                    {slice.typeIds.length}
                  </span>
                )}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-64 p-3">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">
                  Kategori Kebutuhan
                </span>
                {slice.typeIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      onSliceChange((prev) => ({ ...prev, typeIds: [] }))
                    }
                    className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Hapus
                  </button>
                )}
              </div>

              <div className="relative">
                <RiSearchLine className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari kategori..."
                  value={typeSearch}
                  onChange={(e) => setTypeSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
                {filteredTypes.map((t) => {
                  const isSelected = slice.typeIds.includes(t.type_id);

                  return (
                    <div
                      key={t.type_id}
                      onClick={() => toggleType(t.type_id)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-md p-1.5 text-xs transition-colors hover:bg-accent/50',
                        isSelected && 'bg-accent/70 font-medium',
                      )}
                    >
                      <span className="truncate pr-2">{t.name}</span>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                        <span>{t.count}</span>
                        <Checkbox checked={isSelected} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 3. Tahap Siklus Popover */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant={slice.stages.length > 0 ? 'secondary' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 cursor-pointer gap-1.5 text-xs font-normal',
                  slice.stages.length > 0 &&
                    'border-primary/40 font-medium text-foreground',
                )}
              >
                <RiTimeLine className="size-3.5 text-muted-foreground" />
                <span>Tahapan</span>
                {slice.stages.length > 0 && (
                  <span className="py-0.2 ml-1 rounded-full bg-primary/20 px-1.5 font-mono text-[10px] font-semibold text-primary">
                    {slice.stages.length}
                  </span>
                )}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-56 p-3">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold">Tahapan Siklus</span>
              <div className="flex flex-col gap-1">
                {[
                  { key: 'draft' as DerivedStage, label: 'Draft' },
                  {
                    key: 'under_review' as DerivedStage,
                    label: 'Menunggu Review',
                  },
                  {
                    key: 'approved' as DerivedStage,
                    label: 'Disetujui Direktur',
                  },
                  {
                    key: 'rejected' as DerivedStage,
                    label: 'Ditolak / Revisi',
                  },
                ].map((s) => {
                  const isChecked = slice.stages.includes(s.key);

                  return (
                    <div
                      key={s.key}
                      onClick={() => toggleStage(s.key)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-md p-1.5 text-xs hover:bg-accent/50',
                        isChecked && 'bg-accent/70 font-medium',
                      )}
                    >
                      <span>{s.label}</span>
                      <Checkbox checked={isChecked} />
                    </div>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 4. Prioritas Selector */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant={slice.priority !== 'all' ? 'secondary' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 cursor-pointer gap-1.5 text-xs font-normal',
                  slice.priority !== 'all' &&
                    'border-primary/40 font-medium text-foreground',
                )}
              >
                <RiStarLine className="size-3.5 text-muted-foreground" />
                <span>
                  {slice.priority === 'priority_only'
                    ? 'Prioritas Tinggi'
                    : slice.priority === 'non_priority'
                      ? 'Non-Prioritas'
                      : 'Prioritas'}
                </span>
              </Button>
            }
          />
          <PopoverContent align="start" className="w-48 p-2">
            <div className="flex flex-col gap-1 text-xs">
              <button
                type="button"
                onClick={() =>
                  onSliceChange((prev) => ({ ...prev, priority: 'all' }))
                }
                className={cn(
                  'cursor-pointer rounded-md p-1.5 text-left transition-colors hover:bg-accent/50',
                  slice.priority === 'all' && 'bg-accent font-medium',
                )}
              >
                Semua Usulan
              </button>
              <button
                type="button"
                onClick={() =>
                  onSliceChange((prev) => ({
                    ...prev,
                    priority: 'priority_only',
                  }))
                }
                className={cn(
                  'cursor-pointer rounded-md p-1.5 text-left transition-colors hover:bg-accent/50',
                  slice.priority === 'priority_only' &&
                    'bg-accent font-medium text-primary',
                )}
              >
                Hanya Prioritas Tinggi
              </button>
              <button
                type="button"
                onClick={() =>
                  onSliceChange((prev) => ({
                    ...prev,
                    priority: 'non_priority',
                  }))
                }
                className={cn(
                  'cursor-pointer rounded-md p-1.5 text-left transition-colors hover:bg-accent/50',
                  slice.priority === 'non_priority' && 'bg-accent font-medium',
                )}
              >
                Hanya Non-Prioritas
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* 5. Urgensi & Dampak */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant={
                  slice.urgencies.length > 0 || slice.impacts.length > 0
                    ? 'secondary'
                    : 'outline'
                }
                size="sm"
                className={cn(
                  'h-8 cursor-pointer gap-1.5 text-xs font-normal',
                  (slice.urgencies.length > 0 || slice.impacts.length > 0) &&
                    'border-primary/40 font-medium text-foreground',
                )}
              >
                <span>Urgensi & Dampak</span>
                {slice.urgencies.length + slice.impacts.length > 0 && (
                  <span className="py-0.2 ml-1 rounded-full bg-primary/20 px-1.5 font-mono text-[10px] font-semibold text-primary">
                    {slice.urgencies.length + slice.impacts.length}
                  </span>
                )}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-56 p-3">
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Urgensi
                </span>
                <div className="mt-1 flex flex-col gap-1">
                  {[
                    { key: 'high' as const, label: 'Tinggi' },
                    { key: 'medium' as const, label: 'Sedang' },
                    { key: 'low' as const, label: 'Rendah' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      onClick={() => toggleUrgency(item.key)}
                      className="flex cursor-pointer items-center justify-between rounded-md p-1 text-xs hover:bg-accent/50"
                    >
                      <span>{item.label}</span>
                      <Checkbox checked={slice.urgencies.includes(item.key)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/60 pt-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Dampak
                </span>
                <div className="mt-1 flex flex-col gap-1">
                  {[
                    { key: 'high' as const, label: 'Tinggi' },
                    { key: 'medium' as const, label: 'Sedang' },
                    { key: 'low' as const, label: 'Rendah' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      onClick={() => toggleImpact(item.key)}
                      className="flex cursor-pointer items-center justify-between rounded-md p-1 text-xs hover:bg-accent/50"
                    >
                      <span>{item.label}</span>
                      <Checkbox checked={slice.impacts.includes(item.key)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 6. Kesiapan Checklist */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant={
                  slice.checklistBand !== 'all' ? 'secondary' : 'outline'
                }
                size="sm"
                className={cn(
                  'h-8 cursor-pointer gap-1.5 text-xs font-normal',
                  slice.checklistBand !== 'all' &&
                    'border-primary/40 font-medium text-foreground',
                )}
              >
                <RiShieldCheckLine className="size-3.5 text-muted-foreground" />
                <span>
                  {slice.checklistBand === 'ready'
                    ? 'Siap (>= 85%)'
                    : slice.checklistBand === 'low'
                      ? 'Skor Rendah (< 85%)'
                      : slice.checklistBand === 'unassessed'
                        ? 'Belum Dinilai'
                        : 'Kesiapan Checklist'}
                </span>
              </Button>
            }
          />
          <PopoverContent align="start" className="w-52 p-2">
            <div className="flex flex-col gap-1 text-xs">
              <button
                type="button"
                onClick={() =>
                  onSliceChange((prev) => ({ ...prev, checklistBand: 'all' }))
                }
                className={cn(
                  'cursor-pointer rounded-md p-1.5 text-left hover:bg-accent/50',
                  slice.checklistBand === 'all' && 'bg-accent font-medium',
                )}
              >
                Semua Skor
              </button>
              <button
                type="button"
                onClick={() =>
                  onSliceChange((prev) => ({ ...prev, checklistBand: 'ready' }))
                }
                className={cn(
                  'cursor-pointer rounded-md p-1.5 text-left hover:bg-accent/50',
                  slice.checklistBand === 'ready' &&
                    'bg-accent font-medium text-success-foreground dark:text-success',
                )}
              >
                Siap Telaah (Skor &gt;= 85%)
              </button>
              <button
                type="button"
                onClick={() =>
                  onSliceChange((prev) => ({ ...prev, checklistBand: 'low' }))
                }
                className={cn(
                  'cursor-pointer rounded-md p-1.5 text-left hover:bg-accent/50',
                  slice.checklistBand === 'low' &&
                    'bg-accent font-medium text-warning-foreground dark:text-warning',
                )}
              >
                Di Bawah Target (Skor &lt; 85%)
              </button>
              <button
                type="button"
                onClick={() =>
                  onSliceChange((prev) => ({
                    ...prev,
                    checklistBand: 'unassessed',
                  }))
                }
                className={cn(
                  'cursor-pointer rounded-md p-1.5 text-left hover:bg-accent/50',
                  slice.checklistBand === 'unassessed' &&
                    'bg-accent font-medium',
                )}
              >
                Belum Dinilai (0%)
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2">
          <span className="text-[11px] font-medium text-muted-foreground">
            Irisan Aktif:
          </span>

          {/* Unit Chips */}
          {slice.unitIds.map((id) => {
            const u = units.find((item) => item.unit_id === id);

            return (
              <Badge
                key={`unit-${id}`}
                variant="secondary"
                className="gap-1 border-border/80 px-2 py-0.5 text-xs font-normal"
              >
                <span>{u?.name ?? `Unit #${id}`}</span>
                <button
                  type="button"
                  onClick={() => toggleUnit(id)}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Hapus filter unit ${u?.name}`}
                >
                  <RiCloseLine className="size-3" />
                </button>
              </Badge>
            );
          })}

          {/* Type Chips */}
          {slice.typeIds.map((id) => {
            const t = needTypes.find((item) => item.type_id === id);

            return (
              <Badge
                key={`type-${id}`}
                variant="secondary"
                className="gap-1 border-border/80 px-2 py-0.5 text-xs font-normal"
              >
                <span>{t?.name ?? `Kategori #${id}`}</span>
                <button
                  type="button"
                  onClick={() => toggleType(id)}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Hapus filter kategori ${t?.name}`}
                >
                  <RiCloseLine className="size-3" />
                </button>
              </Badge>
            );
          })}

          {/* Stage Chips */}
          {slice.stages.map((st) => {
            const labelMap: Record<string, string> = {
              draft: 'Draft',
              under_review: 'Menunggu Review',
              approved: 'Disetujui',
              rejected: 'Ditolak',
            };

            return (
              <Badge
                key={`stage-${st}`}
                variant="secondary"
                className="gap-1 border-border/80 px-2 py-0.5 text-xs font-normal"
              >
                <span>Tahap: {labelMap[st] ?? st}</span>
                <button
                  type="button"
                  onClick={() => toggleStage(st)}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Hapus filter tahap ${st}`}
                >
                  <RiCloseLine className="size-3" />
                </button>
              </Badge>
            );
          })}

          {/* Priority Chip */}
          {slice.priority !== 'all' && (
            <Badge
              variant="secondary"
              className="gap-1 border-border/80 px-2 py-0.5 text-xs font-normal"
            >
              <span>
                {slice.priority === 'priority_only'
                  ? 'Prioritas Tinggi'
                  : 'Non-Prioritas'}
              </span>
              <button
                type="button"
                onClick={() =>
                  onSliceChange((prev) => ({ ...prev, priority: 'all' }))
                }
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label="Hapus filter prioritas"
              >
                <RiCloseLine className="size-3" />
              </button>
            </Badge>
          )}

          {/* Urgency Chips */}
          {slice.urgencies.map((u) => (
            <Badge
              key={`urgency-${u}`}
              variant="secondary"
              className="gap-1 border-border/80 px-2 py-0.5 text-xs font-normal"
            >
              <span>Urgensi: {u}</span>
              <button
                type="button"
                onClick={() => toggleUrgency(u)}
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label={`Hapus filter urgensi ${u}`}
              >
                <RiCloseLine className="size-3" />
              </button>
            </Badge>
          ))}

          {/* Impact Chips */}
          {slice.impacts.map((imp) => (
            <Badge
              key={`impact-${imp}`}
              variant="secondary"
              className="gap-1 border-border/80 px-2 py-0.5 text-xs font-normal"
            >
              <span>Dampak: {imp}</span>
              <button
                type="button"
                onClick={() => toggleImpact(imp)}
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label={`Hapus filter dampak ${imp}`}
              >
                <RiCloseLine className="size-3" />
              </button>
            </Badge>
          ))}

          {/* Checklist Band Chip */}
          {slice.checklistBand !== 'all' && (
            <Badge
              variant="secondary"
              className="gap-1 border-border/80 px-2 py-0.5 text-xs font-normal"
            >
              <span>
                Checklist:{' '}
                {slice.checklistBand === 'ready'
                  ? '>= 85%'
                  : slice.checklistBand === 'low'
                    ? '< 85%'
                    : '0%'}
              </span>
              <button
                type="button"
                onClick={() =>
                  onSliceChange((prev) => ({
                    ...prev,
                    checklistBand: 'all',
                  }))
                }
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label="Hapus filter checklist"
              >
                <RiCloseLine className="size-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
