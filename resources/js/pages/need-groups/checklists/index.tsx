import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import needGroupChecklistActions from '@/actions/App/Http/Controllers/NeedGroupChecklistController';
import needGroupActions from '@/actions/App/Http/Controllers/NeedGroupController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { EmptyState } from './components/empty-state';
import { QuestionBankDialog } from './components/question-bank-dialog';
import { SortableItem } from './components/sortable-item';
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

  return (
    <>
      <Head title={`Kelola Checklist - ${needGroup.name}`} />

      <div className="flex max-w-3xl flex-col gap-6 p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              Kelola Checklist: {needGroup.name}
            </h1>
            <Badge variant="outline">Tahun {needGroup.year}</Badge>
          </div>
          <p className="text-muted-foreground">
            Tentukan pertanyaan mana yang harus dijawab saat menginput usulan di
            kelompok ini.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">
              Daftar Pertanyaan ({questions.length})
            </h2>
            <div className="flex gap-2">
              <QuestionBankDialog
                availableQuestions={availableQuestions.data}
                assignedQuestions={questions}
                onAdd={addQuestion}
                open={isSelectorOpen}
                onOpenChange={setIsSelectorOpen}
              />

              <Button
                onClick={saveChanges}
                disabled={processing || questions === assignedQuestions}
                size="sm"
                className="gap-2"
              >
                <Save />
                Simpan Perubahan
              </Button>
            </div>
          </div>

          <Card className="rounded-none py-0 ring-0">
            <CardContent className="p-0">
              {questions.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="flex flex-col gap-2">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={questions.map((q) => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {questions.map((q) => (
                        <SortableItem
                          key={q.id}
                          question={q}
                          onRemove={removeQuestion}
                          onToggleActive={toggleActive}
                          onToggleRequired={toggleRequired}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground italic">
            <AlertCircle className="size-4" />
            <span>
              Tarik dan lepas (drag & drop) untuk mengatur urutan pertanyaan.
            </span>
          </div>
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
