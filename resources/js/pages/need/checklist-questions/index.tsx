import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import checklistQuestionRoutes from '@/routes/checklist-questions';

import { ChecklistQuestionDialog } from './checklist-question-dialog';
import type { ChecklistQuestion } from './columns';
import { getColumns } from './columns';

interface PaginatedQuestions {
  data: ChecklistQuestion[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface ChecklistQuestionsIndexProps {
  questions: PaginatedQuestions;
  filters: DataTableFilters;
}

export default function ChecklistQuestionsIndex({
  questions,
  filters,
}: ChecklistQuestionsIndexProps) {
  const [editingQuestion, setEditingQuestion] =
    useState<ChecklistQuestion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] =
    useState<ChecklistQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({ only: ['questions', 'filters'] });

  const onEdit = (question: ChecklistQuestion) => {
    setEditingQuestion(question);
    setIsDialogOpen(true);
  };

  const onDelete = (question: ChecklistQuestion) => {
    setDeletingQuestion(question);
  };

  const handleConfirmDelete = () => {
    if (!deletingQuestion) {
      return;
    }

    setIsDeleting(true);

    router.delete(
      checklistQuestionRoutes.destroy.url({
        checklist_question: deletingQuestion.id,
      }),
      {
        onSuccess: () => {
          toast.success('Pertanyaan checklist berhasil dihapus.');
          setDeletingQuestion(null);
        },
        onFinish: () => setIsDeleting(false),
      },
    );
  };

  const stableColumns = useMemo(() => getColumns(onEdit, onDelete), []);

  return (
    <>
      <Head title="Bank Pertanyaan Checklist" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Bank Pertanyaan Checklist
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola daftar pertanyaan checklist yang akan muncul pada usulan
              kebutuhan.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingQuestion(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus />
            Tambah Pertanyaan
          </Button>
        </div>

        <DataTable
          columns={stableColumns}
          data={questions.data}
          meta={questions}
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
          searchPlaceholder="Cari berdasarkan pertanyaan atau deskripsi..."
        />
      </div>

      <ChecklistQuestionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        question={editingQuestion}
      />

      <ConfirmDialog
        open={!!deletingQuestion}
        onOpenChange={(open) => !open && setDeletingQuestion(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Pertanyaan Checklist"
        description={`Apakah Anda yakin ingin menghapus "${deletingQuestion?.question}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}

ChecklistQuestionsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Bank Pertanyaan Checklist',
      href: checklistQuestionRoutes.index.url(),
    },
  ],
};
