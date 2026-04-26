import {
  ClipboardList,
  Ellipsis,
  FileDown,
  PencilLine,
  PieChart,
  Plus,
  Table,
  Trash2,
} from 'lucide-react';

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
  showDashboard: boolean;
  onToggleDashboard: () => void;
}

export function NeedsHeader({
  currentGroup,
  onCreate,
  onExport,
  onEditGroup,
  onDeleteGroup,
  showDashboard,
  onToggleDashboard,
}: NeedsHeaderProps) {
  const { hasPermission, hasAnyPermission } = usePermission();

  const groupActions = [];

  if (hasPermission('update need-groups')) {
    groupActions.push({
      label: 'Edit',
      icon: PencilLine,
      onClick: onEditGroup,
    });
    groupActions.push({
      label: 'Checklist',
      icon: ClipboardList,
      href: needGroupChecklistActions.index.url({
        need_group: currentGroup.id,
      }),
    });
  }

  groupActions.push({
    label: 'Export Excel',
    icon: FileDown,
    onClick: onExport,
  });

  if (hasPermission('delete need-groups')) {
    if (groupActions.length > 0) {
      groupActions.push('separator');
    }

    groupActions.push({
      label: 'Hapus',
      icon: Trash2,
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
      <div className="flex gap-1">
        <Button variant={'outline'} onClick={onToggleDashboard}>
          {showDashboard ? (
            <>
              <Table />
              Table
            </>
          ) : (
            <>
              <PieChart />
              Dashboard
            </>
          )}
        </Button>

        {!showDashboard && (
          <>
            {groupActions.length > 0 && (
              <ActionDropdown
                trigger={
                  <Button variant={'outline'} size={'icon'}>
                    <Ellipsis />
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
                <Plus />
                Tambah Usulan
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
