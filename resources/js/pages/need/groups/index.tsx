import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { NeedGroupCardList } from '@/features/need-group/components/need-group-card-list';
import { NeedGroupIndexDialogs } from '@/features/need-group/components/need-group-index-dialogs';
import { NeedGroupsSummaryStats } from '@/features/need-group/components/need-groups-summary-stats';
import { useNeedGroupsIndex } from '@/features/need-group/hooks/use-need-groups-index';
import type { PaginatedNeedGroups } from '@/features/need-group/types/need-group.types';
import type { DataTableFilters } from '@/hooks/use-data-table';
import needGroupRoutes from '@/routes/need-groups';

interface NeedGroupsIndexProps {
  needGroups: PaginatedNeedGroups;
  filters: DataTableFilters;
}

export default function NeedGroupsIndex({
  needGroups,
  filters,
}: NeedGroupsIndexProps) {
  const { state, actions, hasPermission, dataTable } = useNeedGroupsIndex();

  const hasItems = needGroups.data.length > 0;

  return (
    <>
      <Head title="Kelompok Usulan" />

      <div className="flex flex-col gap-6 p-4 pb-12 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Kelompok Usulan
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola daftar kelompok usulan kebutuhan tahun anggaran dan siklus
              pengajuan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasPermission('create need-groups') && (
              <Button onClick={actions.onCreate} className="gap-1.5 shadow-xs">
                <RiAddLine data-icon="inline-start" />
                Tambah Kelompok
              </Button>
            )}
          </div>
        </div>

        <NeedGroupsSummaryStats
          totalCount={needGroups.total}
          data={needGroups.data}
        />

        <div className="flex flex-col gap-4">
          <DataTableToolbar
            filters={filters}
            onSearch={dataTable.onSearch}
            onReset={dataTable.onReset}
            searchPlaceholder="Cari berdasarkan nama kelompok atau deskripsi..."
          />
        </div>

        <NeedGroupCardList
          needGroups={needGroups.data}
          hasPermission={hasPermission}
          onEdit={actions.onEdit}
          onDelete={actions.onDelete}
          onRollover={actions.onRollover}
          onCreate={actions.onCreate}
          search={filters.search}
          onReset={dataTable.onReset}
        />

        {hasItems && (
          <div className="pt-2">
            <DataTablePagination
              meta={needGroups}
              onPageChange={dataTable.onPageChange}
              onPerPageChange={dataTable.onPerPageChange}
            />
          </div>
        )}
      </div>

      <NeedGroupIndexDialogs
        isDialogOpen={state.isDialogOpen}
        onDialogOpenChange={actions.setIsDialogOpen}
        editingGroup={state.editingGroup}
        rolloverGroup={state.rolloverGroup}
        onRolloverGroupChange={actions.setRolloverGroup}
        deletingGroup={state.deletingGroup}
        onDeletingGroupChange={actions.setDeletingGroup}
        onConfirmDelete={actions.handleConfirmDelete}
        isDeleting={state.isDeleting}
      />
    </>
  );
}

NeedGroupsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Kelompok Usulan',
      href: needGroupRoutes.index.url(),
    },
  ],
};
