import type { Need } from '../columns';
import { NeedGeneralInfo } from './need-general-info';

interface NeedGeneralTabProps {
  need: Need;
}

export function NeedGeneralTab({ need }: NeedGeneralTabProps) {
  return (
    <div className="mt-4">
      <div className="mb-6 space-y-1">
        <h2 className="text-xl font-semibold">Informasi Umum</h2>
        <p className="text-sm text-muted-foreground">
          Informasi umum mengenai usulan kebutuhan.
        </p>
      </div>

      <NeedGeneralInfo need={need} />
    </div>
  );
}
