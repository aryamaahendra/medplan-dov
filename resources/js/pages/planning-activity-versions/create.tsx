import { Head } from '@inertiajs/react';

import planningVersions from '@/routes/planning-versions';
import type {
  PlanningActivityVersion,
  PlanningVersion,
} from '@/types/planning-version';

import { ActivityVersionForm } from './form';

interface CreateProps {
  version: PlanningVersion;
  parents: Pick<PlanningActivityVersion, 'id' | 'name' | 'type' | 'code'>[];
}

export default function Create({ version, parents }: CreateProps) {
  return (
    <>
      <Head title="Tambah Aktivitas Snapshot" />

      <div className="mx-auto max-w-4xl p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Tambah Aktivitas Snapshot
          </h1>
          <p className="text-muted-foreground">
            Tambahkan item baru ke snapshot {version.name}.
          </p>
        </div>

        <ActivityVersionForm version={version} parents={parents} />
      </div>
    </>
  );
}

Create.layout = (props: CreateProps) => ({
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
      title: 'Tambah',
    },
  ],
});
