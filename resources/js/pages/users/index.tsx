import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';

import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import userRoutes from '@/routes/users';
import { getColumns } from './columns';
import type { User } from './columns';
import { UserDialog } from './user-dialog';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Use useDataTable to handle server-side state via Inertia URL updates
  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({
      only: ['users', 'filters'],
    });

  const onEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const onCreate = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  // Safe to memoize columns
  const stableColumns = useMemo(() => getColumns(onEdit), []);

  return (
    <>
      <Head title="Users" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Users</h1>
            <p className="text-sm text-muted-foreground">
              Manage and browse all registered users.
            </p>
          </div>
          <Button onClick={onCreate} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
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

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
      />
    </>
  );
}

UsersIndex.layout = {
  breadcrumbs: [
    {
      title: 'Users',
      href: userRoutes.index.url(),
    },
  ],
};
