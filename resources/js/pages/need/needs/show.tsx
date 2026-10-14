import { Head } from '@inertiajs/react';

import needRoutes from '@/routes/needs';
import type { ChecklistAnswer, ChecklistQuestion, Need } from '@/types';

import { NeedShowCompactStats } from './components/details/need-show-compact-stats';
import { NeedShowDialogs } from './components/details/need-show-dialogs';
import { NeedShowHeader } from './components/details/need-show-header';
import { NeedShowLayout } from './components/details/need-show-layout';
import { useNeedShow } from './components/details/use-need-show';

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
  const showState = useNeedShow({ need, existingAnswers });

  return (
    <>
      <Head title={`Detail Usulan: ${need.title}`} />

      <div className="flex flex-col gap-6 p-4 md:p-8">
        <NeedShowHeader need={need} users={users} showState={showState} />
        <NeedShowCompactStats need={need} />

        <NeedShowLayout
          need={need}
          users={users}
          showState={showState}
          checklistQuestions={checklistQuestions}
          checklistAnswers={existingAnswers}
        />
      </div>

      <NeedShowDialogs need={need} showState={showState} />
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
          ? needRoutes.index.url({ query: { need_group_id: groupId } })
          : needRoutes.index.url(),
      },
      {
        title: 'Detail Usulan',
        href: '#',
      },
    ],
  };
};
