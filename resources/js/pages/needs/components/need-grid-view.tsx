import type { Need } from '../columns';
import { NeedCard } from './need-card';

interface NeedGridViewProps {
  data: Need[];
  onEdit: (need: Need) => void;
  onDelete: (need: Need) => void;
  onShowDetails: (need: Need) => void;
}

export function NeedGridView({
  data,
  onEdit,
  onDelete,
  onShowDetails,
}: NeedGridViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {data.map((need) => (
        <NeedCard
          key={need.id}
          need={need}
          onEdit={onEdit}
          onDelete={onDelete}
          onShowDetails={onShowDetails}
        />
      ))}
      {data.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Tidak ada data yang ditemukan.
        </div>
      )}
    </div>
  );
}
