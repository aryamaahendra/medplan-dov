import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import needGroupRoutes from '@/routes/need-groups';

import { getColumns } from './columns';
import type { NeedGroup } from './columns';
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
  const [editingGroup, setEditingGroup] = useState<NeedGroup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<NeedGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({ only: ['needGroups', 'filters'] });

  const onEdit = (group: NeedGroup) => {
    setEditingGroup(group);
    setIsDialogOpen(true);
  };

  const onDelete = (group: NeedGroup) => {
    setDeletingGroup(group);
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

  const stableColumns = useMemo(() => getColumns(onEdit, onDelete), []);

  return (
    <>
      <Head title="Kelompok Usulan" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Kelompok Usulan
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola kelompok usulan kebutuhan per tahun anggaran.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingGroup(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus />
            Tambah Kelompok
          </Button>
        </div>

        <DataTable
          columns={stableColumns}
          data={needGroups.data}
          meta={needGroups}
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Cari berdasarkan nama atau deskripsi..."
        />
      </div>

      <NeedGroupDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        needGroup={editingGroup}
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
