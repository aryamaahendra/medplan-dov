import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import needRoutes from '@/routes/needs';

import type { Need, Sasaran, Tujuan } from './columns';
import { IkkAlignmentShow } from './components/ikk-alignment-show';
import { NeedGeneralInfo } from './components/need-general-info';
import { NeedHeader } from './components/need-header';
import { NeedSidebar } from './components/need-sidebar';
import { RlsAlignmentShow } from './components/rls-alignment-show';
import { StrategicAlignmentSection } from './components/strategic-alignment-section';

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

        <div className="grid grid-cols-1 items-start gap-4 pt-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="general">
              <TabsList>
                <TabsTrigger value="general">Informasi Umum</TabsTrigger>
                <TabsTrigger value="strategic">Renstra</TabsTrigger>
                <TabsTrigger value="ikk">IKK</TabsTrigger>
                <TabsTrigger value="rls">RLS</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="mt-0">
                <div className="mt-4">
                  <div className="mb-6 space-y-1">
                    <h2 className="text-xl font-semibold">Informasi Umum</h2>
                    <p className="text-sm text-muted-foreground">
                      Informasi umum mengenai usulan kebutuhan.
                    </p>
                  </div>

                  <NeedGeneralInfo need={need} />
                </div>
              </TabsContent>
              <TabsContent value="strategic" className="mt-0">
                <StrategicAlignmentSection groupedRenstra={groupedRenstra} />
              </TabsContent>
              <TabsContent value="ikk" className="mt-0">
                <IkkAlignmentShow need={need} />
              </TabsContent>
              <TabsContent value="rls" className="mt-0">
                <RlsAlignmentShow need={need} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="sticky top-4">
            <NeedSidebar need={need} />
          </div>
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
      href: '#',
    },
  ],
};
