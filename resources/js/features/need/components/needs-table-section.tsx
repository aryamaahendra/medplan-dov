import { DataTable } from '@/components/data-table/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import type { UseDataTableReturn } from '@/hooks/use-data-table';
import type { NeedsIndexFilters } from '@/pages/need/needs';
import { NeedGridView } from '@/pages/need/needs/components/need-grid-view';
import { NeedListView } from '@/pages/need/needs/components/need-list-view';
import { NeedsStageTabs } from '@/pages/need/needs/components/needs-stage-tabs';
import { NeedsTableToolbar } from '@/pages/need/needs/components/needs-table-toolbar';
import type { AttentionCounts, PaginatedNeeds } from '@/types';
import type {
  UseNeedsIndexActions,
  UseNeedsIndexState,
} from '../hooks/use-needs-index';

interface NeedsTableSectionProps {
  needs: PaginatedNeeds;
  attentionCounts: AttentionCounts;
  filters: NeedsIndexFilters;
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  needTypes: { id: number; name: string }[];
  state: UseNeedsIndexState;
  actions: UseNeedsIndexActions;
  dataTable: UseDataTableReturn;
}

export function NeedsTableSection({
  needs,
  attentionCounts,
  filters,
  organizationalUnits,
  needTypes,
  state,
  actions,
  dataTable,
}: NeedsTableSectionProps) {
  if (state.viewMode === 'loading') {
    return (
      <div className="overflow-hidden rounded-md border">
        <div className="h-10 border-b bg-muted/20" />
        <div className="divide-y">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex h-12 items-center gap-4 bg-card/50 px-4"
            >
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-[20ch]" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <NeedsStageTabs
        currentTab={state.currentStageTab}
        onTabChange={actions.setCurrentStageTab}
        counts={state.stageCounts}
      />

      <DataTable
        columns={state.columns}
        data={state.processedNeeds}
        meta={needs}
        filters={filters}
        onSearch={dataTable.onSearch}
        onSort={dataTable.onSort}
        onPageChange={dataTable.onPageChange}
        onPerPageChange={dataTable.onPerPageChange}
        onReset={dataTable.onReset}
        searchPlaceholder="Cari berdasarkan judul atau deskripsi..."
        view={state.viewMode}
        renderGrid={(data) =>
          state.viewMode === 'list' ? (
            <NeedListView
              data={data}
              onEdit={actions.onEdit}
              onDelete={actions.onDelete}
              onReview={actions.onReview}
              onSelectDetail={(need) => actions.setSelectedDrawerNeed(need)}
              onLock={actions.onLock}
              onUnlock={actions.onUnlock}
            />
          ) : (
            <NeedGridView
              data={data}
              onEdit={actions.onEdit}
              onDelete={actions.onDelete}
              onReview={actions.onReview}
            />
          )
        }
        toolbarChildren={
          <NeedsTableToolbar
            filters={filters}
            organizationalUnits={organizationalUnits}
            needTypes={needTypes}
            mergeParams={dataTable.mergeParams}
            viewMode={state.viewMode}
            setViewMode={actions.setViewMode}
            attentionCounts={attentionCounts}
            activeAttentionFilter={state.attentionFilter}
            onAttentionFilterChange={actions.setAttentionFilter}
          />
        }
        toolbarPosition="between-search-and-table"
      />
    </div>
  );
}
