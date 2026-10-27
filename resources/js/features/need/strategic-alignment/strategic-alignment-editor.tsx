import { RiErrorWarningLine } from '@remixicon/react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type {
  KpiGroup,
  KpiIndicator,
  PlanningActivityVersion,
  Sasaran,
  StrategicServicePlan,
  Tujuan,
} from '@/types';
import type { AlignmentFramework } from './strategic-alignment-engine';
import type { StrategicAlignmentController } from './types';

export interface StrategicAlignmentEditorProps {
  framework: AlignmentFramework;
  controller: StrategicAlignmentController;
  year?: number;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function StrategicAlignmentEditor({
  framework,
  controller,
  year = new Date().getFullYear(),
  errors = {},
  disabled = false,
}: StrategicAlignmentEditorProps) {
  switch (framework) {
    case 'renstra':
      return (
        <RenstraAlignmentEditor
          controller={controller}
          year={year}
          errors={errors}
          disabled={disabled}
        />
      );
    case 'ikk':
      return (
        <IkkAlignmentEditor
          controller={controller}
          year={year}
          errors={errors}
          disabled={disabled}
        />
      );
    case 'rls':
      return (
        <RlsAlignmentEditor
          controller={controller}
          errors={errors}
          disabled={disabled}
        />
      );
    case 'planning':
      return (
        <PlanningAlignmentEditor
          controller={controller}
          year={year}
          errors={errors}
          disabled={disabled}
        />
      );
  }
}

// ---------------------------------------------------------------------------
// 1. Renstra Alignment Editor
// ---------------------------------------------------------------------------

function RenstraAlignmentEditor({
  controller,
  year,
  errors,
  disabled,
}: {
  controller: StrategicAlignmentController;
  year: number;
  errors: Record<string, string>;
  disabled: boolean;
}) {
  const renstraErrors = errors?.sasaran_ids || errors?.indicator_ids;
  const tujuans = controller.options.tujuans ?? [];

  return (
    <div className="space-y-6">
      {renstraErrors && (
        <Alert variant="destructive">
          <RiErrorWarningLine className="h-4 w-4" />
          <AlertTitle>Kesalahan Validasi</AlertTitle>
          <AlertDescription>{renstraErrors}</AlertDescription>
        </Alert>
      )}

      <div className="pt-2 pr-2 pb-6">
        <div className="space-y-8 pl-1">
          {tujuans.map((tujuan) => (
            <TujuanGroup
              key={tujuan.id}
              tujuan={tujuan}
              controller={controller}
              year={year}
              disabled={disabled}
            />
          ))}
          {tujuans.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              Tidak ada data Tujuan Renstra yang aktif.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TujuanGroup({
  tujuan,
  controller,
  year,
  disabled,
}: {
  tujuan: Tujuan;
  controller: StrategicAlignmentController;
  year: number;
  disabled: boolean;
}) {
  const sasarans = tujuan.sasarans || [];

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {tujuan.name}
        </h3>
        {tujuan.description && (
          <p className="text-xs text-muted-foreground">{tujuan.description}</p>
        )}
      </div>

      <div className="grid gap-4 border-l border-border/60 pl-4">
        {sasarans.map((sasaran) => (
          <SasaranItem
            key={sasaran.id}
            sasaran={sasaran}
            controller={controller}
            year={year}
            disabled={disabled}
          />
        ))}
        {sasarans.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            Belum ada Sasaran untuk Tujuan ini.
          </p>
        )}
      </div>
    </div>
  );
}

function SasaranItem({
  sasaran,
  controller,
  year,
  disabled,
}: {
  sasaran: Sasaran;
  controller: StrategicAlignmentController;
  year: number;
  disabled: boolean;
}) {
  const isSasaranChecked = controller.isSasaranSelected(sasaran.id);
  const indicators = sasaran.indicators || [];

  return (
    <div className="space-y-3">
      <div className="group flex items-start space-x-3">
        <Checkbox
          id={`sasaran-${sasaran.id}`}
          checked={isSasaranChecked}
          disabled={disabled}
          onCheckedChange={(checked) =>
            controller.toggleSasaran(sasaran.id, !!checked)
          }
          className="mt-1"
        />
        <div className="mt-1 grid gap-1.5 leading-none">
          <Label
            htmlFor={`sasaran-${sasaran.id}`}
            className={cn(
              'cursor-pointer text-sm leading-normal font-medium transition-colors',
              isSasaranChecked
                ? 'font-semibold text-foreground'
                : 'text-muted-foreground group-hover:text-foreground',
            )}
          >
            {sasaran.name}
          </Label>
        </div>
      </div>

      <div
        className={cn(
          'grid gap-3 border-l border-dashed pt-1 pl-4',
          !isSasaranChecked && 'pointer-events-none opacity-50',
        )}
      >
        {indicators.map((indicator) => (
          <IndicatorItem
            key={indicator.id}
            indicator={indicator}
            isIndicatorChecked={controller.isIndicatorSelected(indicator.id)}
            onToggle={(checked) =>
              controller.toggleIndicator(indicator.id, checked)
            }
            year={year}
            disabled={disabled || !isSasaranChecked}
          />
        ))}
        {indicators.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            Belum ada Indikator untuk Sasaran ini.
          </p>
        )}
      </div>
    </div>
  );
}

function IndicatorItem({
  indicator,
  isIndicatorChecked,
  onToggle,
  year,
  disabled,
}: {
  indicator: any;
  isIndicatorChecked: boolean;
  onToggle: (checked: boolean) => void;
  year: number;
  disabled: boolean;
}) {
  const targetForYear = indicator.targets?.find((t: any) => t.year === year);

  return (
    <div className="group/indicator flex items-start space-x-3">
      <Checkbox
        id={`indicator-${indicator.id}`}
        checked={isIndicatorChecked}
        disabled={disabled}
        onCheckedChange={(checked) => onToggle(!!checked)}
        className="mt-1"
      />
      <div className="mt-1 grid gap-1.5 leading-none">
        <Label
          htmlFor={`indicator-${indicator.id}`}
          className={cn(
            'cursor-pointer text-sm leading-normal font-medium transition-colors',
            isIndicatorChecked
              ? 'text-foreground'
              : 'text-muted-foreground group-hover/indicator:text-foreground',
          )}
        >
          {indicator.name}
        </Label>
        <div className="mt-0.5">
          {targetForYear ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-xss font-medium text-muted-foreground/70 uppercase">
                Target {year}:
              </span>
              <span className="font-medium text-foreground">
                {targetForYear.target || '-'}
              </span>
            </div>
          ) : (
            <span className="text-xss font-medium text-destructive italic">
              (Target tahun {year} tidak tersedia)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. IKK Alignment Editor
// ---------------------------------------------------------------------------

function IkkAlignmentEditor({
  controller,
  year,
  errors,
  disabled,
}: {
  controller: StrategicAlignmentController;
  year: number;
  errors: Record<string, string>;
  disabled: boolean;
}) {
  const ikkErrors = errors?.kpi_indicator_ids;
  const kpiGroups = controller.options.kpiGroups ?? [];

  return (
    <div className="space-y-6">
      {ikkErrors && (
        <Alert variant="destructive">
          <RiErrorWarningLine className="h-4 w-4" />
          <AlertTitle>Kesalahan Validasi</AlertTitle>
          <AlertDescription>{ikkErrors}</AlertDescription>
        </Alert>
      )}

      <div className="pt-2 pr-2 pb-6">
        <div className="space-y-8 pl-1">
          {kpiGroups.map((group) => (
            <KpiGroupSection
              key={group.id}
              group={group}
              controller={controller}
              year={year}
              disabled={disabled}
            />
          ))}
          {kpiGroups.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              Tidak ada Indikator Kinerja Kunci (IKK) yang aktif.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiGroupSection({
  group,
  controller,
  year,
  disabled,
}: {
  group: KpiGroup;
  controller: StrategicAlignmentController;
  year: number;
  disabled: boolean;
}) {
  const allIndicators = group.indicators || [];
  const rootIndicators = allIndicators.filter((i) => !i.parent_indicator_id);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {group.name}
        </h3>
        {group.description && (
          <p className="text-xs text-muted-foreground">{group.description}</p>
        )}
      </div>

      <div className="grid gap-4 border-l border-border/60 pl-4">
        {rootIndicators.map((indicator) => (
          <KpiIndicatorItem
            key={indicator.id}
            indicator={indicator}
            allIndicators={allIndicators}
            controller={controller}
            year={year}
            disabled={disabled}
          />
        ))}
        {rootIndicators.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            Belum ada indikator untuk grup ini.
          </p>
        )}
      </div>
    </div>
  );
}

function KpiIndicatorItem({
  indicator,
  allIndicators,
  controller,
  year,
  disabled,
}: {
  indicator: KpiIndicator;
  allIndicators: KpiIndicator[];
  controller: StrategicAlignmentController;
  year: number;
  disabled: boolean;
}) {
  const children = allIndicators.filter(
    (i) => i.parent_indicator_id === indicator.id,
  );
  const isSelected = controller.isKpiIndicatorSelected(indicator.id);
  const targetForYear = (indicator as any).annual_targets?.find(
    (t: any) => t.year === year,
  );

  return (
    <div className="space-y-3">
      <div className="group flex items-start space-x-3">
        {!indicator.is_category && (
          <Checkbox
            id={`kpi-${indicator.id}`}
            checked={isSelected}
            disabled={disabled}
            onCheckedChange={(checked) =>
              controller.toggleKpiIndicator(indicator.id, !!checked)
            }
            className="mt-1"
          />
        )}
        <div className="mt-1 grid gap-1.5 leading-none">
          <Label
            htmlFor={indicator.is_category ? undefined : `kpi-${indicator.id}`}
            className={cn(
              'text-sm leading-normal transition-colors',
              indicator.is_category
                ? 'font-medium tracking-wider uppercase'
                : 'cursor-pointer font-medium',
              isSelected
                ? 'font-semibold text-foreground'
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
                  <span className="text-xss font-medium text-muted-foreground/70 uppercase">
                    Target {year}:
                  </span>
                  <span className="font-medium text-foreground">
                    {targetForYear.target_value || '-'}
                  </span>
                </div>
              ) : (
                <span className="text-xss font-medium text-destructive italic">
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
              controller={controller}
              year={year}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. RLS Alignment Editor
// ---------------------------------------------------------------------------

function RlsAlignmentEditor({
  controller,
  errors,
  disabled,
}: {
  controller: StrategicAlignmentController;
  errors: Record<string, string>;
  disabled: boolean;
}) {
  const rlsErrors = errors?.strategic_service_plan_ids;
  const strategicServicePlans = controller.options.strategicServicePlans ?? [];

  return (
    <div className="space-y-6">
      {rlsErrors && (
        <Alert variant="destructive">
          <RiErrorWarningLine className="h-4 w-4" />
          <AlertTitle>Kesalahan Validasi</AlertTitle>
          <AlertDescription>{rlsErrors}</AlertDescription>
        </Alert>
      )}

      <div className="pt-2 pr-2 pb-6">
        <div className="grid gap-2 pl-1">
          {strategicServicePlans.map((plan) => (
            <StrategicPlanItem
              key={plan.id}
              plan={plan}
              isChecked={controller.isStrategicServicePlanSelected(plan.id)}
              onToggle={(checked) =>
                controller.toggleStrategicServicePlan(plan.id, checked)
              }
              disabled={disabled}
            />
          ))}
          {strategicServicePlans.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              Tidak ada rencana pengembangan layanan strategis.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StrategicPlanItem({
  plan,
  isChecked,
  onToggle,
  disabled,
}: {
  plan: StrategicServicePlan;
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className="group flex items-start space-x-3 rounded-lg border border-transparent p-2 transition-colors hover:border-muted-foreground/10 hover:bg-muted/30">
      <Checkbox
        id={`plan-${plan.id}`}
        checked={isChecked}
        disabled={disabled}
        onCheckedChange={(checked) => onToggle(!!checked)}
        className="mt-1"
      />
      <div className="grid gap-1 leading-none">
        <Label
          htmlFor={`plan-${plan.id}`}
          className="cursor-pointer text-sm leading-normal font-medium"
        >
          {plan.strategic_program}
        </Label>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {plan.service_plan}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Planning Alignment Editor
// ---------------------------------------------------------------------------

function PlanningAlignmentEditor({
  controller,
  year,
  errors,
  disabled,
}: {
  controller: StrategicAlignmentController;
  year: number;
  errors: Record<string, string>;
  disabled: boolean;
}) {
  const planningErrors =
    errors?.planning_activity_version_ids ||
    errors?.planning_activity_indicator_ids;
  const planningActivities = controller.options.planningActivities ?? [];

  return (
    <div className="space-y-6">
      {planningErrors && (
        <Alert variant="destructive">
          <RiErrorWarningLine className="h-4 w-4" />
          <AlertTitle>Kesalahan Validasi</AlertTitle>
          <AlertDescription>{planningErrors}</AlertDescription>
        </Alert>
      )}

      <div className="pt-2 pr-2 pb-6">
        <div className="space-y-8 pl-1">
          {planningActivities.map((activity) => (
            <ActivityGroup
              key={activity.id}
              activity={activity}
              controller={controller}
              level={0}
              year={year}
              disabled={disabled}
            />
          ))}
          {planningActivities.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              Tidak ada data Perencanaan Renja yang aktif.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityGroup({
  activity,
  controller,
  level,
  year,
  disabled,
}: {
  activity: PlanningActivityVersion;
  controller: StrategicAlignmentController;
  level: number;
  year: number;
  disabled: boolean;
}) {
  const isChecked = controller.isPlanningActivitySelected(activity.id);
  const planningVersion = (activity as any).planning_version;
  const isOutOfRange =
    level === 0 &&
    planningVersion &&
    (year < planningVersion.year_start || year > planningVersion.year_end);
  const targetForYear = (activity as any).activity_years?.find(
    (a: any) => a.year === year,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id={`activity-${activity.id}`}
          checked={isChecked}
          disabled={disabled}
          onCheckedChange={(checked) =>
            controller.togglePlanningActivity(activity.id, !!checked)
          }
          className="mt-1"
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor={`activity-${activity.id}`}
            className={cn(
              'cursor-pointer text-sm leading-normal transition-colors hover:underline',
              isChecked ? 'font-medium' : 'font-normal',
              level === 0 && 'text-xs font-semibold tracking-wider uppercase',
            )}
          >
            <span className="font-semibold text-foreground">
              {activity.type ? `${activity.type}: ` : ''}
              {activity.full_code ? `${activity.full_code} ` : ''}
              {activity.name}
            </span>
          </Label>
          {level === 0 && isOutOfRange && (
            <span className="mt-0.5 block text-xss font-medium text-destructive">
              (Renja di luar jangkauan tahun {planningVersion?.year_start} -{' '}
              {planningVersion?.year_end})
            </span>
          )}
          {targetForYear && (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="text-xss font-medium text-muted-foreground/70 uppercase">
                  Target {year}:
                </span>
                <span className="font-medium text-foreground">
                  {targetForYear.target || '-'}
                </span>
              </span>
              {targetForYear.budget && (
                <span className="flex items-center gap-1.5">
                  <span className="text-xss font-medium text-muted-foreground/70 uppercase">
                    Pagu:
                  </span>
                  <span className="font-medium text-foreground">
                    {formatIDR(targetForYear.budget)}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          'ml-2 grid gap-4 border-l border-dashed pl-4',
          !isChecked && 'pointer-events-none opacity-50',
        )}
      >
        {activity.indicators && activity.indicators.length > 0 && (
          <div className="grid gap-3">
            {activity.indicators.map((indicator: any) => {
              const indicatorTarget = indicator.activity_years?.find(
                (a: any) => a.year === year,
              );
              const isIndicatorChecked = controller.isPlanningIndicatorSelected(
                indicator.id,
              );

              return (
                <div
                  key={indicator.id}
                  className="group/indicator flex items-start space-x-3"
                >
                  <Checkbox
                    id={`activity-indicator-${indicator.id}`}
                    checked={isIndicatorChecked}
                    disabled={disabled || !isChecked}
                    onCheckedChange={(checked) =>
                      controller.togglePlanningIndicator(
                        indicator.id,
                        !!checked,
                      )
                    }
                    className="mt-1"
                  />
                  <div className="mt-1 grid gap-1.5 leading-none">
                    <Label
                      htmlFor={`activity-indicator-${indicator.id}`}
                      className="cursor-pointer text-sm leading-normal font-medium text-foreground transition-colors hover:underline"
                    >
                      {indicator.name}
                    </Label>
                    <div className="mt-0.5">
                      {indicatorTarget ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="text-xss font-medium text-muted-foreground/70 uppercase">
                            Target {year}:
                          </span>
                          <span className="font-medium text-foreground">
                            {indicatorTarget.target || '-'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xss font-medium text-destructive italic">
                          (Target tahun {year} tidak tersedia)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activity.children && activity.children.length > 0 && (
          <div className="grid gap-6">
            {activity.children.map((child) => (
              <ActivityGroup
                key={child.id}
                activity={child}
                controller={controller}
                level={level + 1}
                year={year}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
