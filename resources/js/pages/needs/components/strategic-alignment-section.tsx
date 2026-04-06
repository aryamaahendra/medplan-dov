import { AlertCircle, CheckCircle2, Component, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type {
  Indicator,
  KpiIndicator,
  Sasaran,
  StrategicServicePlan,
  Tujuan,
} from '../columns';

interface StrategicAlignmentSectionProps {
  data: any;
  setData: (key: string | ((prev: any) => any), value?: any) => void;
  errors: any;
  tujuans: Tujuan[];
  kpiGroups: any[];
  strategicServicePlans: StrategicServicePlan[];
}

export function StrategicAlignmentSection({
  data,
  setData,
  errors,
  tujuans,
  kpiGroups,
  strategicServicePlans,
}: StrategicAlignmentSectionProps) {
  const handleSasaranToggle = (sasaranId: string, checked: boolean) => {
    setData((prev: any) => {
      const newSasaranIds = checked
        ? [...prev.sasaran_ids, sasaranId]
        : prev.sasaran_ids.filter((id: string) => id !== sasaranId);

      // If unchecking, also remove indicators belonging to this sasaran
      let newIndicatorIds = [...prev.indicator_ids];

      if (!checked) {
        // Find all indicators that belong to this sasaran
        const sasaran = tujuans
          .flatMap((t) => t.sasarans)
          .find((s) => s.id.toString() === sasaranId);

        if (sasaran?.indicators) {
          const indicatorIdsToRemove = sasaran.indicators.map((i) =>
            i.id.toString(),
          );
          newIndicatorIds = newIndicatorIds.filter(
            (id) => !indicatorIdsToRemove.includes(id),
          );
        }
      }

      return {
        ...prev,
        sasaran_ids: newSasaranIds,
        indicator_ids: newIndicatorIds,
      };
    });
  };

  const handleIndicatorToggle = (indicatorId: string, checked: boolean) => {
    setData((prev: any) => ({
      ...prev,
      indicator_ids: checked
        ? [...prev.indicator_ids, indicatorId]
        : prev.indicator_ids.filter((id: string) => id !== indicatorId),
    }));
  };

  const handleKpiIndicatorToggle = (indicatorId: string, checked: boolean) => {
    setData((prev: any) => ({
      ...prev,
      kpi_indicator_ids: checked
        ? [...prev.kpi_indicator_ids, indicatorId]
        : prev.kpi_indicator_ids.filter((id: string) => id !== indicatorId),
    }));
  };

  const handleStrategicPlanToggle = (planId: string, checked: boolean) => {
    setData((prev: any) => ({
      ...prev,
      strategic_service_plan_ids: checked
        ? [...prev.strategic_service_plan_ids, planId]
        : prev.strategic_service_plan_ids.filter((id: string) => id !== planId),
    }));
  };

  return (
    <div className="space-y-8 pt-6">
      {(errors.sasaran_ids ||
        errors.indicator_ids ||
        errors.kpi_indicator_ids ||
        errors.strategic_service_plan_ids) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kesalahan Validasi</AlertTitle>
          <AlertDescription>
            {errors.sasaran_ids ||
              errors.indicator_ids ||
              errors.kpi_indicator_ids ||
              errors.strategic_service_plan_ids}
          </AlertDescription>
        </Alert>
      )}

      <div className="custom-scrollbar max-h-[60vh] space-y-10 overflow-y-auto pr-2 pb-6">
        {/* Renstra Alignment */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Component className="h-5 w-5" />
            <h3 className="text-sm font-bold tracking-widest uppercase">
              Penyelarasan Renstra
            </h3>
          </div>
          <div className="space-y-8 pl-1">
            {tujuans.map((tujuan) => (
              <TujuanGroup
                key={tujuan.id}
                tujuan={tujuan}
                sasaranIds={data.sasaran_ids}
                indicatorIds={data.indicator_ids}
                onSasaranToggle={handleSasaranToggle}
                onIndicatorToggle={handleIndicatorToggle}
              />
            ))}
          </div>
        </section>

        <Separator />

        {/* KPI Alignment */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="text-sm font-bold tracking-widest uppercase">
              Penyelarasan KPI
            </h3>
          </div>
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
        </section>

        <Separator />

        {/* Strategic Service Plan Alignment */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            <h3 className="text-sm font-bold tracking-widest uppercase">
              Rencana Pelayanan Strategis
            </h3>
          </div>
          <div className="grid gap-3 pl-1">
            {strategicServicePlans.map((plan) => (
              <StrategicPlanItem
                key={plan.id}
                plan={plan}
                isChecked={data.strategic_service_plan_ids.includes(
                  plan.id.toString(),
                )}
                onToggle={handleStrategicPlanToggle}
              />
            ))}
            {strategicServicePlans.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                Tidak ada rencana pelayanan strategis.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// Renstra Components
interface TujuanGroupProps {
  tujuan: Tujuan;
  sasaranIds: string[];
  indicatorIds: string[];
  onSasaranToggle: (id: string, checked: boolean) => void;
  onIndicatorToggle: (id: string, checked: boolean) => void;
}

function TujuanGroup({
  tujuan,
  sasaranIds,
  indicatorIds,
  onSasaranToggle,
  onIndicatorToggle,
}: TujuanGroupProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Tujuan: {tujuan.name}
        </h4>
      </div>

      <div className="ml-2 grid gap-6 border-l-2 border-muted pl-6">
        {tujuan.sasarans.map((sasaran) => (
          <SasaranItem
            key={sasaran.id}
            sasaran={sasaran}
            isSasaranChecked={sasaranIds.includes(sasaran.id.toString())}
            indicatorIds={indicatorIds}
            onSasaranToggle={onSasaranToggle}
            onIndicatorToggle={onIndicatorToggle}
          />
        ))}
      </div>
    </div>
  );
}

interface SasaranItemProps {
  sasaran: Sasaran;
  isSasaranChecked: boolean;
  indicatorIds: string[];
  onSasaranToggle: (id: string, checked: boolean) => void;
  onIndicatorToggle: (id: string, checked: boolean) => void;
}

function SasaranItem({
  sasaran,
  isSasaranChecked,
  indicatorIds,
  onSasaranToggle,
  onIndicatorToggle,
}: SasaranItemProps) {
  return (
    <div className="space-y-3">
      <div className="group flex items-start space-x-3">
        <Checkbox
          id={`sasaran-${sasaran.id}`}
          checked={isSasaranChecked}
          onCheckedChange={(checked) =>
            onSasaranToggle(sasaran.id.toString(), !!checked)
          }
          className="mt-1"
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor={`sasaran-${sasaran.id}`}
            className={cn(
              'cursor-pointer text-sm leading-normal font-medium transition-colors',
              isSasaranChecked
                ? 'text-foreground'
                : 'text-muted-foreground group-hover:text-foreground',
            )}
          >
            Sasaran: {sasaran.name}
          </Label>
        </div>
      </div>

      {isSasaranChecked &&
        sasaran.indicators &&
        sasaran.indicators.length > 0 && (
          <div className="ml-7 grid animate-in gap-3 pt-1 duration-200 fade-in slide-in-from-left-2">
            <div className="grid gap-3">
              {sasaran.indicators.map((indicator) => (
                <IndicatorItem
                  key={indicator.id}
                  indicator={indicator}
                  isIndicatorChecked={indicatorIds.includes(
                    indicator.id.toString(),
                  )}
                  onIndicatorToggle={onIndicatorToggle}
                />
              ))}
            </div>
          </div>
        )}

      {isSasaranChecked &&
        (!sasaran.indicators || sasaran.indicators.length === 0) && (
          <p className="ml-7 text-[11px] text-muted-foreground italic">
            Tidak ada indikator untuk sasaran ini.
          </p>
        )}
    </div>
  );
}

function IndicatorItem({
  indicator,
  isIndicatorChecked,
  onIndicatorToggle,
}: {
  indicator: Indicator;
  isIndicatorChecked: boolean;
  onIndicatorToggle: (id: string, checked: boolean) => void;
}) {
  return (
    <div className="group/indicator flex items-start space-x-3">
      <Checkbox
        id={`indicator-${indicator.id}`}
        checked={isIndicatorChecked}
        onCheckedChange={(checked) =>
          onIndicatorToggle(indicator.id.toString(), !!checked)
        }
        className="mt-1"
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor={`indicator-${indicator.id}`}
          className={cn(
            'cursor-pointer text-sm leading-normal font-normal transition-colors',
            isIndicatorChecked
              ? 'text-foreground'
              : 'text-muted-foreground group-hover/indicator:text-foreground',
          )}
        >
          Indikator: {indicator.name}
        </Label>
      </div>
    </div>
  );
}

// KPI Components
function KpiGroupSection({
  group,
  selectedIds,
  onToggle,
}: {
  group: any;
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
}) {
  // Sort indicators to handle hierarchy (simple flat list for now, but respecting is_category)
  const rootIndicators = group.indicators.filter(
    (i: KpiIndicator) => !i.parent_indicator_id,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Grup: {group.name} ({group.start_year} - {group.end_year})
        </h4>
      </div>
      <div className="ml-2 grid gap-4 border-l-2 border-muted pl-6">
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
                ? 'font-bold text-foreground'
                : 'cursor-pointer font-medium',
              isSelected
                ? 'text-primary'
                : indicator.is_category
                  ? 'text-foreground'
                  : 'text-muted-foreground group-hover:text-foreground',
            )}
          >
            {indicator.name}
            {indicator.unit && (
              <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                ({indicator.unit})
              </span>
            )}
          </Label>
        </div>
      </div>

      {children.length > 0 && (
        <div className="ml-6 grid gap-3 border-l border-muted/50 pt-1 pl-4">
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

// Strategic Plan Components
function StrategicPlanItem({
  plan,
  isChecked,
  onToggle,
}: {
  plan: StrategicServicePlan;
  isChecked: boolean;
  onToggle: (id: string, checked: boolean) => void;
}) {
  return (
    <div className="group flex items-start space-x-3 rounded-lg border border-transparent p-2 transition-colors hover:border-muted-foreground/10 hover:bg-muted/30">
      <Checkbox
        id={`plan-${plan.id}`}
        checked={isChecked}
        onCheckedChange={(checked) => onToggle(plan.id.toString(), !!checked)}
        className="mt-1"
      />
      <div className="grid gap-1 leading-none">
        <Label
          htmlFor={`plan-${plan.id}`}
          className={cn(
            'cursor-pointer text-sm leading-normal font-medium transition-colors',
            isChecked
              ? 'text-foreground'
              : 'text-muted-foreground group-hover:text-foreground',
          )}
        >
          {plan.strategic_program}
        </Label>
        <p className="line-clamp-2 text-[11px] text-muted-foreground">
          {plan.service_plan}
        </p>
      </div>
    </div>
  );
}
