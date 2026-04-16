import type { Need } from '../columns';
import { NeedDetailView } from './need-detail-view';

interface NeedDetailTabProps {
  need: Need;
}

export function NeedDetailTab({ need }: NeedDetailTabProps) {
  return (
    <>
      <div className="mt-4 space-y-1">
        <h2 className="text-xl font-semibold">Detail Proposal</h2>
        <p className="text-sm text-muted-foreground">
          Informasi dokumen proposal usulan kebutuhan.
        </p>
      </div>
      <NeedDetailView detail={need.detail} />
    </>
  );
}
