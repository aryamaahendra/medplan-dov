import { router } from '@inertiajs/react';
import { useState } from 'react';

import type {
  DashboardGroupOption,
  NeedsDashboardPayload,
} from '@/types/needs-dashboard';

export function useExecutiveDashboard(
  dashboardPayload?: NeedsDashboardPayload,
) {
  const [compareGroupId, setCompareGroupId] = useState<number | null>(null);

  const handleGroupSelect = (group: DashboardGroupOption) => {
    router.visit(
      `/dashboard/executive?need_group_id=${group.id}${compareGroupId ? `&compare_group_id=${compareGroupId}` : ''}`,
      {
        preserveState: true,
      },
    );
  };

  const handleCompareGroupChange = (groupId: number | null) => {
    setCompareGroupId(groupId);
    const currentGroupId = dashboardPayload?.currentGroup?.id;
    router.visit(
      `/dashboard/executive?${currentGroupId ? `need_group_id=${currentGroupId}` : ''}${groupId ? `&compare_group_id=${groupId}` : ''}`,
      { preserveState: true },
    );
  };

  return {
    state: {
      compareGroupId,
    },
    handlers: {
      setCompareGroupId,
      handleGroupSelect,
      handleCompareGroupChange,
    },
  };
}
