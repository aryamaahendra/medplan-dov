import { Head } from '@inertiajs/react';

import needGroupActions from '@/actions/App/Http/Controllers/Need/NeedGroupController';
import { useNeedGroupChecklists } from '@/features/need-group/hooks/use-need-group-checklists';
import type {
  AssignedQuestion,
  ChecklistQuestion,
} from '@/features/need-group/hooks/use-need-group-checklists';
import type { NeedGroup } from '@/features/need-group/types/need-group.types';

import { ChecklistHeader } from './components/checklist-header';
import { QuestionList } from './components/question-list';
import { QuestionToolbar } from './components/question-toolbar';

interface Props {
  needGroup: NeedGroup;
  assignedQuestions: AssignedQuestion[];
  availableQuestions: { data: ChecklistQuestion[] };
}

export default function ChecklistManagement({
  needGroup,
  assignedQuestions,
  availableQuestions,
}: Props) {
  const {
    isSelectorOpen,
    setIsSelectorOpen,
    sensors,
    handleDragEnd,
    toggleActive,
    toggleRequired,
    removeQuestion,
    addQuestion,
  } = useNeedGroupChecklists({ needGroup, assignedQuestions });

  return (
    <>
      <Head title={`Kelola Checklist - ${needGroup.name}`} />

      <div className="flex max-w-3xl flex-col gap-6 p-4">
        <ChecklistHeader name={needGroup.name} year={needGroup.year} />

        <div className="flex flex-col gap-4">
          <QuestionToolbar
            questionsCount={assignedQuestions.length}
            availableQuestions={availableQuestions.data}
            assignedQuestions={assignedQuestions}
            onAdd={addQuestion}
            isSelectorOpen={isSelectorOpen}
            onSelectorOpenChange={setIsSelectorOpen}
          />

          <QuestionList
            questions={assignedQuestions}
            sensors={sensors}
            handleDragEnd={handleDragEnd}
            removeQuestion={removeQuestion}
            toggleActive={toggleActive}
            toggleRequired={toggleRequired}
          />
        </div>
      </div>
    </>
  );
}

ChecklistManagement.layout = {
  breadcrumbs: [
    {
      title: 'Kelompok Usulan',
      href: needGroupActions.index.url(),
    },
    {
      title: 'Kelola Checklist',
    },
  ],
};
