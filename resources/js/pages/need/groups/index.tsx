import { Head, router } from '@inertiajs/react';
import { RiAddLine, RiFolderChartLine } from '@remixicon/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import needGroupRoutes from '@/routes/need-groups';

import type { NeedGroup } from './columns';
import { BulkRolloverDialog } from './components/bulk-rollover-dialog';
import { NeedGroupCard } from './components/need-group-card';
import { NeedGroupsSummaryStats } from './components/need-groups-summary-stats';
import { NeedGroupDialog } from './need-group-dialog';

interface PaginatedNeedGroups {
  data: NeedGroup[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface NeedGroupsIndexProps {
  needGroups: PaginatedNeedGroups;
  filters: DataTableFilters;
}

export default function NeedGroupsIndex({
  needGroups,
  filters,
}: NeedGroupsIndexProps) {
  const { hasPermission } = usePermission();
  const [editingGroup, setEditingGroup] = useState<NeedGroup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<NeedGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rolloverGroup, setRolloverGroup] = useState<NeedGroup | null>(null);

  const { onSearch, onPageChange, onPerPageChange, onReset } = useDataTable({
    only: ['needGroups', 'filters'],
  });

  const onEdit = (group: NeedGroup) => {
    setEditingGroup(group);
    setIsDialogOpen(true);
  };

  const onDelete = (group: NeedGroup) => {
    setDeletingGroup(group);
  };

  const onRollover = (group: NeedGroup) => {
    setRolloverGroup(group);
  };

  const onCreate = () => {
    setEditingGroup(null);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingGroup) {
      return;
    }

    setIsDeleting(true);

    router.delete(
      needGroupRoutes.destroy.url({ need_group: deletingGroup.id }),
      {
        onSuccess: () => {
          toast.success('Kelompok usulan berhasil dihapus.');
          setDeletingGroup(null);
        },
        onFinish: () => setIsDeleting(false),
      },
    );
  };

  const hasItems = needGroups.data.length > 0;

  return (
    <>
      <Head title="Kelompok Usulan" />

      <div className="flex flex-col gap-6 p-4 pb-12 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Kelompok Usulan
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola daftar kelompok usulan kebutuhan tahun anggaran dan siklus
              pengajuan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasPermission('create need-groups') && (
              <Button onClick={onCreate} className="gap-1.5 shadow-xs">
                <RiAddLine data-icon="inline-start" />
                Tambah Kelompok
              </Button>
            )}
          </div>
        </div>

        {/* Aggregated KPI Summary Header */}
        <NeedGroupsSummaryStats
          totalCount={needGroups.total}
          data={needGroups.data}
        />

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col gap-4">
          <DataTableToolbar
            filters={filters}
            onSearch={onSearch}
            onReset={onReset}
            searchPlaceholder="Cari berdasarkan nama kelompok atau deskripsi..."
          />
        </div>

        {/* Full-Width Telemetry Pipeline Card List */}
        {hasItems ? (
          <div className="flex w-full flex-col gap-4">
            {needGroups.data.map((group) => (
              <NeedGroupCard
                key={group.id}
                group={group}
                onEdit={onEdit}
                onDelete={onDelete}
                hasPermission={hasPermission}
                onRollover={onRollover}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <RiFolderChartLine className="size-7" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
              Tidak Ada Kelompok Usulan
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              {filters.search
                ? `Tidak ditemukan kelompok usulan yang cocok dengan kata kunci "${filters.search}". Silakan coba kata kunci lain.`
                : 'Belum ada kelompok usulan yang terdaftar. Tambahkan kelompok usulan pertama untuk memulai.'}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {filters.search ? (
                <Button variant="outline" size="sm" onClick={onReset}>
                  Reset Pencarian
                </Button>
              ) : (
                hasPermission('create need-groups') && (
                  <Button size="sm" onClick={onCreate}>
                    <RiAddLine data-icon="inline-start" />
                    Tambah Kelompok
                  </Button>
                )
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {hasItems && (
          <div className="pt-2">
            <DataTablePagination
              meta={needGroups}
              onPageChange={onPageChange}
              onPerPageChange={onPerPageChange}
            />
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <NeedGroupDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        needGroup={editingGroup}
      />

      <BulkRolloverDialog
        open={!!rolloverGroup}
        onOpenChange={(open) => !open && setRolloverGroup(null)}
        needGroup={rolloverGroup}
      />

      <ConfirmDialog
        open={!!deletingGroup}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kelompok Usulan"
        description={`Apakah Anda yakin ingin menghapus "${deletingGroup?.name}"? Data usulan di dalam kelompok ini juga akan terdampak.`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
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
