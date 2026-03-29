import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import renstraRoutes from '@/routes/renstras';
import type { Renstra } from '@/types';

import { getColumns } from './columns';
import { RenstraDialog } from './renstra-dialog';

interface PaginatedRenstras {
  data: Renstra[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface RenstrasIndexProps {
  renstras: PaginatedRenstras;
  filters: DataTableFilters;
}

export default function RenstrasIndex({
  renstras,
  filters,
}: RenstrasIndexProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRenstra, setEditingRenstra] = useState<Renstra | null>(null);
  const [deletingRenstra, setDeletingRenstra] = useState<Renstra | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({ only: ['renstras', 'filters'] });

  const onEdit = (renstra: Renstra) => {
    setEditingRenstra(renstra);
    setDialogOpen(true);
  };

  const onCreate = () => {
    setEditingRenstra(null);
    setDialogOpen(true);
  };

  const onDelete = (renstra: Renstra) => {
    setDeletingRenstra(renstra);
  };

  const handleConfirmDelete = () => {
    if (!deletingRenstra) {
      return;
    }

    setIsDeleting(true);

    router.delete(renstraRoutes.destroy.url({ renstra: deletingRenstra.id }), {
      onSuccess: () => {
        toast.success('Renstra berhasil dihapus.');
        setDeletingRenstra(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  };

  const stableColumns = useMemo(() => getColumns(onEdit, onDelete), []);

  return (
    <>
      <Head title="Manajemen Renstra" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Rencana Strategis (Renstra)
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola data rencana strategis instansi. Hanya satu renstra yang
              dapat aktif di satu waktu.
            </p>
          </div>
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            Tambah Renstra
          </Button>
        </div>

        <DataTable
          columns={stableColumns}
          data={renstras.data}
          meta={renstras}
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Cari renstra..."
        />
      </div>

      <RenstraDialog
        key={editingRenstra?.id ?? 'new'}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        renstra={editingRenstra}
      />

      <ConfirmDialog
        open={!!deletingRenstra}
        onOpenChange={(open) => !open && setDeletingRenstra(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Renstra"
        description={`Apakah Anda yakin ingin menghapus "${deletingRenstra?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}

RenstrasIndex.layout = {
  breadcrumbs: [
    {
      title: 'Manajemen Renstra',
      href: renstraRoutes.index.url(),
    },
  ],
};
