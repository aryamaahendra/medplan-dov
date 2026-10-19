import { Head } from '@inertiajs/react';
import { RiAlertLine } from '@remixicon/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import needRoutes from '@/routes/needs';
import type {
  KpiGroup,
  Need,
  PlanningActivityVersion,
  StrategicServicePlan,
  Tujuan,
} from '@/types';

import { NeedForm } from './components/need-form';
import { NeedLockBanner } from './components/need-lock-banner';

interface EditProps {
  need: Need;
  currentGroup: { id: number; name: string; year: number };
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  needTypes: { id: number; name: string }[];
  tujuans: Tujuan[];
  kpiGroups: KpiGroup[];
  strategicServicePlans: StrategicServicePlan[];
  planningActivities: PlanningActivityVersion[];
  fundingSources: { id: number; name: string }[];
  users: { id: number; name: string; nip: string | null }[];
  kldiOptions: { name: string; value: string }[];
  satkerOptions: { name: string; value: string }[];
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
  users,
  kldiOptions,
  satkerOptions,
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

        <NeedLockBanner need={need} />

        {Boolean(need.organizational_unit_id && !need.organizational_unit) && (
          <Alert variant="destructive">
            <RiAlertLine className="h-4 w-4" />
            <AlertTitle className="font-semibold">
              Unit Kerja Tidak Aktif
            </AlertTitle>
            <AlertDescription className="text-sm">
              Unit kerja sebelumnya telah dihapus atau tidak aktif. Silakan
              pilih unit kerja aktif untuk melanjutkan pembaruan usulan.
            </AlertDescription>
          </Alert>
        )}
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
            users={users}
            kldiOptions={kldiOptions}
            satkerOptions={satkerOptions}
          />
        </div>
      </div>
    </>
  );
}

Edit.layout = (props: EditProps) => ({
  breadcrumbs: [
    {
      title: props.currentGroup?.name || 'Kelompok Usulan',
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
