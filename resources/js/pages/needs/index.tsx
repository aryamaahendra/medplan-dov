import { Head, router } from '@inertiajs/react';
import { CheckCheck, Plus, SendIcon, TriangleAlert } from 'lucide-react';
import { Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';
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
  filters: DataTableFilters & {
    year?: string | string[];
    status?: string | string[];
    need_type_id?: string | string[];
    organizational_unit_id?: string | string[];
  };
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

  const {
    onSearch,
    onSort,
    onPageChange,
    onPerPageChange,
    onReset,
    mergeParams,
  } = useDataTable({ only: ['needs', 'filters'] });

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

  const statusOptions = [
    { label: 'Draft', value: 'draft', icon: Clock },
    { label: 'Submitted', value: 'submitted', icon: SendIcon },
    { label: 'Approved', value: 'approved', icon: CheckCheck },
    { label: 'Rejected', value: 'rejected', icon: TriangleAlert },
  ];

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i)
      .reverse()
      .map((year) => ({ label: year.toString(), value: year.toString() }));
  }, []);

  const typeOptions = useMemo(
    () =>
      needTypes.map((type) => ({
        label: type.name,
        value: type.id.toString(),
      })),
    [needTypes],
  );

  const unitOptions = useMemo(
    () =>
      organizationalUnits.map((unit) => ({
        label: unit.name,
        value: unit.id.toString(),
      })),
    [organizationalUnits],
  );

  const getFilterArray = (value: string | string[] | undefined) => {
    if (!value) {
return [];
}

    return Array.isArray(value) ? value : [value];
  };

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
          <Button onClick={onCreate}>
            <Plus />
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
          toolbarChildren={
            <>
              <DataTableFacetedFilter
                title="Tahun"
                options={yearOptions}
                selectedValues={getFilterArray(filters.year)}
                onSelect={(values) => mergeParams({ year: values, page: 1 })}
              />
              <DataTableFacetedFilter
                title="Status"
                options={statusOptions}
                selectedValues={getFilterArray(filters.status)}
                onSelect={(values) => mergeParams({ status: values, page: 1 })}
              />
              <DataTableFacetedFilter
                title="Jenis"
                options={typeOptions}
                selectedValues={getFilterArray(filters.need_type_id)}
                onSelect={(values) =>
                  mergeParams({ need_type_id: values, page: 1 })
                }
              />
              <DataTableFacetedFilter
                title="Unit Kerja"
                options={unitOptions}
                selectedValues={getFilterArray(filters.organizational_unit_id)}
                onSelect={(values) =>
                  mergeParams({ organizational_unit_id: values, page: 1 })
                }
              />
            </>
          }
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
