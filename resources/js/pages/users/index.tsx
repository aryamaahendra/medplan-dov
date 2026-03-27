import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

import { DataTable } from '@/components/data-table/DataTable';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import users from '@/routes/users';
import { columns } from './columns';
import type { User } from './columns';

interface PaginatedUsers {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface UsersIndexProps {
  users: PaginatedUsers;
  filters: DataTableFilters;
}

export default function UsersIndex({ users, filters }: UsersIndexProps) {
  // Use useDataTable to handle server-side state via Inertia URL updates
  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({
      only: ['users', 'filters'],
    });

  // Safe to memoize columns
  const stableColumns = useMemo(() => columns, []);

  return (
    <>
      <Head title="Users" />

      <div className="flex flex-col gap-6 p-4">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage and browse all registered users.
          </p>
        </div>

        <DataTable
          columns={stableColumns}
          data={users.data}
          meta={users} // The whole paginated object usually matches our PaginationMeta
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Search by name or email..."
        />
      </div>
    </>
  );
}

UsersIndex.layout = {
  breadcrumbs: [
    {
      title: 'Users',
      href: users.index.url(),
    },
  ],
};
