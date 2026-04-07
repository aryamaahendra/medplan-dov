import { Link } from '@inertiajs/react';
import { ArrowLeft, ChevronRight, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import needRoutes from '@/routes/needs';

import type { Need } from '../columns';

interface NeedHeaderProps {
  need: Need;
}

export function NeedHeader({ need }: NeedHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {need.title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link href={needRoutes.index.url()}>
            <ArrowLeft className="mr-2" />
            Kembali
          </Link>
        </Button>
        <Button asChild>
          <Link href={needRoutes.edit.url({ need: need.id })}>
            <Edit className="mr-2" />
            Edit Usulan
          </Link>
        </Button>
      </div>
    </div>
  );
}
