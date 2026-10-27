import type {
  KpiGroup,
  PlanningActivityVersion,
  StrategicServicePlan,
  Tujuan,
} from '@/types';
import type {
  AlignmentFramework,
  StrategicAlignmentState,
} from './strategic-alignment-engine';

export interface StrategicAlignmentOptions {
  tujuans?: Tujuan[];
  kpiGroups?: KpiGroup[];
  strategicServicePlans?: StrategicServicePlan[];
  planningActivities?: PlanningActivityVersion[];
}

export type StrategicAlignmentFormData = StrategicAlignmentState;

export interface StrategicAlignmentController {
  values: StrategicAlignmentFormData;
  options: StrategicAlignmentOptions;

  // Actions
  toggleSasaran: (id: number | string, checked: boolean) => void;
  toggleIndicator: (id: number | string, checked: boolean) => void;
  toggleKpiIndicator: (id: number | string, checked: boolean) => void;
  toggleStrategicServicePlan: (id: number | string, checked: boolean) => void;
  togglePlanningActivity: (id: number | string, checked: boolean) => void;
  togglePlanningIndicator: (id: number | string, checked: boolean) => void;

  // Query helpers
  isSasaranSelected: (id: number | string) => boolean;
  isIndicatorSelected: (id: number | string) => boolean;
  isKpiIndicatorSelected: (id: number | string) => boolean;
  isStrategicServicePlanSelected: (id: number | string) => boolean;
  isPlanningActivitySelected: (id: number | string) => boolean;
  isPlanningIndicatorSelected: (id: number | string) => boolean;
  isSelected: (framework: AlignmentFramework, id: number | string) => boolean;
}
