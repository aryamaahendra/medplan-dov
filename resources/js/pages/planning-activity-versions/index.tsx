import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import PlanningActivityVersionController from '@/actions/App/Http/Controllers/PlanningActivityVersionController';
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
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

  const handleEdit = useCallback((activity: PlanningActivityVersion) => {
    setSelectedActivity(activity);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((activity: PlanningActivityVersion) => {
    setSelectedActivity(activity);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = () => {
    if (!selectedActivity) {
      return;
    }

    router.delete(
      PlanningActivityVersionController.destroy.url(selectedActivity.id),
      {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          toast.success('Aktivitas berhasil dihapus!');
        },
      },
    );
  };

  const columns = useMemo(
    () => getColumns(version, handleEdit, handleDelete),
    [version, handleEdit, handleDelete],
  );

  const years = Array.from({ length: 5 }, (_, i) => version.fiscal_year + i);

  return (
    <>
      <Head title={`Snapshot: ${version.name}`} />

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {version.name}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Tahun Anggaran {version.fiscal_year}</span>
                <span>•</span>
                <Badge variant="outline">Revisi {version.revision_no}</Badge>
                {version.is_current && <Badge> Utama </Badge>}
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              setSelectedActivity(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus />
            Tambah Aktivitas
          </Button>
        </div>

        <div className="mt-6">
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
            customThead={
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead rowSpan={2} className="w-[50px] border-r">
                    Aksi
                  </TableHead>
                  <TableHead rowSpan={2} className="w-px border-r">
                    Kode
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="min-w-[300px] border-r text-foreground"
                  >
                    Nomenklatur
                  </TableHead>
                  <TableHead rowSpan={2} className="w-[150px] border-r">
                    Baseline
                  </TableHead>
                  {years.map((year) => (
                    <TableHead
                      key={year}
                      colSpan={2}
                      className="border-r text-center font-bold text-foreground"
                    >
                      {year}
                    </TableHead>
                  ))}
                </TableRow>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  {years.map((year) => (
                    <Fragment key={year}>
                      <TableHead className="w-[120px] border-r text-center text-[10px] font-bold">
                        TARGET
                      </TableHead>
                      <TableHead className="w-[140px] border-r text-center text-[10px] font-bold">
                        PAGU
                      </TableHead>
                    </Fragment>
                  ))}
                </TableRow>
              </TableHeader>
            }
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
