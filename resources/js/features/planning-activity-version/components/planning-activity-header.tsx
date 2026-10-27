import { Link } from '@inertiajs/react';
import { RiDownloadLine, RiAddLine, RiRefreshLine } from '@remixicon/react';

import PlanningActivityVersionController from '@/actions/App/Http/Controllers/Planning/PlanningActivityVersionController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PlanningVersion } from '@/types/planning-version';

import { ActivityImportDialog } from './import-dialog';

interface PlanningActivityHeaderProps {
  version: PlanningVersion;
  hasPermission: (permission: string) => boolean;
  isRecalculating: boolean;
  onRecalculate: () => void;
}

export function PlanningActivityHeader({
  version,
  hasPermission,
  isRecalculating,
  onRecalculate,
}: PlanningActivityHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{version.name}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Periode {version.year_start} - {version.year_end}
          </span>
          <span>•</span>
          <Badge variant="outline">Revisi {version.revision_no}</Badge>
          {version.is_current && <Badge> Utama </Badge>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasPermission('update planning-activity-versions') && (
          <Button
            variant="outline"
            disabled={isRecalculating}
            onClick={onRecalculate}
          >
            <RiRefreshLine
              className={cn(isRecalculating && 'animate-spin')}
              data-icon="inline-start"
            />
            {isRecalculating ? 'Recalculating...' : 'Recalculate'}
          </Button>
        )}
        <Button
          variant="outline"
          render={
            <a href={PlanningActivityVersionController.export.url(version.id)}>
              <RiDownloadLine className="mr-2 h-4 w-4" />
              Export
            </a>
          }
        />
        {hasPermission('create planning-activity-versions') && (
          <>
            <ActivityImportDialog version={version} />
            <Button
              render={
                <Link
                  href={PlanningActivityVersionController.create.url(
                    version.id,
                  )}
                >
                  <RiAddLine className="mr-2" />
                  Tambah Aktivitas
                </Link>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
