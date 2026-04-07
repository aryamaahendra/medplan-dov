import { Head, router } from '@inertiajs/react';
import {
  CheckCheck,
  Clock,
  LayoutGrid,
  List,
  Plus,
  SendIcon,
  TriangleAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';

import { getColumns } from './columns';
import type { Need } from './columns';
import { NeedGridView } from './components/need-grid-view';

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
  currentGroup: { id: number; name: string; year: number };
  organizationalUnits: { id: number; name: string }[];
  needTypes: { id: number; name: string }[];
  filters: DataTableFilters & {
    year?: string | string[];
    status?: string | string[];
    need_type_id?: string | string[];
    organizational_unit_id?: string | string[];
    urgency?: string | string[];
    impact?: string | string[];
    is_priority?: string | string[];
    need_group_id?: string | string[];
  };
}

export default function NeedsIndex({
  needs,
  currentGroup,
  organizationalUnits,
  needTypes,
  filters,
}: NeedsIndexProps) {
  const [deletingNeed, setDeletingNeed] = useState<Need | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  const {
    onSearch,
    onSort,
    onPageChange,
    onPerPageChange,
    onReset,
    mergeParams,
  } = useDataTable({ only: ['needs', 'filters'] });

  const onEdit = (need: Need) => {
    router.visit(needRoutes.edit.url({ need: need.id }));
  };

  const onCreate = () => {
    router.visit(
      needRoutes.create.url({ query: { need_group_id: currentGroup.id } }),
    );
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

  const urgencyOptions = [
    { label: 'Tinggi', value: 'high' },
    { label: 'Sedang', value: 'medium' },
    { label: 'Rendah', value: 'low' },
  ];

  const impactOptions = [
    { label: 'Tinggi', value: 'high' },
    { label: 'Sedang', value: 'medium' },
    { label: 'Rendah', value: 'low' },
  ];

  const priorityOptions = [
    { label: 'Ya', value: '1' },
    { label: 'Tidak', value: '0' },
  ];

  const getFilterArray = (value: string | string[] | undefined) => {
    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  };

  return (
    <>
      <Head title={`Usulan: ${currentGroup.name}`} />
      <Head title={`Usulan: ${currentGroup.name}`} />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {currentGroup.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Tahun Anggaran {currentGroup.year}
            </p>
          </div>
          <div className="flex gap-2">
            <ButtonGroup>
              <Button
                variant={'outline'}
                onClick={() => setViewMode('table')}
                className={cn({
                  'bg-muted': viewMode === 'table',
                })}
              >
                <List />
                <span className="sr-only">Table view</span>
              </Button>
              <Button
                variant={'outline'}
                onClick={() => setViewMode('grid')}
                className={cn({
                  'bg-muted': viewMode === 'grid',
                })}
              >
                <LayoutGrid />
                <span className="sr-only">Grid view</span>
              </Button>
            </ButtonGroup>
            <Button onClick={onCreate}>
              <Plus />
              Tambah Usulan
            </Button>
          </div>
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
          view={viewMode}
          renderGrid={(data) => (
            <NeedGridView data={data} onEdit={onEdit} onDelete={onDelete} />
          )}
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
              <DataTableFacetedFilter
                title="Urgensi"
                options={urgencyOptions}
                selectedValues={getFilterArray(filters.urgency)}
                onSelect={(values) => mergeParams({ urgency: values, page: 1 })}
              />
              <DataTableFacetedFilter
                title="Dampak"
                options={impactOptions}
                selectedValues={getFilterArray(filters.impact)}
                onSelect={(values) => mergeParams({ impact: values, page: 1 })}
              />
              <DataTableFacetedFilter
                title="Prioritas"
                options={priorityOptions}
                selectedValues={getFilterArray(filters.is_priority)}
                onSelect={(values) =>
                  mergeParams({ is_priority: values, page: 1 })
                }
              />
            </>
          }
        />
      </div>

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

NeedsIndex.layout = (props: NeedsIndexProps) => ({
  breadcrumbs: [
    {
      title: 'Usulan Kebutuhan',
      href: '#',
    },
    {
      title: props.currentGroup?.name || 'Loading...',
      href: props.currentGroup
        ? needRoutes.index.url({
            query: { need_group_id: props.currentGroup.id },
          })
        : '#',
    },
  ],
});
