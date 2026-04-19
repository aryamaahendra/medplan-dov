import type { Need } from '@/types';
import { NeedDetailView } from './need-detail-view';

interface NeedDetailTabProps {
  need: Need;
  users: { id: number; name: string; nip: string | null }[];
}

export function NeedDetailTab({ need, users }: NeedDetailTabProps) {
  return (
    <>
      <div className="mt-4 space-y-1">
        <h2 className="text-xl font-semibold">Detail Proposal</h2>
        <p className="text-sm text-muted-foreground">
          Informasi dokumen proposal usulan kebutuhan.
        </p>
      </div>
      <NeedDetailView
        needId={need.id}
        detail={need.detail}
        users={users}
        attachments={
          need.attachments?.filter(
            (a) => a.category === 'technical_specifications',
          ) ?? []
        }
      />
    </>
  );
}
