import { Head, router } from '@inertiajs/react';
import { List, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table/data-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { useDataTable } from '@/hooks/use-data-table';
import planningVersions from '@/routes/planning-versions';
import type {
  PlanningActivityVersion,
  PlanningVersion,
} from '@/types/planning-version';

import { ActivityVersionDialog } from './activity-version-dialog';
import { getColumns } from './columns';

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
  parents: Pick<PlanningActivityVersion, 'id' | 'name' | 'type'>[];
}

export default function PlanningActivityVersionsIndex({
  version,
  activities,
  filters,
  parents,
}: PlanningActivityVersionsIndexProps) {
  const { onSearch, onSort, onReset, onPageChange, onPerPageChange } =
    useDataTable({
      only: ['activities', 'filters'],
    });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<PlanningActivityVersion | null>(null);

  const handleEdit = (activity: PlanningActivityVersion) => {
    setSelectedActivity(activity);
    setIsDialogOpen(true);
  };

  const handleDelete = (activity: PlanningActivityVersion) => {
    setSelectedActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedActivity) {
      return;
    }

    router.delete(
      route('planning-versions.activities.destroy', selectedActivity.id),
      {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          toast.success('Aktivitas berhasil dihapus!');
        },
      },
    );
  };

  const columns = useMemo(
    () => getColumns(version, activities.data, handleEdit, handleDelete),
    [version, activities.data],
  );

  return (
    <>
      <Head title={`Snapshot: ${version.name}`} />

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <List className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {version.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Tahun Anggaran {version.fiscal_year}</span>
                <span>•</span>
                <Badge variant="outline" className="h-5 text-[10px]">
                  Revisi {version.revision_no}
                </Badge>
                {version.is_current && (
                  <Badge className="h-5 bg-emerald-500 text-[10px]">
                    {' '}
                    Utama{' '}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              setSelectedActivity(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Aktivitas
          </Button>
        </div>

        <div className="rounded-md border bg-card">
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
            searchPlaceholder="Cari nomenklatur..."
          />
        </div>
      </div>

      <ActivityVersionDialog
        version={version}
        activity={selectedActivity}
        parents={parents}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus aktivitas{' '}
              <span className="font-bold text-foreground">
                {selectedActivity?.name}
              </span>{' '}
              beserta seluruh data target dan anggaran tahunannya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus Aktivitas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
