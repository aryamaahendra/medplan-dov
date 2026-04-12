import { Head } from '@inertiajs/react';

import planningVersions from '@/routes/planning-versions';
import type {
  PlanningActivityVersion,
  PlanningVersion,
} from '@/types/planning-version';

import { ActivityVersionForm } from './form';

interface EditProps {
  version: PlanningVersion;
  activity: PlanningActivityVersion;
  parents: Pick<PlanningActivityVersion, 'id' | 'name' | 'code'>[];
  activityTypes: { value: string; label: string }[];
}

export default function Edit({
  version,
  activity,
  parents,
  activityTypes,
}: EditProps) {
  return (
    <>
      <Head title={`Edit ${activity.name}`} />

      <div className="max-w-4xl p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Aktivitas Snapshot
          </h1>
          <p className="text-muted-foreground">
            Perbarui detail untuk {activity.name}.
          </p>
        </div>

        <ActivityVersionForm
          version={version}
          activity={activity}
          parents={parents}
          activityTypes={activityTypes}
        />
      </div>
    </>
  );
}

Edit.layout = (props: EditProps) => ({
  breadcrumbs: [
    {
      title: 'Versi Perencanaan',
      href: planningVersions.index.url(),
    },
    {
      title: 'Snapshot Aktivitas',
      href: planningVersions.activities.index.url(props.version.id),
    },
    {
      title: 'Edit',
    },
  ],
});
