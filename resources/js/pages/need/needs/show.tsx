import { Head } from '@inertiajs/react';

import needRoutes from '@/routes/needs';
import type { ChecklistAnswer, ChecklistQuestion, Need } from '@/types';

import { NeedShowBanners } from './components/details/need-show-banners';
import { NeedShowCanvas } from './components/details/need-show-canvas';
import { NeedShowCompactStats } from './components/details/need-show-compact-stats';
import { NeedShowDialogs } from './components/details/need-show-dialogs';
import { NeedShowHeader } from './components/details/need-show-header';
import { NeedShowNav } from './components/details/need-show-nav';
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

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:w-72">
            <NeedShowNav
              sections={showState.sections}
              activeSection={showState.activeSection}
              onSelectSection={showState.setActiveSection}
              currentIndex={showState.currentIndex}
            />
          </aside>

          <main className="min-w-0 flex-1 space-y-6">
            <NeedShowCanvas
              need={need}
              users={users}
              activeSection={showState.activeSection}
              currentSection={showState.currentSectionData}
              currentIndex={showState.currentIndex}
              totalSections={showState.sections.length}
              onPrev={showState.goPrev}
              onNext={showState.goNext}
              groupedRenstra={showState.groupedRenstra}
              checklistQuestions={checklistQuestions}
              checklistAnswers={showState.checklistAnswers}
              isLocked={showState.isLocked}
            />

            {/* All banners under Right Active Section Canvas */}
            <NeedShowBanners need={need} isOrphaned={showState.isOrphaned} />
          </main>
        </div>
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
