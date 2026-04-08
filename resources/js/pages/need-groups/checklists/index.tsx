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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Head, Link, useForm } from '@inertiajs/react';
import {
  AlertCircle,
  ChevronLeft,
  GripVertical,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import needGroupChecklistActions from '@/actions/App/Http/Controllers/NeedGroupChecklistController';
import needGroupActions from '@/actions/App/Http/Controllers/NeedGroupController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ChecklistQuestion {
  id: number;
  question: string;
  description?: string | null;
  is_active: boolean; // Global active status
  order_column: number;
}

interface AssignedQuestion {
  id: number;
  question: string;
  is_active: boolean; // Pivot active status
  is_required: boolean;
  order_column: number;
}

interface NeedGroup {
  id: number;
  name: string;
  year: number;
}

interface Props {
  needGroup: NeedGroup;
  assignedQuestions: AssignedQuestion[];
  availableQuestions: { data: ChecklistQuestion[] };
}

function SortableItem({
  question,
  onRemove,
  onToggleActive,
  onToggleRequired,
}: {
  question: AssignedQuestion;
  onRemove: (id: number) => void;
  onToggleActive: (id: number) => void;
  onToggleRequired: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50 ${isDragging ? 'border-primary shadow-lg' : ''}`}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium sm:text-base">
          {question.question}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Label
            htmlFor={`required-${question.id}`}
            className="cursor-pointer text-xs font-medium"
          >
            Wajib
          </Label>
          <Switch
            id={`required-${question.id}`}
            checked={question.is_required}
            onCheckedChange={() => onToggleRequired(question.id)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label
            htmlFor={`active-${question.id}`}
            className="cursor-pointer text-xs font-medium"
          >
            Aktif
          </Label>
          <Switch
            id={`active-${question.id}`}
            checked={question.is_active}
            onCheckedChange={() => onToggleActive(question.id)}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(question.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
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

      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={needGroupActions.index.url()}
            className="flex items-center transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali ke Kelompok Usulan
          </Link>
        </div>

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
            <h2 className="text-lg font-medium">
              Daftar Pertanyaan ({questions.length})
            </h2>
            <div className="flex gap-2">
              <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                    Tambah dari Bank
                  </Button>
                </DialogTrigger>
                <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Bank Pertanyaan Checklist</DialogTitle>
                    <DialogDescription>
                      Pilih pertanyaan dari bank untuk ditambahkan ke kelompok
                      usulan ini.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-1 flex-col gap-2 overflow-y-auto py-4 pr-2">
                    {availableQuestions.data.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                        <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Belum ada pertanyaan di bank.
                        </p>
                      </div>
                    ) : (
                      availableQuestions.data.map((q) => {
                        const isAssigned = questions.some(
                          (aq) => aq.id === q.id,
                        );

                        return (
                          <div
                            key={q.id}
                            className={`flex items-start justify-between rounded-md border p-3 text-sm transition-colors ${
                              isAssigned
                                ? 'bg-muted/50 opacity-60'
                                : 'hover:bg-accent'
                            } ${!q.is_active ? 'border-dashed border-destructive/30' : ''}`}
                          >
                            <div className="flex flex-1 flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {q.question}
                                </span>
                                {!q.is_active && (
                                  <Badge
                                    variant="destructive"
                                    className="h-4 px-1 text-[10px] leading-none"
                                  >
                                    Non-aktif Global
                                  </Badge>
                                )}
                              </div>
                              {q.description && (
                                <span className="text-xs text-muted-foreground">
                                  {q.description}
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant={isAssigned ? 'ghost' : 'outline'}
                              className="ml-4 h-8 shrink-0"
                              disabled={isAssigned || !q.is_active}
                              onClick={() => addQuestion(q)}
                            >
                              {isAssigned ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : !q.is_active ? (
                                <XCircle className="h-4 w-4 text-destructive" />
                              ) : (
                                'Pilih'
                              )}
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setIsSelectorOpen(false)}>
                      Selesai
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                onClick={saveChanges}
                disabled={processing || questions === assignedQuestions}
                size="sm"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Simpan Perubahan
              </Button>
            </div>
          </div>

          <Card className={`${questions.length === 0 ? 'border-dashed' : ''}`}>
            <CardContent className="p-0">
              {questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <ClipboardList className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Belum ada Checklist</h3>
                  <p className="mx-auto mb-6 max-w-xs text-sm text-muted-foreground">
                    Kelompok usulan ini belum memiliki checklist pertanyaan.
                    Klik tombol di atas untuk menambah dari bank pertanyaan.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-4">
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

          <div className="flex justify-end gap-2 text-sm text-muted-foreground italic">
            <AlertCircle className="h-4 w-4" />
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
