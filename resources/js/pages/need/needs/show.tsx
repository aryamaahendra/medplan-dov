import { Head } from '@inertiajs/react';

import { NeedShowTabs } from '@/features/need/components/need-show-tabs';
import needRoutes from '@/routes/needs';
import type { ChecklistQuestion, ChecklistAnswer, Need } from '@/types';

import { NeedHeader } from './components/need-header';
import { NeedLockBanner } from './components/need-lock-banner';
import { NeedSidebar } from './components/need-sidebar';

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
  return (
    <>
      <Head title={`Detail Usulan: ${need.title}`} />

      <div className="flex flex-col gap-4 p-4 md:p-8">
        <NeedHeader need={need} />

        <NeedLockBanner need={need} />

        <div className="grid grid-cols-1 items-start gap-4 pt-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <NeedShowTabs
              need={need}
              checklistQuestions={checklistQuestions}
              existingAnswers={existingAnswers}
              users={users}
            />
          </div>

          <div className="sticky top-4">
            <NeedSidebar need={need} />
          </div>
        </div>
      </div>
    </>
  );
}

NeedShow.layout = (props: NeedShowProps) => {
  const group = props.need?.needGroup;
  const groupId = props.need?.need_group_id ?? group?.id;

  return {
    breadcrumbs: [
      {
        title: group?.name || 'Kelompok Usulan',
        href: groupId
          ? needRoutes.index.url({
              query: { need_group_id: groupId },
            })
          : needRoutes.index.url(),
      },
      {
        title: 'Detail Usulan',
        href: '#',
      },
    ],
  };
};
