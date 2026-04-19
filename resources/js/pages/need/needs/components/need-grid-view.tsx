import type { Need } from '@/types';
import { NeedGridCard } from './need-grid-card';

interface NeedGridViewProps {
  data: Need[];
  onEdit: (need: Need) => void;
  onDelete: (need: Need) => void;
  onReview: (need: Need) => void;
}

export function NeedGridView({
  data,
  onEdit,
  onDelete,
  onReview,
}: NeedGridViewProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {data.map((need) => (
        <NeedGridCard
          key={need.id}
          need={need}
          onEdit={onEdit}
          onDelete={onDelete}
          onReview={onReview}
        />
      ))}
      {data.length === 0 && (
        <div className="col-span-3 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Tidak ada data yang ditemukan.
        </div>
      )}
    </div>
  );
}
