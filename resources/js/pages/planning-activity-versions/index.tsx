import { Head } from '@inertiajs/react';
import { List } from 'lucide-react';
import { useMemo } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { useDataTable } from '@/hooks/use-data-table';
import planningVersions from '@/routes/planning-versions';
import type {
  PlanningActivityVersion,
  PlanningVersion,
} from '@/types/planning-version';

import { getColumns } from './columns';

interface PaginatedActivities {
  data: PlanningActivityVersion[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface PlanningActivityVersionsIndexProps {
  version: PlanningVersion;
  activities: PaginatedActivities;
  filters: DataTableFilters;
}

export default function PlanningActivityVersionsIndex({
  version,
  activities,
  filters,
}: PlanningActivityVersionsIndexProps) {
  const { onSearch, onSort, onReset, onPageChange, onPerPageChange } =
    useDataTable({
      only: ['activities', 'filters'],
    });

  const columns = useMemo(
    () => getColumns(version, activities.data),
    [version, activities.data],
  );

  return (
    <>
      <Head title={`Snapshot: ${version.name}`} />

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <List className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {version.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Tahun Anggaran {version.fiscal_year}</span>
                <span>•</span>
                <Badge variant="outline" className="h-5 text-[10px]">
                  Revisi {version.revision_no}
                </Badge>
                {version.is_current && (
                  <Badge className="h-5 bg-emerald-500 text-[10px]">
                    Utama
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border bg-card">
          <DataTable
            columns={columns}
            data={activities.data}
            meta={activities}
            filters={filters}
            onSearch={onSearch}
            onSort={onSort}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
            onReset={onReset}
            searchPlaceholder="Cari nomenklatur..."
          />
        </div>
      </div>
    </>
  );
}

PlanningActivityVersionsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Versi Perencanaan',
      href: planningVersions.index.url(),
    },
    {
      title: 'Snapshot Aktivitas',
    },
  ],
};
