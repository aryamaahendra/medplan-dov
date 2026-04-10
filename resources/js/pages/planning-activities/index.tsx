import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import PlanningActivityController from '@/actions/App/Http/Controllers/PlanningActivityController';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import planningActivities from '@/routes/planning-activities';
import type { PlanningActivity } from '@/types/planning-activity';

import { getColumns } from './columns';
import { PlanningActivityDialog } from './planning-activity-dialog';

interface PaginatedActivities {
  data: PlanningActivity[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface PlanningActivitiesIndexProps {
  activities: PaginatedActivities;
  parents: Pick<PlanningActivity, 'id' | 'name' | 'type'>[];
  filters: DataTableFilters;
}

export default function PlanningActivitiesIndex({
  activities,
  parents,
  filters,
}: PlanningActivitiesIndexProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<PlanningActivity | null>(null);

  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({
      only: ['activities', 'filters'],
    });

  const handleEdit = (activity: PlanningActivity) => {
    setSelectedActivity(activity);
    setDialogOpen(true);
  };

  const handleDelete = (activity: PlanningActivity) => {
    if (confirm('Apakah Anda yakin ingin menghapus nomenklatur ini?')) {
      router.delete(
        PlanningActivityController.destroy.url({
          planning_activity: activity.id,
        }),
        {
          onSuccess: () => toast.success('Nomenklatur berhasil dihapus'),
        },
      );
    }
  };

  const columns = useMemo(() => getColumns(handleEdit, handleDelete), []);

  return (
    <>
      <Head title="Nomenklatur Perencanaan" />

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Nomenklatur Perencanaan
            </h1>
            <p className="text-muted-foreground">
              Kelola hirarki Program, Kegiatan, Sub Kegiatan, dan Output.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedActivity(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Nomenklatur
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={activities.data}
          meta={activities}
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Cari kode atau nama..."
        />

        <PlanningActivityDialog
          activity={selectedActivity}
          parents={parents}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </>
  );
}

PlanningActivitiesIndex.layout = {
  breadcrumbs: [
    {
      title: 'Nomenklatur Perencanaan',
      href: planningActivities.index.url(),
    },
  ],
};
