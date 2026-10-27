import type { Need } from '@/types';
import { NeedListCardDetailed } from './need-list-card-detailed';

interface NeedListViewProps {
  data: Need[];
  onEdit: (need: Need) => void;
  onDelete: (need: Need) => void;
  onReview: (need: Need) => void;
  onLock?: (need: Need) => void;
  onUnlock?: (need: Need) => void;
}

export function NeedListView({
  data,
  onEdit,
  onDelete,
  onReview,
  onLock,
  onUnlock,
}: NeedListViewProps) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-[220px] w-full items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Tidak ada data usulan yang ditemukan.
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {data.map((need) => (
        <NeedListCardDetailed
          key={need.id}
          need={need}
          onEdit={onEdit}
          onDelete={onDelete}
          onReview={onReview}
          onLock={onLock}
          onUnlock={onUnlock}
        />
      ))}
    </div>
  );
}
