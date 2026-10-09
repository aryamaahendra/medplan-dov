import type {
  PlanningActivityVersion,
  PlanningVersion,
} from '@/types/planning-version';

export interface IndicatorFormState {
  id?: number;
  name: string;
  baseline: string;
  unit: string;
}

export interface ActivityVersionFormProps {
  version: PlanningVersion;
  activity?: PlanningActivityVersion;
  parents: Pick<PlanningActivityVersion, 'id' | 'name' | 'code'>[];
  activityTypes: { value: string; label: string }[];
}
