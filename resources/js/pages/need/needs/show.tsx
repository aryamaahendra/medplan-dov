import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import { ChecklistForm } from '@/components/needs/checklist-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permission';
import needRoutes from '@/routes/needs';
import type { ChecklistQuestion, ChecklistAnswer } from '@/types';

import type { Need, Sasaran, Tujuan } from '@/types';

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
  const { hasPermission } = usePermission();

  const tabs = [
    {
      value: 'general',
      label: 'Informasi Umum',
      permission: 'view need tab general',
    },
    {
      value: 'strategic',
      label: 'Renstra',
      permission: 'view need tab strategic',
    },
    { value: 'ikk', label: 'IKK', permission: 'view need tab ikk' },
    { value: 'rls', label: 'RLS', permission: 'view need tab rls' },
    {
      value: 'detail',
      label: 'Detail KAK',
      permission: 'view need tab detail',
    },
    {
      value: 'lampiran',
      label: 'Lampiran',
      permission: 'view need-attachments',
    },
    {
      value: 'checklist',
      label: 'Checklist',
      permission: 'view need tab checklist',
    },
  ];

  const visibleTabs = tabs.filter((tab) => hasPermission(tab.permission));

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
            <Tabs defaultValue={visibleTabs[0]?.value ?? 'general'}>
              <TabsList>
                {visibleTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {hasPermission('view need tab general') && (
                <TabsContent value="general" className="mt-0">
                  <NeedGeneralTab need={need} />
                </TabsContent>
              )}
              {hasPermission('view need tab strategic') && (
                <TabsContent value="strategic" className="mt-0">
                  <StrategicAlignmentSection groupedRenstra={groupedRenstra} />
                </TabsContent>
              )}
              {hasPermission('view need tab ikk') && (
                <TabsContent value="ikk" className="mt-0">
                  <IkkAlignmentShow need={need} />
                </TabsContent>
              )}
              {hasPermission('view need tab rls') && (
                <TabsContent value="rls" className="mt-0">
                  <RlsAlignmentShow need={need} />
                </TabsContent>
              )}
              {hasPermission('view need tab planning') && (
                <TabsContent value="planning" className="mt-0">
                  <PlanningAlignmentShow need={need} />
                </TabsContent>
              )}
              {hasPermission('view need tab checklist') && (
                <TabsContent value="checklist" className="mt-0">
                  <ChecklistForm
                    key={need.id}
                    needId={need.id}
                    questions={checklistQuestions.data}
                    existingAnswers={existingAnswers.data}
                    readonly={!hasPermission('perform checklist')}
                  />
                </TabsContent>
              )}
              {hasPermission('view need tab detail') && (
                <TabsContent value="detail" className="mt-0">
                  <NeedDetailTab need={need} users={users} />
                </TabsContent>
              )}
              {hasPermission('view need-attachments') && (
                <TabsContent value="lampiran" className="mt-0">
                  <NeedAttachmentsTab need={need} />
                </TabsContent>
              )}
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
