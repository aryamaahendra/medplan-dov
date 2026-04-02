import { Head } from '@inertiajs/react';
import needRoutes from '@/routes/needs';
import type { Need, Tujuan } from './columns';
import { NeedForm } from './components/need-form';

interface EditProps {
  need: Need;
  organizationalUnits: { id: number; name: string }[];
  needTypes: { id: number; name: string }[];
  tujuans: Tujuan[];
}

export default function Edit({
  need,
  organizationalUnits,
  needTypes,
  tujuans,
}: EditProps) {
  return (
    <>
      <Head title={`Edit Usulan: ${need.title}`} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Usulan Kebutuhan
          </h1>
          <p className="text-muted-foreground">
            Perbarui detail untuk usulan &quot;{need.title}&quot;.
          </p>
        </div>

        <div className="flex-1">
          <NeedForm
            need={need}
            organizationalUnits={organizationalUnits}
            needTypes={needTypes}
            tujuans={tujuans}
          />
        </div>
      </div>
    </>
  );
}

Edit.layout = {
  breadcrumbs: [
    {
      title: 'Usulan Kebutuhan',
      href: needRoutes.index.url(),
    },
    {
      title: 'Edit Usulan',
    },
  ],
};
