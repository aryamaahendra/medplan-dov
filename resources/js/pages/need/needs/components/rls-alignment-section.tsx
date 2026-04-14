import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { StrategicServicePlan } from '../columns';

interface RlsAlignmentSectionProps {
  data: any;
  setData: (key: string | ((prev: any) => any), value?: any) => void;
  errors: any;
  strategicServicePlans: StrategicServicePlan[];
}

export function RlsAlignmentSection({
  data,
  setData,
  errors,
  strategicServicePlans,
}: RlsAlignmentSectionProps) {
  const handleStrategicPlanToggle = (planId: string, checked: boolean) => {
    setData((prev: any) => ({
      ...prev,
      strategic_service_plan_ids: checked
        ? [...prev.strategic_service_plan_ids, planId]
        : prev.strategic_service_plan_ids.filter((id: string) => id !== planId),
    }));
  };

  const rlsErrors = errors.strategic_service_plan_ids;

  return (
    <div className="space-y-6">
      {rlsErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
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
              isChecked={data.strategic_service_plan_ids.includes(
                plan.id.toString(),
              )}
              onToggle={handleStrategicPlanToggle}
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
          className={cn('cursor-pointer text-sm leading-normal')}
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
