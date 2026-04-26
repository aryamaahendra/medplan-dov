import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { useNeedsIndex } from '@/hooks/use-needs-index';
import { useViewMode } from '@/hooks/use-view-mode';
import needRoutes from '@/routes/needs';
import type { PaginatedNeeds } from '@/types';
import { NeedGroupDialog } from '../groups/need-group-dialog';
import { getColumns } from './columns';

import { NeedDirectorReviewDialog } from './components/need-director-review-dialog';
import { NeedGridView } from './components/need-grid-view';
import { NeedsDashboard } from './components/needs-dashboard';
import { NeedsHeader } from './components/needs-header';
import { NeedsTableToolbar } from './components/needs-table-toolbar';

interface NeedsIndexProps {
  needs: PaginatedNeeds;
  currentGroup: { id: number; name: string; year: number };
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  needTypes: { id: number; name: string }[];
  filters: DataTableFilters & {
    year?: string | string[];
    status?: string | string[];
    need_type_id?: string | string[];
    organizational_unit_id?: string | string[];
    urgency?: string | string[];
    impact?: string | string[];
    is_priority?: string | string[];
    is_approved_by_director?: string | string[];
    min_checklist_score?: string | string[];
    need_group_id?: string | string[];
  };
  stats: {
    total_needs: number;
    total_budget: number;
    priority_needs: number;
    avg_completeness: number;
    approved_by_director: number;
    prev_group: { id: number; name: string } | null;
    prev_total_needs: number | null;
    prev_total_budget: number | null;
    prev_priority_needs: number | null;
    prev_avg_completeness: number | null;
    prev_approved_by_director: number | null;
  };
  statusDistribution: Record<string, number>;
  needsByUnit: {
    unit_id: number | null;
    name: string;
    parents: string[];
    count: number;
    total_budget: number;
    priority_count: number;
    approved_count: number;
  }[];
  needsByType: { name: string; count: number }[];
}

export default function NeedsIndex({
  needs,
  currentGroup,
  organizationalUnits,
  needTypes,
  filters,
  stats,
  statusDistribution,
  needsByUnit,
  needsByType,
}: NeedsIndexProps) {
  const [viewMode, setViewMode] = useViewMode();
  const { state, actions } = useNeedsIndex({ currentGroup });

  const {
    onSearch,
    onSort,
    onPageChange,
    onPerPageChange,
    onReset,
    mergeParams,
  } = useDataTable({ only: ['needs', 'filters'] });

  const stableColumns = useMemo(
    () => getColumns(actions.onEdit, actions.onDelete, actions.onReview),
    [actions.onEdit, actions.onDelete, actions.onReview],
  );

  return (
    <>
      <Head title={`Usulan: ${currentGroup.name}`} />

      <div className="flex flex-col gap-6 p-4">
        <NeedsHeader
          currentGroup={currentGroup}
          showDashboard={state.showDashboard}
          onToggleDashboard={() => actions.setShowDashboard((v) => !v)}
          onCreate={actions.onCreate}
          onExport={actions.onExport}
          onEditGroup={() => actions.setIsGroupDialogOpen(true)}
          onDeleteGroup={() => actions.setIsDeletingGroup(true)}
        />

        {state.showDashboard ? (
          <NeedsDashboard
            stats={stats}
            statusDistribution={statusDistribution}
            needsByUnit={needsByUnit}
            needsByType={needsByType}
          />
        ) : viewMode === 'loading' ? (
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
        ) : (
          <DataTable
            columns={stableColumns}
            data={needs.data}
            meta={needs}
            filters={filters}
            onSearch={onSearch}
            onSort={onSort}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
            onReset={onReset}
            searchPlaceholder="Cari berdasarkan judul atau deskripsi..."
            view={viewMode}
            renderGrid={(data) => (
              <NeedGridView
                data={data}
                onEdit={actions.onEdit}
                onDelete={actions.onDelete}
                onReview={actions.onReview}
              />
            )}
            toolbarChildren={
              <NeedsTableToolbar
                filters={filters}
                organizationalUnits={organizationalUnits}
                needTypes={needTypes}
                mergeParams={mergeParams}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            }
            toolbarPosition="between-search-and-table"
          />
        )}
      </div>

      <NeedGroupDialog
        open={state.isGroupDialogOpen}
        onOpenChange={actions.setIsGroupDialogOpen}
        needGroup={currentGroup as any}
      />

      <ConfirmDialog
        open={state.isDeletingGroup}
        onOpenChange={actions.setIsDeletingGroup}
        onConfirm={actions.handleConfirmDeleteGroup}
        title="Hapus Kelompok Usulan"
        description={`Apakah Anda yakin ingin menghapus "${currentGroup.name}"? Data usulan di dalam kelompok ini juga akan terdampak.`}
        confirmText="Hapus"
        variant="destructive"
        loading={state.isDeletingGroupLoading}
      />

      <ConfirmDialog
        open={!!state.deletingNeed}
        onOpenChange={(open) => !open && actions.setDeletingNeed(null)}
        onConfirm={actions.handleConfirmDelete}
        title="Hapus Usulan Kebutuhan"
        description={`Apakah Anda yakin ingin menghapus "${state.deletingNeed?.title}"? Data yang dihapus akan dipindahkan ke tempat sampah (Soft Delete).`}
        confirmText="Hapus"
        variant="destructive"
        loading={state.isDeleting}
      />

      {(() => {
        const reviewingNeed = needs.data.find(
          (n) => n.id === state.reviewingNeedId,
        );

        return (
          reviewingNeed && (
            <NeedDirectorReviewDialog
              key={reviewingNeed.id}
              need={reviewingNeed}
              open={!!state.reviewingNeedId}
              onOpenChange={(open) => !open && actions.setReviewingNeedId(null)}
            />
          )
        );
      })()}
    </>
  );
}

NeedsIndex.layout = (props: NeedsIndexProps) => ({
  breadcrumbs: [
    {
      title: 'Usulan Kebutuhan',
      href: '#',
    },
    {
      title: props.currentGroup?.name || 'Loading...',
      href: props.currentGroup
        ? needRoutes.index.url({
            query: { need_group_id: props.currentGroup.id },
          })
        : '#',
    },
  ],
});
