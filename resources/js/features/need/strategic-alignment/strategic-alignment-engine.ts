/**
 * Strategic Alignment Engine
 *
 * Pure domain state transitions, hierarchical cascading, and parent-child
 * pruning algorithms for multi-framework Strategic Alignment (Renstra, IKK, RLS, Planning Activities).
 */

export interface StrategicAlignmentState {
  sasaran_ids: string[];
  indicator_ids: string[];
  kpi_indicator_ids: string[];
  strategic_service_plan_ids: string[];
  planning_activity_version_ids: string[];
  planning_activity_indicator_ids: string[];
}

export type AlignmentFramework = 'renstra' | 'ikk' | 'rls' | 'planning';

export interface IndicatorLike {
  id: number | string;
  name?: string;
}

export interface SasaranLike {
  id: number | string;
  name?: string;
  indicators?: IndicatorLike[];
}

export interface TujuanLike {
  id: number | string;
  name?: string;
  sasarans?: SasaranLike[];
}

export interface PlanningActivityLike {
  id: number | string;
  indicators?: IndicatorLike[];
  children?: PlanningActivityLike[];
}

/**
 * Normalizes an identifier to a string representation.
 */
export function normalizeId(id: number | string): string {
  return String(id);
}

/**
 * Toggles a Sasaran selection.
 * When unchecked, all indicators belonging to this Sasaran are automatically pruned from indicator_ids.
 */
export function toggleSasaranItem(
  current: StrategicAlignmentState,
  tujuans: TujuanLike[],
  sasaranId: number | string,
  checked: boolean,
): StrategicAlignmentState {
  const targetId = normalizeId(sasaranId);
  const newSasaranIds = checked
    ? Array.from(new Set([...current.sasaran_ids, targetId]))
    : current.sasaran_ids.filter((id) => id !== targetId);

  let newIndicatorIds = [...current.indicator_ids];

  if (!checked) {
    const matchedSasaran = tujuans
      .flatMap((t) => t.sasarans ?? [])
      .find((s) => normalizeId(s.id) === targetId);

    if (matchedSasaran?.indicators) {
      const idsToRemove = new Set(
        matchedSasaran.indicators.map((i) => normalizeId(i.id)),
      );
      newIndicatorIds = newIndicatorIds.filter((id) => !idsToRemove.has(id));
    }
  }

  return {
    ...current,
    sasaran_ids: newSasaranIds,
    indicator_ids: newIndicatorIds,
  };
}

/**
 * Toggles a Renstra Indicator selection.
 */
export function toggleIndicatorItem(
  current: StrategicAlignmentState,
  indicatorId: number | string,
  checked: boolean,
): StrategicAlignmentState {
  const targetId = normalizeId(indicatorId);
  const newIndicatorIds = checked
    ? Array.from(new Set([...current.indicator_ids, targetId]))
    : current.indicator_ids.filter((id) => id !== targetId);

  return {
    ...current,
    indicator_ids: newIndicatorIds,
  };
}

/**
 * Toggles a KPI (IKK) Indicator selection.
 */
export function toggleKpiIndicatorItem(
  current: StrategicAlignmentState,
  indicatorId: number | string,
  checked: boolean,
): StrategicAlignmentState {
  const targetId = normalizeId(indicatorId);
  const newKpiIndicatorIds = checked
    ? Array.from(new Set([...current.kpi_indicator_ids, targetId]))
    : current.kpi_indicator_ids.filter((id) => id !== targetId);

  return {
    ...current,
    kpi_indicator_ids: newKpiIndicatorIds,
  };
}

/**
 * Toggles a Strategic Service Plan (RLS) selection.
 */
export function toggleStrategicServicePlanItem(
  current: StrategicAlignmentState,
  planId: number | string,
  checked: boolean,
): StrategicAlignmentState {
  const targetId = normalizeId(planId);
  const newPlanIds = checked
    ? Array.from(new Set([...current.strategic_service_plan_ids, targetId]))
    : current.strategic_service_plan_ids.filter((id) => id !== targetId);

  return {
    ...current,
    strategic_service_plan_ids: newPlanIds,
  };
}

/**
 * Recursively locates a Planning Activity node within a hierarchical activity forest.
 */
export function findPlanningActivity(
  activities: PlanningActivityLike[],
  activityId: string,
): PlanningActivityLike | undefined {
  for (const activity of activities) {
    if (normalizeId(activity.id) === activityId) {
      return activity;
    }

    if (activity.children && activity.children.length > 0) {
      const found = findPlanningActivity(activity.children, activityId);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

/**
 * Collects all indicator IDs belonging to an activity and its recursive descendants.
 */
export function collectDescendantIndicatorIds(
  activity: PlanningActivityLike,
): string[] {
  const ids: string[] = [];

  if (activity.indicators) {
    for (const indicator of activity.indicators) {
      ids.push(normalizeId(indicator.id));
    }
  }

  if (activity.children) {
    for (const child of activity.children) {
      ids.push(...collectDescendantIndicatorIds(child));
    }
  }

  return ids;
}

/**
 * Toggles a Planning Activity selection.
 * When unchecked, all indicators belonging to this activity and its descendant activities are pruned.
 */
export function togglePlanningActivityItem(
  current: StrategicAlignmentState,
  activities: PlanningActivityLike[],
  activityId: number | string,
  checked: boolean,
): StrategicAlignmentState {
  const targetId = normalizeId(activityId);
  const newActivityIds = checked
    ? Array.from(new Set([...current.planning_activity_version_ids, targetId]))
    : current.planning_activity_version_ids.filter((id) => id !== targetId);

  let newIndicatorIds = [...current.planning_activity_indicator_ids];

  if (!checked) {
    const matched = findPlanningActivity(activities, targetId);

    if (matched) {
      const idsToRemove = new Set(collectDescendantIndicatorIds(matched));
      newIndicatorIds = newIndicatorIds.filter((id) => !idsToRemove.has(id));
    }
  }

  return {
    ...current,
    planning_activity_version_ids: newActivityIds,
    planning_activity_indicator_ids: newIndicatorIds,
  };
}

/**
 * Toggles a Planning Activity Indicator selection.
 */
export function togglePlanningIndicatorItem(
  current: StrategicAlignmentState,
  indicatorId: number | string,
  checked: boolean,
): StrategicAlignmentState {
  const targetId = normalizeId(indicatorId);
  const newIndicatorIds = checked
    ? Array.from(
        new Set([...current.planning_activity_indicator_ids, targetId]),
      )
    : current.planning_activity_indicator_ids.filter((id) => id !== targetId);

  return {
    ...current,
    planning_activity_indicator_ids: newIndicatorIds,
  };
}

/**
 * Groups a Need's sasarans by their parent Tujuan for structured Renstra display tables.
 */
export function groupRenstraSasaransByTujuan<
  T extends { id: number; tujuan?: any; indicators?: any[] },
>(sasarans?: T[]): any[] {
  if (!sasarans || sasarans.length === 0) {
    return [];
  }

  const map = new Map<number, any>();

  for (const sasaran of sasarans) {
    const tujuan = sasaran.tujuan;

    if (!tujuan) {
      continue;
    }

    if (!map.has(tujuan.id)) {
      map.set(tujuan.id, { ...tujuan, sasarans: [] });
    }

    map.get(tujuan.id).sasarans.push(sasaran);
  }

  return Array.from(map.values());
}
