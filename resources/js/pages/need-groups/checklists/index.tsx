import type { DragEndEvent } from '@dnd-kit/core';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import needGroupChecklistActions from '@/actions/App/Http/Controllers/NeedGroupChecklistController';
import needGroupActions from '@/actions/App/Http/Controllers/NeedGroupController';

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
  const [questions, setQuestions] =
    useState<AssignedQuestion[]>(assignedQuestions);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const { setData, put, processing } = useForm({
    questions: assignedQuestions,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex).map(
          (item, index) => ({
            ...item,
            order_column: index + 1,
          }),
        );

        setData('questions', newItems);

        return newItems;
      });
    }
  };

  const toggleActive = (id: number) => {
    const newQuestions = questions.map((q) =>
      q.id === id ? { ...q, is_active: !q.is_active } : q,
    );
    setQuestions(newQuestions);
    setData('questions', newQuestions);
  };

  const toggleRequired = (id: number) => {
    const newQuestions = questions.map((q) =>
      q.id === id ? { ...q, is_required: !q.is_required } : q,
    );
    setQuestions(newQuestions);
    setData('questions', newQuestions);
  };

  const removeQuestion = (id: number) => {
    const newQuestions = questions.filter((q) => q.id !== id);
    setQuestions(newQuestions);
    setData('questions', newQuestions);
    toast.info('Pertanyaan dihapus dari daftar sementara.');
  };

  const addQuestion = (q: ChecklistQuestion) => {
    if (questions.some((item) => item.id === q.id)) {
      toast.error('Pertanyaan sudah ada di daftar.');

      return;
    }

    const newQuestion: AssignedQuestion = {
      id: q.id,
      question: q.question,
      description: q.description,
      is_active: true,
      is_required: false,
      order_column: questions.length + 1,
    };

    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);
    setData('questions', newQuestions);
    toast.success('Pertanyaan ditambahkan.');
  };

  const saveChanges = () => {
    put(needGroupChecklistActions.update.url({ need_group: needGroup.id }), {
      onSuccess: () => {
        toast.success('Checklist berhasil diperbarui.');
      },
      onError: () => {
        toast.error('Gagal memperbarui checklist.');
      },
    });
  };

  const isDirty = questions !== assignedQuestions;

  return (
    <>
      <Head title={`Kelola Checklist - ${needGroup.name}`} />

      <div className="flex max-w-3xl flex-col gap-6 p-4">
        <ChecklistHeader name={needGroup.name} year={needGroup.year} />

        <div className="flex flex-col gap-4">
          <QuestionToolbar
            questionsCount={questions.length}
            availableQuestions={availableQuestions.data}
            assignedQuestions={questions}
            onAdd={addQuestion}
            onSave={saveChanges}
            processing={processing}
            isDirty={isDirty}
            isSelectorOpen={isSelectorOpen}
            onSelectorOpenChange={setIsSelectorOpen}
          />

          <QuestionList
            questions={questions}
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
