import { Head } from '@inertiajs/react';

import needRoutes from '@/routes/needs';
import type { ChecklistAnswer, ChecklistQuestion, Need } from '@/types';

import { NeedShowVariant1 } from './components/details/need-show-variant-1';
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
        <NeedShowVariant1
          need={need}
          checklistQuestions={checklistQuestions}
          existingAnswers={existingAnswers}
          users={users}
        />
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
