import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PlanningActivityVersion } from '../columns';
import { formatCurrency } from '../columns';

interface PlanningAlignmentSectionProps {
  data: any;
  setData: (key: string | ((prev: any) => any), value?: any) => void;
  errors: any;
  planningActivities: any[];
  year: number;
}

export function PlanningAlignmentSection({
  data,
  setData,
  errors,
  planningActivities,
  year,
}: PlanningAlignmentSectionProps) {
  const handleActivityToggle = (activityId: string, checked: boolean) => {
    setData((prev: any) => {
      const newActivityIds = checked
        ? [...prev.planning_activity_version_ids, activityId]
        : prev.planning_activity_version_ids.filter(
            (id: string) => id !== activityId,
          );

      // If unchecking, also remove indicators belonging to this activity
      let newIndicatorIds = [...prev.planning_activity_indicator_ids];

      if (!checked) {
        // Flat list of all indicators for this activity (we'd need recursive search otherwise)
        // For simplicity, let's just find it in the current tree level
        const findActivity = (
          activities: PlanningActivityVersion[],
        ): PlanningActivityVersion | undefined => {
          for (const a of activities) {
            if (a.id.toString() === activityId) {
              return a;
            }

            if (a.children) {
              const found = findActivity(a.children);

              if (found) {
                return found;
              }
            }
          }

          return undefined;
        };

        const activity = findActivity(planningActivities);

        if (activity?.indicators) {
          const indicatorIdsToRemove = activity.indicators.map((i) =>
            i.id.toString(),
          );
          newIndicatorIds = newIndicatorIds.filter(
            (id) => !indicatorIdsToRemove.includes(id),
          );
        }
      }

      return {
        ...prev,
        planning_activity_version_ids: newActivityIds,
        planning_activity_indicator_ids: newIndicatorIds,
      };
    });
  };

  const handleIndicatorToggle = (indicatorId: string, checked: boolean) => {
    setData((prev: any) => ({
      ...prev,
      planning_activity_indicator_ids: checked
        ? [...prev.planning_activity_indicator_ids, indicatorId]
        : prev.planning_activity_indicator_ids.filter(
            (id: string) => id !== indicatorId,
          ),
    }));
  };

  const planningErrors =
    errors.planning_activity_version_ids ||
    errors.planning_activity_indicator_ids;

  return (
    <div className="space-y-6">
      {planningErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
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
              activityIds={data.planning_activity_version_ids}
              indicatorIds={data.planning_activity_indicator_ids}
              onActivityToggle={handleActivityToggle}
              onIndicatorToggle={handleIndicatorToggle}
              level={0}
              year={year}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ActivityGroupProps {
  activity: PlanningActivityVersion;
  activityIds: string[];
  indicatorIds: string[];
  onActivityToggle: (id: string, checked: boolean) => void;
  onIndicatorToggle: (id: string, checked: boolean) => void;
  level: number;
  year: number;
}

function ActivityGroup({
  activity,
  activityIds,
  indicatorIds,
  onActivityToggle,
  onIndicatorToggle,
  level,
  year,
}: ActivityGroupProps) {
  const isChecked = activityIds.includes(activity.id.toString());
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
          onCheckedChange={(checked) =>
            onActivityToggle(activity.id.toString(), !!checked)
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
            <span className="mt-0.5 block text-[10px] font-medium text-destructive">
              (Renja di luar jangkauan tahun {planningVersion?.year_start} -{' '}
              {planningVersion?.year_end})
            </span>
          )}
          {targetForYear && (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground/70 uppercase">
                  Target {year}:
                </span>
                <span className="font-medium text-foreground">
                  {targetForYear.target || '-'}
                </span>
              </span>
              {targetForYear.budget && (
                <span className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground/70 uppercase">
                    Pagu:
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(targetForYear.budget)}
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
        {/* Indicators at this level */}
        {activity.indicators && activity.indicators.length > 0 && (
          <div className="grid gap-3">
            {activity.indicators.map((indicator: any) => {
              const indicatorTarget = indicator.activity_years?.find(
                (a: any) => a.year === year,
              );

              return (
                <div
                  key={indicator.id}
                  className="group/indicator flex items-start space-x-3"
                >
                  <Checkbox
                    id={`activity-indicator-${indicator.id}`}
                    checked={indicatorIds.includes(indicator.id.toString())}
                    onCheckedChange={(checked) =>
                      onIndicatorToggle(indicator.id.toString(), !!checked)
                    }
                    className="mt-1"
                  />
                  <div className="mt-1 grid gap-1.5 leading-none">
                    <Label
                      htmlFor={`activity-indicator-${indicator.id}`}
                      className="cursor-pointer text-sm leading-normal font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {indicator.name}
                    </Label>
                    <div className="mt-0.5">
                      {indicatorTarget ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="text-[10px] font-medium text-muted-foreground/70 uppercase">
                            Target {year}:
                          </span>
                          <span className="font-medium text-foreground">
                            {indicatorTarget.target || '-'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium text-destructive italic">
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

        {/* Child Activities */}
        {activity.children && activity.children.length > 0 && (
          <div className="grid gap-6">
            {activity.children.map((child) => (
              <ActivityGroup
                key={child.id}
                activity={child}
                activityIds={activityIds}
                indicatorIds={indicatorIds}
                onActivityToggle={onActivityToggle}
                onIndicatorToggle={onIndicatorToggle}
                level={level + 1}
                year={year}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
