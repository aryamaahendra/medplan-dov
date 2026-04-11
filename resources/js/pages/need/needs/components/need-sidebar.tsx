import { Link } from '@inertiajs/react';
import { ArrowLeft, PencilLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import needRoutes from '@/routes/needs';
import type { Need } from '../columns';
import { NeedStatusOverview } from './need-status-overview';

interface NeedSidebarProps {
  need: Need;
}

export function NeedSidebar({ need }: NeedSidebarProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={needRoutes.index.url()}>
            <ArrowLeft />
            Kembali
          </Link>
        </Button>
        <Button asChild>
          <Link href={needRoutes.edit.url({ need: need.id })}>
            <PencilLine />
            Edit Usulan
          </Link>
        </Button>
      </div>
      <NeedStatusOverview need={need} />
    </div>
  );
}
