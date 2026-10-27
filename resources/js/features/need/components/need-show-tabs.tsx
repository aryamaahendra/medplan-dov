import { ChecklistForm } from '@/components/needs/checklist-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategicAlignmentViewer } from '@/features/need/strategic-alignment';
import { usePermission } from '@/hooks/use-permission';
import { NeedAttachmentsTab } from '@/pages/need/needs/components/need-attachments-tab';
import { NeedDetailTab } from '@/pages/need/needs/components/need-detail-tab';
import { NeedGeneralTab } from '@/pages/need/needs/components/need-general-tab';
import type { ChecklistQuestion, ChecklistAnswer, Need } from '@/types';

interface NeedShowTabsProps {
  need: Need;
  checklistQuestions: { data: ChecklistQuestion[] };
  existingAnswers: { data: ChecklistAnswer[] };
  users: { id: number; name: string; nip: string | null }[];
}

export function NeedShowTabs({
  need,
  checklistQuestions,
  existingAnswers,
  users,
}: NeedShowTabsProps) {
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

  return (
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
          <StrategicAlignmentViewer framework="renstra" need={need} />
        </TabsContent>
      )}
      {hasPermission('view need tab ikk') && (
        <TabsContent value="ikk" className="mt-0">
          <StrategicAlignmentViewer framework="ikk" need={need} />
        </TabsContent>
      )}
      {hasPermission('view need tab rls') && (
        <TabsContent value="rls" className="mt-0">
          <StrategicAlignmentViewer framework="rls" need={need} />
        </TabsContent>
      )}
      {hasPermission('view need tab planning') && (
        <TabsContent value="planning" className="mt-0">
          <StrategicAlignmentViewer framework="planning" need={need} />
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
  );
}
