import {
  RiClipboardLine,
  RiMoreFill,
  RiFileDownloadLine,
  RiEdit2Line,
  RiAddLine,
  RiDeleteBinLine,
  RiDashboardLine,
  RiTableLine,
} from '@remixicon/react';

import needGroupChecklistActions from '@/actions/App/Http/Controllers/Need/NeedGroupChecklistController';
import { ActionDropdown } from '@/components/action-dropdown';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permission';

interface NeedsHeaderProps {
  currentGroup: { id: number; name: string; year: number };
  onCreate: () => void;
  onExport: () => void;
  onEditGroup: () => void;
  onDeleteGroup: () => void;
  showDashboard?: boolean;
  onToggleDashboard?: () => void;
}
export function NeedsHeader({
  currentGroup,
  onCreate,
  onExport,
  onEditGroup,
  onDeleteGroup,
  showDashboard = false,
  onToggleDashboard,
}: NeedsHeaderProps) {
  const { hasPermission, hasAnyPermission } = usePermission();

  const groupActions = [];

  if (hasPermission('update need-groups')) {
    groupActions.push({
      label: 'Edit',
      icon: RiEdit2Line,
      onClick: onEditGroup,
    });
    groupActions.push({
      label: 'Checklist',
      icon: RiClipboardLine,
      href: needGroupChecklistActions.index.url({
        need_group: currentGroup.id,
      }),
    });
  }

  groupActions.push({
    label: 'Export Excel',
    icon: RiFileDownloadLine,
    onClick: onExport,
  });

  if (hasPermission('delete need-groups')) {
    if (groupActions.length > 0) {
      groupActions.push('separator');
    }

    groupActions.push({
      label: 'Hapus',
      icon: RiDeleteBinLine,
      onClick: onDeleteGroup,
      variant: 'destructive',
    });
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {currentGroup.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Tahun Anggaran {currentGroup.year}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {onToggleDashboard && (
          <Button
            variant={showDashboard ? 'secondary' : 'outline'}
            size="sm"
            onClick={onToggleDashboard}
            className="h-9 gap-1.5 font-medium"
          >
            {showDashboard ? (
              <>
                <RiTableLine className="size-4" />
                <span>Tabel Usulan</span>
              </>
            ) : (
              <>
                <RiDashboardLine className="size-4 text-primary" />
                <span>Dashboard</span>
              </>
            )}
          </Button>
        )}

        {groupActions.length > 0 && (
          <ActionDropdown
            trigger={
              <Button variant={'outline'} size={'icon'}>
                <RiMoreFill />
              </Button>
            }
            actions={groupActions as any}
          />
        )}

        {hasAnyPermission([
          'create needs',
          'create descendant needs',
          'create any needs',
        ]) && (
          <Button onClick={onCreate}>
            <RiAddLine />
            Tambah Usulan
          </Button>
        )}
      </div>
    </div>
  );
}
