import { Head } from '@inertiajs/react';
import needRoutes from '@/routes/needs';
import type { Need, PlanningActivityVersion, Tujuan } from '@/types';

import { NeedForm } from './components/need-form';

interface EditProps {
  need: Need;
  currentGroup: { id: number; name: string; year: number };
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  needTypes: { id: number; name: string }[];
  tujuans: Tujuan[];
  kpiGroups: any[];
  strategicServicePlans: any[];
  planningActivities: PlanningActivityVersion[];
  fundingSources: { id: number; name: string }[];
}

export default function Edit({
  need,
  currentGroup,
  organizationalUnits,
  needTypes,
  tujuans,
  kpiGroups,
  strategicServicePlans,
  planningActivities,
  fundingSources,
}: EditProps) {
  return (
    <>
      <Head title={`${currentGroup.name}: Edit Usulan`} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Usulan: {currentGroup.name}
          </h1>
          <p className="text-muted-foreground">
            Perbarui detail usulan pada tahun anggaran {currentGroup.year}.
          </p>
        </div>

        <div className="flex-1">
          <NeedForm
            need={need}
            currentGroup={currentGroup}
            organizationalUnits={organizationalUnits}
            needTypes={needTypes}
            tujuans={tujuans}
            kpiGroups={kpiGroups}
            strategicServicePlans={strategicServicePlans}
            planningActivities={planningActivities}
            fundingSources={fundingSources}
          />
        </div>
      </div>
    </>
  );
}

Edit.layout = (props: EditProps) => ({
  breadcrumbs: [
    {
      title: 'Usulan Kebutuhan',
      href: '#',
    },
    {
      title: props.currentGroup?.name || 'Kelompok',
      href: props.currentGroup
        ? needRoutes.index.url({
            query: { need_group_id: props.currentGroup.id },
          })
        : '#',
    },
    {
      title: 'Edit Usulan',
      href: '#',
    },
  ],
});
