import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { KpiIndicator } from '../columns';

interface IkkAlignmentSectionProps {
  data: any;
  setData: (key: string | ((prev: any) => any), value?: any) => void;
  errors: any;
  kpiGroups: any[];
}

export function IkkAlignmentSection({
  data,
  setData,
  errors,
  kpiGroups,
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
}: {
  group: any;
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
}) {
  const rootIndicators = group.indicators.filter(
    (i: KpiIndicator) => !i.parent_indicator_id,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium tracking-wider uppercase">
          Grup: {group.name} ({group.start_year} - {group.end_year})
        </h4>
      </div>
      <div className="grid gap-4 border-l border-dashed pl-4">
        {rootIndicators.map((indicator: KpiIndicator) => (
          <KpiIndicatorItem
            key={indicator.id}
            indicator={indicator}
            allIndicators={group.indicators}
            selectedIds={selectedIds}
            onToggle={onToggle}
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
}: {
  indicator: KpiIndicator;
  allIndicators: KpiIndicator[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
}) {
  const children = allIndicators.filter(
    (i) => i.parent_indicator_id === indicator.id,
  );
  const isSelected = selectedIds.includes(indicator.id.toString());

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
        <div className="grid gap-1.5 leading-none">
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
