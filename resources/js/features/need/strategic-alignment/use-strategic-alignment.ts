import { useCallback, useMemo } from 'react';

import {
  normalizeId,
  toggleIndicatorItem,
  toggleKpiIndicatorItem,
  togglePlanningActivityItem,
  togglePlanningIndicatorItem,
  toggleSasaranItem,
  toggleStrategicServicePlanItem,
} from './strategic-alignment-engine';
import type {
  AlignmentFramework,
  StrategicAlignmentState,
} from './strategic-alignment-engine';
import type {
  StrategicAlignmentController,
  StrategicAlignmentFormData,
  StrategicAlignmentOptions,
} from './types';

export interface UseStrategicAlignmentProps {
  data: any;
  setData: (key: any, value?: any) => void;
  options: StrategicAlignmentOptions;
}

export function useStrategicAlignment({
  data,
  setData,
  options,
}: UseStrategicAlignmentProps): StrategicAlignmentController {
  const values: StrategicAlignmentFormData = useMemo(
    () => ({
      sasaran_ids: data.sasaran_ids ?? [],
      indicator_ids: data.indicator_ids ?? [],
      kpi_indicator_ids: data.kpi_indicator_ids ?? [],
      strategic_service_plan_ids: data.strategic_service_plan_ids ?? [],
      planning_activity_version_ids: data.planning_activity_version_ids ?? [],
      planning_activity_indicator_ids:
        data.planning_activity_indicator_ids ?? [],
    }),
    [
      data.sasaran_ids,
      data.indicator_ids,
      data.kpi_indicator_ids,
      data.strategic_service_plan_ids,
      data.planning_activity_version_ids,
      data.planning_activity_indicator_ids,
    ],
  );

  const sasaranSet = useMemo(
    () => new Set(values.sasaran_ids),
    [values.sasaran_ids],
  );
  const indicatorSet = useMemo(
    () => new Set(values.indicator_ids),
    [values.indicator_ids],
  );
  const kpiSet = useMemo(
    () => new Set(values.kpi_indicator_ids),
    [values.kpi_indicator_ids],
  );
  const planSet = useMemo(
    () => new Set(values.strategic_service_plan_ids),
    [values.strategic_service_plan_ids],
  );
  const activitySet = useMemo(
    () => new Set(values.planning_activity_version_ids),
    [values.planning_activity_version_ids],
  );
  const activityIndicatorSet = useMemo(
    () => new Set(values.planning_activity_indicator_ids),
    [values.planning_activity_indicator_ids],
  );

  const toggleSasaran = useCallback(
    (id: number | string, checked: boolean) => {
      setData((prev: any) => {
        const current: StrategicAlignmentState = {
          sasaran_ids: prev.sasaran_ids ?? [],
          indicator_ids: prev.indicator_ids ?? [],
          kpi_indicator_ids: prev.kpi_indicator_ids ?? [],
          strategic_service_plan_ids: prev.strategic_service_plan_ids ?? [],
          planning_activity_version_ids:
            prev.planning_activity_version_ids ?? [],
          planning_activity_indicator_ids:
            prev.planning_activity_indicator_ids ?? [],
        };

        const next = toggleSasaranItem(
          current,
          options.tujuans ?? [],
          id,
          checked,
        );

        return {
          ...prev,
          sasaran_ids: next.sasaran_ids,
          indicator_ids: next.indicator_ids,
        };
      });
    },
    [setData, options.tujuans],
  );

  const toggleIndicator = useCallback(
    (id: number | string, checked: boolean) => {
      setData((prev: any) => {
        const current: StrategicAlignmentState = {
          sasaran_ids: prev.sasaran_ids ?? [],
          indicator_ids: prev.indicator_ids ?? [],
          kpi_indicator_ids: prev.kpi_indicator_ids ?? [],
          strategic_service_plan_ids: prev.strategic_service_plan_ids ?? [],
          planning_activity_version_ids:
            prev.planning_activity_version_ids ?? [],
          planning_activity_indicator_ids:
            prev.planning_activity_indicator_ids ?? [],
        };

        const next = toggleIndicatorItem(current, id, checked);

        return {
          ...prev,
          indicator_ids: next.indicator_ids,
        };
      });
    },
    [setData],
  );

  const toggleKpiIndicator = useCallback(
    (id: number | string, checked: boolean) => {
      setData((prev: any) => {
        const current: StrategicAlignmentState = {
          sasaran_ids: prev.sasaran_ids ?? [],
          indicator_ids: prev.indicator_ids ?? [],
          kpi_indicator_ids: prev.kpi_indicator_ids ?? [],
          strategic_service_plan_ids: prev.strategic_service_plan_ids ?? [],
          planning_activity_version_ids:
            prev.planning_activity_version_ids ?? [],
          planning_activity_indicator_ids:
            prev.planning_activity_indicator_ids ?? [],
        };

        const next = toggleKpiIndicatorItem(current, id, checked);

        return {
          ...prev,
          kpi_indicator_ids: next.kpi_indicator_ids,
        };
      });
    },
    [setData],
  );

  const toggleStrategicServicePlan = useCallback(
    (id: number | string, checked: boolean) => {
      setData((prev: any) => {
        const current: StrategicAlignmentState = {
          sasaran_ids: prev.sasaran_ids ?? [],
          indicator_ids: prev.indicator_ids ?? [],
          kpi_indicator_ids: prev.kpi_indicator_ids ?? [],
          strategic_service_plan_ids: prev.strategic_service_plan_ids ?? [],
          planning_activity_version_ids:
            prev.planning_activity_version_ids ?? [],
          planning_activity_indicator_ids:
            prev.planning_activity_indicator_ids ?? [],
        };

        const next = toggleStrategicServicePlanItem(current, id, checked);

        return {
          ...prev,
          strategic_service_plan_ids: next.strategic_service_plan_ids,
        };
      });
    },
    [setData],
  );

  const togglePlanningActivity = useCallback(
    (id: number | string, checked: boolean) => {
      setData((prev: any) => {
        const current: StrategicAlignmentState = {
          sasaran_ids: prev.sasaran_ids ?? [],
          indicator_ids: prev.indicator_ids ?? [],
          kpi_indicator_ids: prev.kpi_indicator_ids ?? [],
          strategic_service_plan_ids: prev.strategic_service_plan_ids ?? [],
          planning_activity_version_ids:
            prev.planning_activity_version_ids ?? [],
          planning_activity_indicator_ids:
            prev.planning_activity_indicator_ids ?? [],
        };

        const next = togglePlanningActivityItem(
          current,
          options.planningActivities ?? [],
          id,
          checked,
        );

        return {
          ...prev,
          planning_activity_version_ids: next.planning_activity_version_ids,
          planning_activity_indicator_ids: next.planning_activity_indicator_ids,
        };
      });
    },
    [setData, options.planningActivities],
  );

  const togglePlanningIndicator = useCallback(
    (id: number | string, checked: boolean) => {
      setData((prev: any) => {
        const current: StrategicAlignmentState = {
          sasaran_ids: prev.sasaran_ids ?? [],
          indicator_ids: prev.indicator_ids ?? [],
          kpi_indicator_ids: prev.kpi_indicator_ids ?? [],
          strategic_service_plan_ids: prev.strategic_service_plan_ids ?? [],
          planning_activity_version_ids:
            prev.planning_activity_version_ids ?? [],
          planning_activity_indicator_ids:
            prev.planning_activity_indicator_ids ?? [],
        };

        const next = togglePlanningIndicatorItem(current, id, checked);

        return {
          ...prev,
          planning_activity_indicator_ids: next.planning_activity_indicator_ids,
        };
      });
    },
    [setData],
  );

  const isSasaranSelected = useCallback(
    (id: number | string) => sasaranSet.has(normalizeId(id)),
    [sasaranSet],
  );

  const isIndicatorSelected = useCallback(
    (id: number | string) => indicatorSet.has(normalizeId(id)),
    [indicatorSet],
  );

  const isKpiIndicatorSelected = useCallback(
    (id: number | string) => kpiSet.has(normalizeId(id)),
    [kpiSet],
  );

  const isStrategicServicePlanSelected = useCallback(
    (id: number | string) => planSet.has(normalizeId(id)),
    [planSet],
  );

  const isPlanningActivitySelected = useCallback(
    (id: number | string) => activitySet.has(normalizeId(id)),
    [activitySet],
  );

  const isPlanningIndicatorSelected = useCallback(
    (id: number | string) => activityIndicatorSet.has(normalizeId(id)),
    [activityIndicatorSet],
  );

  const isSelected = useCallback(
    (framework: AlignmentFramework, id: number | string) => {
      switch (framework) {
        case 'renstra':
          return isSasaranSelected(id) || isIndicatorSelected(id);
        case 'ikk':
          return isKpiIndicatorSelected(id);
        case 'rls':
          return isStrategicServicePlanSelected(id);
        case 'planning':
          return (
            isPlanningActivitySelected(id) || isPlanningIndicatorSelected(id)
          );
      }
    },
    [
      isSasaranSelected,
      isIndicatorSelected,
      isKpiIndicatorSelected,
      isStrategicServicePlanSelected,
      isPlanningActivitySelected,
      isPlanningIndicatorSelected,
    ],
  );

  return {
    values,
    options,
    toggleSasaran,
    toggleIndicator,
    toggleKpiIndicator,
    toggleStrategicServicePlan,
    togglePlanningActivity,
    togglePlanningIndicator,
    isSasaranSelected,
    isIndicatorSelected,
    isKpiIndicatorSelected,
    isStrategicServicePlanSelected,
    isPlanningActivitySelected,
    isPlanningIndicatorSelected,
    isSelected,
  };
}
