import { RiEdit2Line, RiDeleteBinLine } from '@remixicon/react';
import type { ColumnDef } from '@tanstack/react-table';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDicebearClayAvatar } from '@/lib/avatar';
import { formatDate } from '@/lib/formatters';
export interface User {
  id: number;
  name: string;
  nip?: string;
  email: string;
  avatar?: string;
  created_at: string;
  roles?: { id: number; name: string }[];
  organizational_unit_id?: number;
}

export const getColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  hasPermission: (permission: string) => boolean,
): ColumnDef<User>[] => [
  getIndexColumn(),
  {
    accessorKey: 'name',
    header: (props) => <DataTableColumnHeader {...props} title="Name" />,
    cell: ({ row }) => {
      const user = row.original;
      const initials = user.name
        ? user.name
            .trim()
            .split(' ')
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join('')
        : '';
      const avatarSrc =
        user.avatar ||
        getDicebearClayAvatar(user.email || user.name || user.id);

      return (
        <div className="flex items-center gap-2.5">
          <Avatar
            size="sm"
            className="size-7 shrink-0 overflow-hidden rounded-full"
          >
            <AvatarImage src={avatarSrc} alt={user.name} />
            <AvatarFallback className="rounded-full bg-muted text-[10px] text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{user.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'nip',
    header: (props) => <DataTableColumnHeader {...props} title="NIP" />,
    meta: {
      cellClassName: 'font-mono text-xs',
    },
  },
  {
    accessorKey: 'email',
    header: (props) => <DataTableColumnHeader {...props} title="Email" />,
    meta: {
      cellClassName: 'text-foreground font-medium',
    },
  },
  {
    id: 'roles',
    header: 'Roles',
    cell: ({ row }) => {
      const roles = row.original.roles;

      if (!roles || roles.length === 0) {
        return <span className="text-xs text-muted-foreground">No roles</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => (
            <span
              key={role.id}
              className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
            >
              {role.name}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: (props) => <DataTableColumnHeader {...props} title="Joined" />,
    cell: ({ row }) =>
      formatDate(row.getValue('created_at'), {
        day: '2-digit',
      }),
  },
  {
    id: 'actions',
    meta: {
      cellClassName: 'w-1',
    },
    cell: ({ row }) => {
      const user = row.original;

      const actions: any[] = [];

      if (hasPermission('update users')) {
        actions.push({
          label: 'Edit User',
          icon: RiEdit2Line,
          onClick: () => onEdit(user),
        });
      }

      if (hasPermission('delete users')) {
        const isSuperAdmin = user.roles?.some(
          (role) => role.name.toLowerCase() === 'super-admin',
        );

        if (!isSuperAdmin) {
          if (actions.length > 0) {
            actions.push('separator');
          }

          actions.push({
            label: 'Delete User',
            icon: RiDeleteBinLine,
            onClick: () => onDelete(user),
            variant: 'destructive',
          });
        }
      }

      if (actions.length === 0) {
        return null;
      }

      return <ActionDropdown actions={actions} />;
    },
  },
];
