import type { DragEndEvent } from '@dnd-kit/core';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import needGroupChecklistActions from '@/actions/App/Http/Controllers/Need/NeedGroupChecklistController';
import needGroupActions from '@/actions/App/Http/Controllers/Need/NeedGroupController';
import { ChecklistHeader } from './components/checklist-header';
import { QuestionList } from './components/question-list';
import { QuestionToolbar } from './components/question-toolbar';
import type { AssignedQuestion, ChecklistQuestion, NeedGroup } from './types';

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
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = assignedQuestions.findIndex((i) => i.id === active.id);
      const newIndex = assignedQuestions.findIndex((i) => i.id === over.id);

      const newItems = arrayMove(assignedQuestions, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          order_column: index + 1,
        }),
      );

      router
        .optimistic(() => ({
          assignedQuestions: newItems,
        }))
        .post(
          needGroupChecklistActions.reorder.url({ need_group: needGroup.id }),
          {
            questions: newItems.map((item) => ({
              id: item.id,
              order_column: item.order_column,
            })),
          },
          {
            onSuccess: () => {
              toast.success('Urutan checklist berhasil diperbarui.');
            },
            onError: () => {
              toast.error('Gagal memperbarui urutan checklist.');
            },
          },
        );
    }
  };

  const toggleActive = (id: number) => {
    const question = assignedQuestions.find((q) => q.id === id);

    if (!question) {
      return;
    }

    const newActive = !question.is_active;

    router
      .optimistic(() => ({
        assignedQuestions: assignedQuestions.map((q) =>
          q.id === id ? { ...q, is_active: newActive } : q,
        ),
      }))
      .patch(
        needGroupChecklistActions.update.url({
          need_group: needGroup.id,
          checklist_question: id,
        }),
        { is_active: newActive },
        {
          onSuccess: () => {
            toast.success('Checklist berhasil diperbarui.');
          },
          onError: () => {
            toast.error('Gagal memperbarui checklist.');
          },
        },
      );
  };

  const toggleRequired = (id: number) => {
    const question = assignedQuestions.find((q) => q.id === id);

    if (!question) {
      return;
    }

    const newRequired = !question.is_required;

    router
      .optimistic(() => ({
        assignedQuestions: assignedQuestions.map((q) =>
          q.id === id ? { ...q, is_required: newRequired } : q,
        ),
      }))
      .patch(
        needGroupChecklistActions.update.url({
          need_group: needGroup.id,
          checklist_question: id,
        }),
        { is_required: newRequired },
        {
          onSuccess: () => {
            toast.success('Checklist berhasil diperbarui.');
          },
          onError: () => {
            toast.error('Gagal memperbarui checklist.');
          },
        },
      );
  };

  const removeQuestion = (id: number) => {
    router
      .optimistic(() => ({
        assignedQuestions: assignedQuestions.filter((q) => q.id !== id),
      }))
      .delete(
        needGroupChecklistActions.destroy.url({
          need_group: needGroup.id,
          checklist_question: id,
        }),
        {
          onSuccess: () => {
            toast.success('Pertanyaan berhasil dihapus.');
          },
          onError: () => {
            toast.error('Gagal menghapus pertanyaan.');
          },
        },
      );
  };

  const addQuestion = (q: ChecklistQuestion) => {
    if (assignedQuestions.some((item) => item.id === q.id)) {
      toast.error('Pertanyaan sudah ada di daftar.');

      return;
    }

    const newQuestion: AssignedQuestion = {
      id: q.id,
      question: q.question,
      description: q.description,
      is_active: true,
      is_required: false,
      order_column: assignedQuestions.length + 1,
    };

    router
      .optimistic(() => ({
        assignedQuestions: [...assignedQuestions, newQuestion],
      }))
      .post(
        needGroupChecklistActions.store.url({ need_group: needGroup.id }),
        {
          checklist_question_id: q.id,
          is_active: true,
          is_required: false,
          order_column: newQuestion.order_column,
        },
        {
          onSuccess: () => {
            toast.success('Pertanyaan berhasil ditambahkan.');
          },
          onError: () => {
            toast.error('Gagal menambahkan pertanyaan.');
          },
        },
      );
  };

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
