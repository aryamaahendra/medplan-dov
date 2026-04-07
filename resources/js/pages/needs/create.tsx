import { Head } from '@inertiajs/react';
import needRoutes from '@/routes/needs';
import type { Tujuan } from './columns';
import { NeedForm } from './components/need-form';

interface CreateProps {
  organizationalUnits: { id: number; name: string }[];
  needTypes: { id: number; name: string }[];
  tujuans: Tujuan[];
  kpiGroups: any[];
  strategicServicePlans: any[];
  needGroups: { id: number; name: string; year: number }[];
}

export default function Create({
  organizationalUnits,
  needTypes,
  tujuans,
  kpiGroups,
  strategicServicePlans,
  needGroups,
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
            tujuans={tujuans}
            kpiGroups={kpiGroups}
            strategicServicePlans={strategicServicePlans}
            needGroups={needGroups}
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
