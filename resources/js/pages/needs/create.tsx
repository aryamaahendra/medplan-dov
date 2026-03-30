import { Head } from '@inertiajs/react';
import needRoutes from '@/routes/needs';
import { NeedForm } from './components/need-form';

interface CreateProps {
  organizationalUnits: { id: number; name: string }[];
  needTypes: { id: number; name: string }[];
}

export default function Create({
  organizationalUnits,
  needTypes,
}: CreateProps) {
  return (
    <>
      <Head title="Tambah Usulan Kebutuhan" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Tambah Usulan Kebutuhan
          </h1>
          <p className="text-sm text-muted-foreground">
            Tambahkan usulan kebutuhan baru ke dalam sistem.
          </p>
        </div>

        <div className="flex-1">
          <NeedForm
            organizationalUnits={organizationalUnits}
            needTypes={needTypes}
          />
        </div>
      </div>
    </>
  );
}

Create.layout = {
  breadcrumbs: [
    {
      title: 'Usulan Kebutuhan',
      href: needRoutes.index.url(),
    },
    {
      title: 'Tambah Usulan',
      href: needRoutes.create.url(),
    },
  ],
};
