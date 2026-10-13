import { RiEdit2Line, RiDeleteBinLine, RiRefreshLine } from '@remixicon/react';
import type { ColumnDef } from '@tanstack/react-table';

import { ActionDropdown } from '@/components/action-dropdown';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getIndexColumn } from '@/components/data-table/data-table-index-column';
import { formatDate, formatDateTime } from '@/lib/formatters';
import type { OrganizationalUnit } from '../types/organizational-unit.types';

export type { OrganizationalUnit };

export const getColumns = (
  onEdit: (unit: OrganizationalUnit) => void,
  onDelete: (unit: OrganizationalUnit) => void,
  hasPermission: (permission: string) => boolean,
  isTrash = false,
  onRestore?: (unit: OrganizationalUnit) => void,
  onForceDelete?: (unit: OrganizationalUnit) => void,
): ColumnDef<OrganizationalUnit>[] => [
  getIndexColumn(),
  {
    accessorKey: 'name',
    header: (props) => <DataTableColumnHeader {...props} title="Nama Unit" />,
    meta: {
      cellClassName: 'font-medium',
    },
  },
  {
    accessorKey: 'code',
    header: (props) => <DataTableColumnHeader {...props} title="Kode Resmi" />,
    meta: {
      cellClassName: 'font-mono text-sm',
    },
  },
  {
    accessorKey: 'parent.name',
    header: (props) => <DataTableColumnHeader {...props} title="Unit Induk" />,
    cell: ({ row }) => row.original.parent?.name || '-',
  },
  isTrash
    ? {
        accessorKey: 'deleted_at',
        header: (props) => (
          <DataTableColumnHeader {...props} title="Dihapus Pada" />
        ),
        cell: ({ row }) => {
          const deletedAt = row.original.deleted_at;

          return deletedAt
            ? formatDateTime(deletedAt, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-';
        },
      }
    : {
        accessorKey: 'created_at',
        header: (props) => <DataTableColumnHeader {...props} title="Dibuat" />,
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
      const unit = row.original;
      const actions: any[] = [];

      if (isTrash) {
        const canRestore =
          unit.can?.restore ?? hasPermission('restore org-units');
        const canForceDelete =
          unit.can?.forceDelete ?? hasPermission('force-delete org-units');

        if (canRestore && onRestore) {
          actions.push({
            label: 'Pulihkan',
            icon: RiRefreshLine,
            onClick: () => onRestore(unit),
          });
        }

        if (canForceDelete && onForceDelete) {
          if (actions.length > 0) {
            actions.push('separator');
          }

          actions.push({
            label: 'Hapus Permanen',
            icon: RiDeleteBinLine,
            onClick: () => onForceDelete(unit),
            variant: 'destructive',
          });
        }

        if (actions.length === 0) {
          return null;
        }

        return <ActionDropdown actions={actions} />;
      }

      if (hasPermission('update organizational-units')) {
        actions.push({
          label: 'Edit',
          icon: RiEdit2Line,
          onClick: () => onEdit(unit),
        });
      }

      if (hasPermission('delete organizational-units')) {
        if (actions.length > 0) {
          actions.push('separator');
        }

        actions.push({
          label: 'Hapus',
          icon: RiDeleteBinLine,
          onClick: () => onDelete(unit),
          variant: 'destructive',
        });
      }

      if (actions.length === 0) {
        return null;
      }

      return <ActionDropdown actions={actions} />;
    },
  },
];
