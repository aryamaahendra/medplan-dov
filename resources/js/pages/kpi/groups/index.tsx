import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';
import { useMemo } from 'react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { getColumns } from '@/features/kpi-group/components/kpi-group-columns';
import { KpiGroupDialog } from '@/features/kpi-group/components/kpi-group-dialog';
import { useKpiGroupsIndex } from '@/features/kpi-group/hooks/use-kpi-groups-index';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import groupRoutes from '@/routes/kpis/groups';
import type { KpiGroup } from '@/types';

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
  const { state, handlers, dataTable } = useKpiGroupsIndex();

  const columns = useMemo(
    () =>
      getColumns(
        handlers.onEdit,
        handlers.onDelete,
        handlers.onActivate,
        state.isActivating,
        hasPermission,
      ),
    [handlers, state.isActivating, hasPermission],
  );

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
            <Button onClick={handlers.onCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah Periode
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={groups.data}
          meta={groups}
          filters={filters}
          onSearch={dataTable.onSearch}
          onSort={dataTable.onSort}
          onPageChange={dataTable.onPageChange}
          onPerPageChange={dataTable.onPerPageChange}
          onReset={dataTable.onReset}
          searchPlaceholder="Cari periode..."
        />
      </div>

      <KpiGroupDialog
        key={state.editingGroup?.id ?? 'new'}
        open={state.dialogOpen}
        onOpenChange={handlers.setDialogOpen}
        group={state.editingGroup}
      />

      <ConfirmDialog
        open={!!state.deletingGroup}
        onOpenChange={(open) => !open && handlers.setDeletingGroup(null)}
        onConfirm={handlers.handleConfirmDelete}
        title="Hapus Periode KPI"
        description={`Apakah Anda yakin ingin menghapus "${state.deletingGroup?.name}"? Seluruh indikator di dalamnya juga akan terhapus.`}
        confirmText="Hapus"
        variant="destructive"
        loading={state.isDeleting}
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
