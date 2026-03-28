import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import needRoutes from '@/routes/needs';

import { getColumns } from './columns';
import type { Need } from './columns';
import { NeedDialog } from './need-dialog';

interface PaginatedNeeds {
  data: Need[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface NeedsIndexProps {
  needs: PaginatedNeeds;
  organizationalUnits: { id: number; name: string }[];
  needTypes: { id: number; name: string }[];
  filters: DataTableFilters;
}

export default function NeedsIndex({
  needs,
  organizationalUnits,
  needTypes,
  filters,
}: NeedsIndexProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState<Need | null>(null);
  const [deletingNeed, setDeletingNeed] = useState<Need | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({ only: ['needs', 'filters'] });

  const onEdit = (need: Need) => {
    setEditingNeed(need);
    setDialogOpen(true);
  };

  const onCreate = () => {
    setEditingNeed(null);
    setDialogOpen(true);
  };

  const onDelete = (need: Need) => {
    setDeletingNeed(need);
  };

  const handleConfirmDelete = () => {
    if (!deletingNeed) {
      return;
    }

    setIsDeleting(true);

    router.delete(needRoutes.destroy.url({ need: deletingNeed.id }), {
      onSuccess: () => {
        toast.success('Usulan kebutuhan berhasil dihapus.');
        setDeletingNeed(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  };

  const stableColumns = useMemo(() => getColumns(onEdit, onDelete), []);

  return (
    <>
      <Head title="Usulan Kebutuhan" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Usulan Kebutuhan
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola data usulan kebutuhan per unit kerja.
            </p>
          </div>
          <Button onClick={onCreate} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Usulan
          </Button>
        </div>

        <DataTable
          columns={stableColumns}
          data={needs.data}
          meta={needs}
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Cari berdasarkan judul atau deskripsi..."
        />
      </div>

      <NeedDialog
        key={editingNeed?.id ?? 'new'}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        need={editingNeed}
        organizationalUnits={organizationalUnits}
        needTypes={needTypes}
      />

      <ConfirmDialog
        open={!!deletingNeed}
        onOpenChange={(open) => !open && setDeletingNeed(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Usulan Kebutuhan"
        description={`Apakah Anda yakin ingin menghapus "${deletingNeed?.title}"? Data yang dihapus akan dipindahkan ke tempat sampah (Soft Delete).`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}

NeedsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Usulan Kebutuhan',
      href: needRoutes.index.url(),
    },
  ],
};
