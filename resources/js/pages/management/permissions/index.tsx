import { Head } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import permissionsRoutes from '@/routes/permissions';
import { columns } from './columns';
import type { Permission } from './columns';

interface PaginatedPermissions {
  data: Permission[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface PermissionsIndexProps {
  permissions: PaginatedPermissions;
  filters: DataTableFilters;
}

export default function PermissionsIndex({
  permissions,
  filters,
}: PermissionsIndexProps) {
  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({
      only: ['permissions', 'filters'],
    });

  return (
    <>
      <Head title="Permissions" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Permissions</h1>
            <p className="text-sm text-muted-foreground">
              Manage and browse all system permissions.
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={permissions.data}
          meta={permissions}
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Search by name..."
        />
      </div>
    </>
  );
}

PermissionsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Permissions',
      href: permissionsRoutes.index.url(),
    },
  ],
};
