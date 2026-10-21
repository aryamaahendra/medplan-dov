import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { getNeedTypeColumns } from '@/features/need-type/components/need-type-columns';
import { NeedTypeDialog } from '@/features/need-type/components/need-type-dialog';
import type {
  NeedType,
  PaginatedNeedTypes,
} from '@/features/need-type/types/need-type.types';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import { useResourceIndexController } from '@/hooks/use-resource-index-controller';
import needTypeRoutes from '@/routes/need-types';

interface NeedTypesIndexProps {
  needTypes: PaginatedNeedTypes;
  filters: DataTableFilters;
}

export default function NeedTypesIndex({
  needTypes,
  filters,
}: NeedTypesIndexProps) {
  const { hasPermission } = usePermission();

  const controller = useResourceIndexController<NeedType>({
    data: needTypes,
    filters,
    only: ['needTypes', 'filters'],
    resourceName: 'Kategori kebutuhan',
    deleteUrl: (needType) =>
      needTypeRoutes.destroy.url({ need_type: needType.id }),
    getColumns: ({ onEdit, onDelete }) =>
      getNeedTypeColumns(onEdit, onDelete, hasPermission),
    searchPlaceholder: 'Cari berdasarkan nama atau kode...',
  });

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
            <Button onClick={controller.dialog.openCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah Jenis
            </Button>
          )}
        </div>

        <DataTable {...controller.tableProps} />
      </div>

      <NeedTypeDialog
        key={controller.dialog.editingItem?.id ?? 'new'}
        open={controller.dialog.isOpen}
        onOpenChange={controller.dialog.setIsOpen}
        needType={controller.dialog.editingItem}
      />

      <ConfirmDialog
        open={controller.deleteDialog.isOpen}
        onOpenChange={controller.deleteDialog.setIsOpen}
        onConfirm={controller.deleteDialog.confirmDelete}
        title="Hapus Kategori Kebutuhan"
        description={`Apakah Anda yakin ingin menghapus "${controller.deleteDialog.deletingItem?.name}"? Data yang dihapus akan dipindahkan ke tempat sampah (Soft Delete).`}
        confirmText="Hapus"
        variant="destructive"
        loading={controller.deleteDialog.isDeleting}
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
