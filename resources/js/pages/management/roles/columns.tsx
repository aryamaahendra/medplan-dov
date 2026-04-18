import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import type { Permission } from '../permissions/columns';

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  permissions?: Permission[];
}

export const getColumns = (
  onEdit: (role: Role) => void,
  onDelete: (role: Role) => void,
  hasPermission: (permission: string) => boolean,
): ColumnDef<Role>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    id: 'permissions_count',
    header: 'Permissions',
    cell: ({ row }) => {
      const role = row.original;

      return <div>{role.permissions?.length || 0} permissions</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const role = row.original;
      const isSuperadmin = role.name.toLowerCase() === 'superadmin';

      return (
        <div className="flex items-center gap-2">
          {!isSuperadmin && (
            <>
              {hasPermission('update roles') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(role)}
                  title="Edit Role"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {hasPermission('delete roles') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(role)}
                  title="Delete Role"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      );
    },
  },
];
