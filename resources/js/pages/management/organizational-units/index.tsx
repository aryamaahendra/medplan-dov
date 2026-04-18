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
import organizationalUnitRoutes from '@/routes/organizational-units';
import { getColumns } from './columns';
import type { OrganizationalUnit } from './columns';
import { OrganizationalUnitDialog } from './organizational-unit-dialog';

interface PaginatedUnits {
  data: OrganizationalUnit[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface OrganizationalUnitsIndexProps {
  units: PaginatedUnits;
  allUnits: { id: number; name: string }[];
  filters: DataTableFilters;
}

export default function OrganizationalUnitsIndex({
  units,
  allUnits,
  filters,
}: OrganizationalUnitsIndexProps) {
  const { hasPermission } = usePermission();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<OrganizationalUnit | null>(
    null,
  );
  const [deletingUnit, setDeletingUnit] = useState<OrganizationalUnit | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Use useDataTable to handle server-side state via Inertia URL updates
  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({
      only: ['units', 'filters'],
    });

  const onEdit = (unit: OrganizationalUnit) => {
    setEditingUnit(unit);
    setDialogOpen(true);
  };

  const onCreate = () => {
    setEditingUnit(null);
    setDialogOpen(true);
  };

  const onDelete = (unit: OrganizationalUnit) => {
    setDeletingUnit(unit);
  };

  const handleConfirmDelete = () => {
    if (!deletingUnit) {
      return;
    }

    setIsDeleting(true);

    router.delete(
      organizationalUnitRoutes.destroy.url({
        organizational_unit: deletingUnit.id,
      }),
      {
        onSuccess: () => {
          toast.success('Unit organisasi berhasil dihapus.');
          setDeletingUnit(null);
        },
        onFinish: () => setIsDeleting(false),
      },
    );
  };

  return (
    <>
      <Head title="Unit Organisasi" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Unit Kerja
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola struktur organisasi, bidang, dan subbagian.
            </p>
          </div>
          {hasPermission('create organizational-units') && (
            <Button onClick={onCreate}>
              <Plus />
              Tambah Unit
            </Button>
          )}
        </div>

        <DataTable
          columns={useMemo(
            () => getColumns(onEdit, onDelete, hasPermission),
            [hasPermission],
          )}
          data={units.data}
          meta={units}
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Cari berdasarkan nama atau kode..."
        />
      </div>

      <OrganizationalUnitDialog
        key={editingUnit?.id ?? 'new'}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        unit={editingUnit}
        allUnits={allUnits}
      />

      <ConfirmDialog
        open={!!deletingUnit}
        onOpenChange={(open) => !open && setDeletingUnit(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Unit Organisasi"
        description={`Apakah Anda yakin ingin menghapus "${deletingUnit?.name}"? Data yang dihapus akan dipindahkan ke tempat sampah (Soft Delete).`}
        confirmText="Hapus Unit"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}

OrganizationalUnitsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Unit Kerja',
      href: organizationalUnitRoutes.index.url(),
    },
  ],
};
