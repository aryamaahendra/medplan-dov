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
import needTypeRoutes from '@/routes/need-types';
import { getColumns } from './columns';
import type { NeedType } from './columns';
import { NeedTypeDialog } from './need-type-dialog';

interface PaginatedNeedTypes {
  data: NeedType[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface NeedTypesIndexProps {
  needTypes: PaginatedNeedTypes;
  filters: DataTableFilters;
}

export default function NeedTypesIndex({
  needTypes,
  filters,
}: NeedTypesIndexProps) {
  const { hasPermission } = usePermission();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNeedType, setEditingNeedType] = useState<NeedType | null>(null);
  const [deletingNeedType, setDeletingNeedType] = useState<NeedType | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Use useDataTable to handle server-side state via Inertia URL updates
  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({
      only: ['needTypes', 'filters'],
    });

  const onEdit = (needType: NeedType) => {
    setEditingNeedType(needType);
    setDialogOpen(true);
  };

  const onCreate = () => {
    setEditingNeedType(null);
    setDialogOpen(true);
  };

  const onDelete = (needType: NeedType) => {
    setDeletingNeedType(needType);
  };

  const handleConfirmDelete = () => {
    if (!deletingNeedType) {
      return;
    }

    setIsDeleting(true);

    router.delete(
      needTypeRoutes.destroy.url({
        need_type: deletingNeedType.id,
      }),
      {
        onSuccess: () => {
          toast.success('Kategori kebutuhan berhasil dihapus.');
          setDeletingNeedType(null);
        },
        onFinish: () => setIsDeleting(false),
      },
    );
  };

  return (
    <>
      <Head title="Kategori Kebutuhan" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Kategori Kebutuhan
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola master data kategori kebutuhan.
            </p>
          </div>
          {hasPermission('create need-types') && (
            <Button onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jenis
            </Button>
          )}
        </div>

        <DataTable
          columns={useMemo(
            () => getColumns(onEdit, onDelete, hasPermission),
            [hasPermission],
          )}
          data={needTypes.data}
          meta={needTypes}
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Cari berdasarkan nama atau kode..."
        />
      </div>

      <NeedTypeDialog
        key={editingNeedType?.id ?? 'new'}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        needType={editingNeedType}
      />

      <ConfirmDialog
        open={!!deletingNeedType}
        onOpenChange={(open) => !open && setDeletingNeedType(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori Kebutuhan"
        description={`Apakah Anda yakin ingin menghapus "${deletingNeedType?.name}"? Data yang dihapus akan dipindahkan ke tempat sampah (Soft Delete).`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}

NeedTypesIndex.layout = {
  breadcrumbs: [
    {
      title: 'Kategori Kebutuhan',
      href: needTypeRoutes.index.url(),
    },
  ],
};
