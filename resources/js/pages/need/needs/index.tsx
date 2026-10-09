import { Head } from '@inertiajs/react';

import { NeedIndexDialogs } from '@/features/need/components/need-index-dialogs';
import { NeedsTableSection } from '@/features/need/components/needs-table-section';
import { useNeedsIndex } from '@/features/need/hooks/use-needs-index';
import needRoutes from '@/routes/needs';
import type { PaginatedNeeds } from '@/types';

import { NeedsHeader } from './components/needs-header';

export interface NeedsIndexProps {
  needs: PaginatedNeeds;
  currentGroup: { id: number; name: string; year: number };
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  needTypes: { id: number; name: string }[];
  filters: any;
}

export default function NeedsIndex({
  needs,
  currentGroup,
  organizationalUnits,
  needTypes,
  filters,
}: NeedsIndexProps) {
  const { state, actions, dataTable } = useNeedsIndex({
    needs,
    currentGroup,
  });

  return (
    <>
      <Head title={`Usulan: ${currentGroup.name}`} />

      <div className="flex flex-col gap-6 p-4">
        <NeedsHeader
          currentGroup={currentGroup}
          onCreate={actions.onCreate}
          onExport={actions.onExport}
        />

        <NeedsTableSection
          needs={needs}
          filters={filters}
          organizationalUnits={organizationalUnits}
          needTypes={needTypes}
          state={state}
          actions={actions}
          dataTable={dataTable}
        />
      </div>

      <NeedIndexDialogs
        needs={needs.data}
        selectedDrawerNeed={state.selectedDrawerNeed}
        onDrawerClose={() => actions.setSelectedDrawerNeed(null)}
        deletingNeed={state.deletingNeed}
        onDeletingNeedChange={actions.setDeletingNeed}
        onConfirmDelete={actions.handleConfirmDelete}
        isDeleting={state.isDeleting}
        reviewingNeedId={state.reviewingNeedId}
        onReviewingNeedIdChange={actions.setReviewingNeedId}
        lockingNeed={state.lockingNeed}
        lockDialogMode={state.lockDialogMode}
        isLockDialogOpen={state.isLockDialogOpen}
        onLockDialogOpenChange={actions.setIsLockDialogOpen}
        onEdit={actions.onEdit}
        onDelete={actions.onDelete}
        onReview={actions.onReview}
        onLock={actions.onLock}
        onUnlock={actions.onUnlock}
      />
    </>
  );
}

NeedsIndex.layout = (props: NeedsIndexProps) => ({
  breadcrumbs: [
    {
      title: props.currentGroup?.name || 'Kelompok Usulan',
      href: props.currentGroup
        ? needRoutes.index.url({
            query: { need_group_id: props.currentGroup.id },
          })
        : '#',
    },
  ],
});
