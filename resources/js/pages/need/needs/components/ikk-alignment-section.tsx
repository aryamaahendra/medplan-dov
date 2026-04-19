import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { KpiIndicator } from '@/types';

interface IkkAlignmentSectionProps {
  data: any;
  setData: (key: string | ((prev: any) => any), value?: any) => void;
  errors: any;
  kpiGroups: any[];
  year: number;
}

export function IkkAlignmentSection({
  data,
  setData,
  errors,
  kpiGroups,
  year,
}: IkkAlignmentSectionProps) {
  const handleKpiIndicatorToggle = (indicatorId: string, checked: boolean) => {
    setData((prev: any) => ({
      ...prev,
      kpi_indicator_ids: checked
        ? [...prev.kpi_indicator_ids, indicatorId]
        : prev.kpi_indicator_ids.filter((id: string) => id !== indicatorId),
    }));
  };

  const ikkErrors = errors.kpi_indicator_ids;

  return (
    <div className="space-y-6">
      {ikkErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kesalahan Validasi</AlertTitle>
          <AlertDescription>{ikkErrors}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-10 overflow-y-auto pt-2 pr-2 pb-6">
        <div className="space-y-6 pl-1">
          {kpiGroups.map((group) => (
            <KpiGroupSection
              key={group.id}
              group={group}
              selectedIds={data.kpi_indicator_ids}
              onToggle={handleKpiIndicatorToggle}
              year={year}
            />
          ))}
          {kpiGroups.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              Tidak ada grup KPI aktif saat ini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiGroupSection({
  group,
  selectedIds,
  onToggle,
  year,
}: {
  group: any;
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  year: number;
}) {
  const rootIndicators = group.indicators.filter(
    (i: KpiIndicator) => !i.parent_indicator_id,
  );
  const isOutOfRange = year < group.start_year || year > group.end_year;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium tracking-wider uppercase">
          Grup: {group.name} ({group.start_year} - {group.end_year})
        </h4>
        {isOutOfRange && (
          <span className="text-xs font-medium text-destructive">
            (Siklus pengukuran di luar tahun {year})
          </span>
        )}
      </div>
      <div className="grid gap-4 border-l border-dashed pl-4">
        {rootIndicators.map((indicator: KpiIndicator) => (
          <KpiIndicatorItem
            key={indicator.id}
            indicator={indicator}
            allIndicators={group.indicators}
            selectedIds={selectedIds}
            onToggle={onToggle}
            year={year}
          />
        ))}
      </div>
    </div>
  );
}

function KpiIndicatorItem({
  indicator,
  allIndicators,
  selectedIds,
  onToggle,
  year,
}: {
  indicator: KpiIndicator;
  allIndicators: KpiIndicator[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  year: number;
}) {
  const children = allIndicators.filter(
    (i) => i.parent_indicator_id === indicator.id,
  );
  const isSelected = selectedIds.includes(indicator.id.toString());
  const targetForYear = indicator.annual_targets?.find(
    (t: any) => t.year === year,
  );

  return (
    <div className="space-y-3">
      <div className="group flex items-start space-x-3">
        {!indicator.is_category && (
          <Checkbox
            id={`kpi-${indicator.id}`}
            checked={isSelected}
            onCheckedChange={(checked) =>
              onToggle(indicator.id.toString(), !!checked)
            }
            className="mt-1"
          />
        )}
        <div className="mt-1 grid gap-1.5 leading-none">
          <Label
            htmlFor={`kpi-${indicator.id}`}
            className={cn(
              'text-sm leading-normal transition-colors',
              indicator.is_category
                ? 'font-medium tracking-wider uppercase'
                : 'cursor-pointer font-medium',
              isSelected
                ? 'text-primary'
                : indicator.is_category
                  ? 'text-foreground'
                  : '',
            )}
          >
            {indicator.name}
            {indicator.unit && (
              <span className="ml-1 font-normal">({indicator.unit})</span>
            )}
          </Label>
          {!indicator.is_category && (
            <div className="mt-0.5">
              {targetForYear ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-[10px] font-medium text-muted-foreground/70 uppercase">
                    Target {year}:
                  </span>
                  <span className="font-medium text-foreground">
                    {targetForYear.target_value || '-'}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-medium text-destructive italic">
                  (Target tahun {year} tidak tersedia)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {children.length > 0 && (
        <div className="grid gap-3 border-l border-dashed pt-1 pl-4">
          {children.map((child) => (
            <KpiIndicatorItem
              key={child.id}
              indicator={child}
              allIndicators={allIndicators}
              selectedIds={selectedIds}
              onToggle={onToggle}
              year={year}
            />
          ))}
        </div>
      )}
    </div>
  );
}
