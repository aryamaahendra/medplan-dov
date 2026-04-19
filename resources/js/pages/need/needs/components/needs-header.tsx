import {
  ClipboardList,
  Ellipsis,
  FileDown,
  LayoutGrid,
  List,
  PencilLine,
  Plus,
  Trash2,
} from 'lucide-react';

import needGroupChecklistActions from '@/actions/App/Http/Controllers/Need/NeedGroupChecklistController';
import { ActionDropdown } from '@/components/action-dropdown';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';

interface NeedsHeaderProps {
  currentGroup: { id: number; name: string; year: number };
  viewMode: 'table' | 'grid' | 'loading';
  setViewMode: (mode: 'table' | 'grid') => void;
  onCreate: () => void;
  onExport: () => void;
  onEditGroup: () => void;
  onDeleteGroup: () => void;
}

export function NeedsHeader({
  currentGroup,
  viewMode,
  setViewMode,
  onCreate,
  onExport,
  onEditGroup,
  onDeleteGroup,
}: NeedsHeaderProps) {
  const { hasPermission } = usePermission();

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

        <Button variant="outline" onClick={onExport}>
          <FileDown />
          Export Excel
        </Button>

        {hasPermission('create needs') && (
          <Button onClick={onCreate}>
            <Plus />
            Tambah Usulan
          </Button>
        )}

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
      </div>
    </div>
  );
}
