import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import groupRoutes from '@/routes/kpis/groups';
import type { KpiGroup } from '@/types';

import { getColumns } from './columns';
import { KpiGroupDialog } from './components/kpi-group-dialog';

interface PaginatedKpiGroups {
  data: KpiGroup[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface KpiGroupsIndexProps {
  groups: PaginatedKpiGroups;
  filters: DataTableFilters;
}

export default function KpiGroupsIndex({
  groups,
  filters,
}: KpiGroupsIndexProps) {
  const { hasPermission } = usePermission();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<KpiGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<KpiGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({ only: ['groups', 'filters'] });

  const onEdit = (group: KpiGroup) => {
    setEditingGroup(group);
    setDialogOpen(true);
  };

  const onCreate = () => {
    setEditingGroup(null);
    setDialogOpen(true);
  };

  const onDelete = (group: KpiGroup) => {
    setDeletingGroup(group);
  };

  const onActivate = (group: KpiGroup) => {
    setIsActivating(true);
    router.post(
      groupRoutes.activate.url({ group: group.id }),
      {},
      {
        onSuccess: () => {
          toast.success(`Periode KPI "${group.name}" diaktifkan.`);
        },
        onFinish: () => setIsActivating(false),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingGroup) {
      return;
    }

    setIsDeleting(true);

    router.delete(groupRoutes.destroy.url({ group: deletingGroup.id }), {
      onSuccess: () => {
        toast.success('Periode KPI berhasil dihapus.');
        setDeletingGroup(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  };

  return (
    <>
      <Head title="Manajemen Periode KPI" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Periode Perencanaan KPI
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola periode perencanaan target indikator kinerja (KPI). Hanya
              satu periode yang dapat aktif di satu waktu.
            </p>
          </div>
          {hasPermission('create kpi-groups') && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4" />
              Tambah Periode
            </Button>
          )}
        </div>

        <DataTable
          columns={useMemo(
            () =>
              getColumns(
                onEdit,
                onDelete,
                onActivate,
                isActivating,
                hasPermission,
              ),
            [isActivating, hasPermission],
          )}
          data={groups.data}
          meta={groups}
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Cari periode..."
        />
      </div>

      <KpiGroupDialog
        key={editingGroup?.id ?? 'new'}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editingGroup}
      />

      <ConfirmDialog
        open={!!deletingGroup}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Periode KPI"
        description={`Apakah Anda yakin ingin menghapus "${deletingGroup?.name}"? Seluruh indikator di dalamnya juga akan terhapus.`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}

KpiGroupsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Manajemen KPI',
    },
    {
      title: 'Periode',
      href: groupRoutes.index.url(),
    },
  ],
};
