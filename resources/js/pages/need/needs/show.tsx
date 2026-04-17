import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import { ChecklistForm } from '@/components/needs/checklist-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import needRoutes from '@/routes/needs';
import type { ChecklistQuestion, ChecklistAnswer } from '@/types';

import type { Need, Sasaran, Tujuan } from './columns';
import { IkkAlignmentShow } from './components/ikk-alignment-show';
import { NeedAttachmentsTab } from './components/need-attachments-tab';
import { NeedDetailTab } from './components/need-detail-tab';
import { NeedGeneralTab } from './components/need-general-tab';
import { NeedHeader } from './components/need-header';
import { NeedSidebar } from './components/need-sidebar';
import { PlanningAlignmentShow } from './components/planning-alignment-show';
import { RlsAlignmentShow } from './components/rls-alignment-show';
import { StrategicAlignmentSection } from './components/strategic-alignment-section';

interface NeedShowProps {
  need: Need;
  checklistQuestions: { data: ChecklistQuestion[] };
  existingAnswers: { data: ChecklistAnswer[] };
  users: { id: number; name: string; nip: string | null }[];
}

export default function NeedShow({
  need,
  checklistQuestions,
  existingAnswers,
  users,
}: NeedShowProps) {
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
                <TabsTrigger value="planning">Perencanaan</TabsTrigger>
                <TabsTrigger value="detail">Detail KAK</TabsTrigger>
                <TabsTrigger value="lampiran">Lampiran</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="mt-0">
                <NeedGeneralTab need={need} />
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
              <TabsContent value="planning" className="mt-0">
                <PlanningAlignmentShow need={need} />
              </TabsContent>
              <TabsContent value="checklist" className="mt-0">
                <ChecklistForm
                  key={need.id}
                  needId={need.id}
                  questions={checklistQuestions.data}
                  existingAnswers={existingAnswers.data}
                />
              </TabsContent>
              <TabsContent value="detail" className="mt-0">
                <NeedDetailTab need={need} users={users} />
              </TabsContent>
              <TabsContent value="lampiran" className="mt-0">
                <NeedAttachmentsTab need={need} />
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
