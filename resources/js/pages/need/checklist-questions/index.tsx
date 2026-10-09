import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { ChecklistQuestionDialog } from '@/features/checklist-question/components/checklist-question-dialog';
import { useChecklistQuestionsIndex } from '@/features/checklist-question/hooks/use-checklist-questions-index';
import type { PaginatedChecklistQuestions } from '@/features/checklist-question/types/checklist-question.types';
import type { DataTableFilters } from '@/hooks/use-data-table';
import checklistQuestionRoutes from '@/routes/checklist-questions';

interface ChecklistQuestionsIndexProps {
  questions: PaginatedChecklistQuestions;
  filters: DataTableFilters;
}

export default function ChecklistQuestionsIndex({
  questions,
  filters,
}: ChecklistQuestionsIndexProps) {
  const { state, actions, hasPermission, dataTable } =
    useChecklistQuestionsIndex();

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
          {hasPermission('create checklist-questions') && (
            <Button onClick={actions.onCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah Pertanyaan
            </Button>
          )}
        </div>

        <DataTable
          columns={state.columns}
          data={questions.data}
          meta={questions}
          filters={filters}
          onSearch={dataTable.onSearch}
          onSort={dataTable.onSort}
          onPageChange={dataTable.onPageChange}
          onPerPageChange={dataTable.onPerPageChange}
          onReset={dataTable.onReset}
          searchPlaceholder="Cari berdasarkan pertanyaan atau deskripsi..."
        />
      </div>

      <ChecklistQuestionDialog
        key={state.editingQuestion?.id ?? 'new'}
        open={state.isDialogOpen}
        onOpenChange={actions.setIsDialogOpen}
        question={state.editingQuestion}
      />

      <ConfirmDialog
        open={!!state.deletingQuestion}
        onOpenChange={(open) => !open && actions.setDeletingQuestion(null)}
        onConfirm={actions.handleConfirmDelete}
        title="Hapus Pertanyaan Checklist"
        description={`Apakah Anda yakin ingin menghapus "${state.deletingQuestion?.question}"? Data yang dihapus akan dipindahkan ke tempat sampah (Soft Delete).`}
        confirmText="Hapus"
        variant="destructive"
        loading={state.isDeleting}
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
