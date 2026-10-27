import { Head } from '@inertiajs/react';

import { DataTable } from '@/components/data-table/data-table';
import { DeleteActivityDialog } from '@/features/planning-activity-version/components/delete-activity-dialog';
import { PlanningActivityHeader } from '@/features/planning-activity-version/components/planning-activity-header';
import { PlanningActivityTableHeader } from '@/features/planning-activity-version/components/planning-activity-table-header';
import { usePlanningActivityVersionsIndex } from '@/features/planning-activity-version/hooks/use-planning-activity-versions-index';
import type { DataTableFilters } from '@/hooks/use-data-table';
import planningVersions from '@/routes/planning-versions';
import type {
  PlanningActivityVersion,
  PlanningVersion,
} from '@/types/planning-version';

interface PaginatedActivities {
  data: PlanningActivityVersion[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface PlanningActivityVersionsIndexProps {
  version: PlanningVersion;
  activities: PaginatedActivities;
  filters: DataTableFilters;
}

export default function PlanningActivityVersionsIndex({
  version,
  activities,
  filters,
}: PlanningActivityVersionsIndexProps) {
  const {
    hasPermission,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isRecalculating,
    selectedActivity,
    confirmDelete,
    handleRecalculate,
    columns,
    years,
    dataTable,
  } = usePlanningActivityVersionsIndex(version);

  return (
    <>
      <Head title={`Snapshot: ${version.name}`} />

      <div className="flex flex-col gap-4 p-4">
        <PlanningActivityHeader
          version={version}
          hasPermission={hasPermission}
          isRecalculating={isRecalculating}
          onRecalculate={handleRecalculate}
        />

        <div className="mt-6">
          <DataTable
            columns={columns}
            data={activities.data}
            meta={activities}
            filters={filters}
            {...dataTable}
            searchPlaceholder="Cari nomenklatur..."
            customThead={
              <PlanningActivityTableHeader
                baselineYear={version.year_start - 1}
                years={years}
              />
            }
          />
        </div>
      </div>

      <DeleteActivityDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        activity={selectedActivity}
        onConfirm={confirmDelete}
      />
    </>
  );
}

PlanningActivityVersionsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Versi Perencanaan',
      href: planningVersions.index.url(),
    },
    {
      title: 'Snapshot Aktivitas',
    },
  ],
};
