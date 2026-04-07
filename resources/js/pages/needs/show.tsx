import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

import needRoutes from '@/routes/needs';

import { NeedContextConditions } from './components/need-context-conditions';
import { NeedGeneralInfo } from './components/need-general-info';
import { IkkAlignmentShow } from './components/ikk-alignment-show';
import { RlsAlignmentShow } from './components/rls-alignment-show';
import { NeedHeader } from './components/need-header';
import { NeedSidebar } from './components/need-sidebar';
import { StrategicAlignmentSection } from './components/strategic-alignment-section';
import type { Need, Sasaran, Tujuan } from './columns';

interface NeedShowProps {
  need: Need;
}

export default function NeedShow({ need }: NeedShowProps) {
  const groupedRenstra = useMemo(() => {
    if (!need.sasarans) {
      return [];
    }

    const tujuanMap = new Map<number, Tujuan & { sasarans: Sasaran[] }>();

    need.sasarans.forEach((sasaran) => {
      const tujuan = sasaran.tujuan;

      if (!tujuan) {
        return;
      }

      if (!tujuanMap.has(tujuan.id)) {
        tujuanMap.set(tujuan.id, { ...tujuan, sasarans: [] });
      }

      const indicators =
        need.indicators?.filter((i) => i.sasaran_id === sasaran.id) ?? [];

      tujuanMap.get(tujuan.id)?.sasarans.push({
        ...sasaran,
        indicators,
      });
    });

    return Array.from(tujuanMap.values());
  }, [need]);

  return (
    <>
      <Head title={`Detail Usulan: ${need.title}`} />

      <div className="flex flex-col gap-4 p-4 md:p-8">
        <NeedHeader need={need} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-4 lg:col-span-2">
            <NeedGeneralInfo need={need} />
            <NeedContextConditions need={need} />
            <StrategicAlignmentSection groupedRenstra={groupedRenstra} />
            <IkkAlignmentShow need={need} />
            <RlsAlignmentShow need={need} />
          </div>

          {/* Sidebar */}
          <NeedSidebar need={need} />
        </div>
      </div>
    </>
  );
}

NeedShow.layout = {
  breadcrumbs: [
    {
      title: 'Usulan Kebutuhan',
      href: needRoutes.index.url(),
    },
    {
      title: 'Detail Usulan',
    },
  ],
};
