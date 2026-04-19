import { Head } from '@inertiajs/react';
import needRoutes from '@/routes/needs';
import type { PlanningActivityVersion, Tujuan } from '@/types';

import { NeedForm } from './components/need-form';

interface CreateProps {
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  currentGroup: { id: number; name: string; year: number };
  needTypes: { id: number; name: string }[];
  tujuans: Tujuan[];
  kpiGroups: any[];
  strategicServicePlans: any[];
  planningActivities: PlanningActivityVersion[];
}

export default function Create({
  organizationalUnits,
  currentGroup,
  needTypes,
  tujuans,
  kpiGroups,
  strategicServicePlans,
  planningActivities,
}: CreateProps) {
  return (
    <>
      <Head title={`${currentGroup.name}: Tambah Usulan`} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Tambah Usulan: {currentGroup.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Tahun Anggaran {currentGroup.year}
          </p>
        </div>

        <div className="flex-1">
          <NeedForm
            organizationalUnits={organizationalUnits}
            currentGroup={currentGroup}
            needTypes={needTypes}
            tujuans={tujuans}
            kpiGroups={kpiGroups}
            strategicServicePlans={strategicServicePlans}
            planningActivities={planningActivities}
          />
        </div>
      </div>
    </>
  );
}

Create.layout = (props: CreateProps) => ({
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
      title: 'Tambah Usulan',
      href: '#',
    },
  ],
});
