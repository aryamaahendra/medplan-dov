import { Head, router } from '@inertiajs/react';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import needGroupRoutes from '@/routes/need-groups';
import needRoutes from '@/routes/needs';

import type { Need, PaginatedNeeds } from '@/types';
import { NeedGroupDialog } from '../groups/need-group-dialog';
import { getColumns } from './columns';

import { NeedDirectorReviewDialog } from './components/need-director-review-dialog';
import { NeedGridView } from './components/need-grid-view';
import { NeedsHeader } from './components/needs-header';
import { NeedsTableToolbar } from './components/needs-table-toolbar';

// External store for viewMode to avoid hydration mismatch without useEffect
const viewModeStore = {
  subscribe(callback: () => void) {
    window.addEventListener('storage', callback);
    window.addEventListener('view-mode-change', callback);

    return () => {
      window.removeEventListener('storage', callback);
      window.removeEventListener('view-mode-change', callback);
    };
  },
  getSnapshot() {
    return (
      (localStorage.getItem('needs-view-mode') as 'table' | 'grid') || 'table'
    );
  },
  getServerSnapshot() {
    return 'loading' as const;
  },
  set(mode: 'table' | 'grid') {
    localStorage.setItem('needs-view-mode', mode);
    window.dispatchEvent(new Event('view-mode-change'));
  },
};

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
}

export default function NeedsIndex({
  needs,
  currentGroup,
  organizationalUnits,
  needTypes,
  filters,
}: NeedsIndexProps) {
  const [deletingNeed, setDeletingNeed] = useState<Need | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reviewingNeedId, setReviewingNeedId] = useState<number | null>(null);

  const viewMode = useSyncExternalStore(
    viewModeStore.subscribe,
    viewModeStore.getSnapshot,
    viewModeStore.getServerSnapshot,
  );

  const handleViewModeChange = (mode: 'table' | 'grid') => {
    viewModeStore.set(mode);
  };

  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [isDeletingGroupLoading, setIsDeletingGroupLoading] = useState(false);

  const {
    onSearch,
    onSort,
    onPageChange,
    onPerPageChange,
    onReset,
    mergeParams,
  } = useDataTable({ only: ['needs', 'filters'] });

  const onEdit = (need: Need) => {
    router.visit(needRoutes.edit.url({ need: need.id }));
  };

  const onCreate = () => {
    router.visit(
      needRoutes.create.url({ query: { need_group_id: currentGroup.id } }),
    );
  };

  const onDelete = (need: Need) => {
    setDeletingNeed(need);
  };

  const onReview = (need: Need) => {
    setReviewingNeedId(need.id);
  };

  const handleConfirmDelete = () => {
    if (!deletingNeed) {
      return;
    }

    setIsDeleting(true);

    router.delete(needRoutes.destroy.url({ need: deletingNeed.id }), {
      onSuccess: () => {
        toast.success('Usulan kebutuhan berhasil dihapus.');
        setDeletingNeed(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  };

  const handleConfirmDeleteGroup = () => {
    setIsDeletingGroupLoading(true);

    router.delete(
      needGroupRoutes.destroy.url({ need_group: currentGroup.id }),
      {
        onSuccess: () => {
          toast.success('Kelompok usulan berhasil dihapus.');
          router.visit(needGroupRoutes.index.url());
        },
        onFinish: () => setIsDeletingGroupLoading(false),
      },
    );
  };

  const { hasPermission } = usePermission();

  const stableColumns = useMemo(
    () => getColumns(onEdit, onDelete, onReview, hasPermission),
    [hasPermission],
  );

  return (
    <>
      <Head title={`Usulan: ${currentGroup.name}`} />

      <div className="flex flex-col gap-6 p-4">
        <NeedsHeader
          currentGroup={currentGroup}
          viewMode={viewMode}
          setViewMode={handleViewModeChange}
          onCreate={onCreate}
          onEditGroup={() => setIsGroupDialogOpen(true)}
          onDeleteGroup={() => setIsDeletingGroup(true)}
        />

        <NeedGroupDialog
          open={isGroupDialogOpen}
          onOpenChange={setIsGroupDialogOpen}
          needGroup={currentGroup as any}
        />

        <ConfirmDialog
          open={isDeletingGroup}
          onOpenChange={setIsDeletingGroup}
          onConfirm={handleConfirmDeleteGroup}
          title="Hapus Kelompok Usulan"
          description={`Apakah Anda yakin ingin menghapus "${currentGroup.name}"? Data usulan di dalam kelompok ini juga akan terdampak.`}
          confirmText="Hapus"
          variant="destructive"
          loading={isDeletingGroupLoading}
        />

        {viewMode === 'loading' ? (
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
                onEdit={onEdit}
                onDelete={onDelete}
                onReview={onReview}
              />
            )}
            toolbarChildren={
              <NeedsTableToolbar
                filters={filters}
                organizationalUnits={organizationalUnits}
                needTypes={needTypes}
                mergeParams={mergeParams}
              />
            }
            toolbarPosition="between-search-and-table"
          />
        )}
      </div>

      <ConfirmDialog
        open={!!deletingNeed}
        onOpenChange={(open) => !open && setDeletingNeed(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Usulan Kebutuhan"
        description={`Apakah Anda yakin ingin menghapus "${deletingNeed?.title}"? Data yang dihapus akan dipindahkan ke tempat sampah (Soft Delete).`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />

      {(() => {
        const reviewingNeed = needs.data.find((n) => n.id === reviewingNeedId);

        return (
          reviewingNeed && (
            <NeedDirectorReviewDialog
              key={reviewingNeed.id}
              need={reviewingNeed}
              open={!!reviewingNeedId}
              onOpenChange={(open) => !open && setReviewingNeedId(null)}
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
