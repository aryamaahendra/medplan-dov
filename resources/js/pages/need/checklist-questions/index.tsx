import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { getChecklistQuestionColumns } from '@/features/checklist-question/components/checklist-question-columns';
import { ChecklistQuestionDialog } from '@/features/checklist-question/components/checklist-question-dialog';
import type {
  ChecklistQuestion,
  PaginatedChecklistQuestions,
} from '@/features/checklist-question/types/checklist-question.types';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import { useResourceIndexController } from '@/hooks/use-resource-index-controller';
import checklistQuestionRoutes from '@/routes/checklist-questions';

interface ChecklistQuestionsIndexProps {
  questions: PaginatedChecklistQuestions;
  filters: DataTableFilters;
}

export default function ChecklistQuestionsIndex({
  questions,
  filters,
}: ChecklistQuestionsIndexProps) {
  const { hasPermission } = usePermission();

  const controller = useResourceIndexController<ChecklistQuestion>({
    data: questions,
    filters,
    only: ['questions', 'filters'],
    resourceName: 'Pertanyaan checklist',
    deleteUrl: (question) =>
      checklistQuestionRoutes.destroy.url({ checklist_question: question.id }),
    getColumns: ({ onEdit, onDelete }) =>
      getChecklistQuestionColumns(onEdit, onDelete, hasPermission),
    searchPlaceholder: 'Cari berdasarkan pertanyaan atau deskripsi...',
  });

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
            <Button onClick={controller.dialog.openCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah Pertanyaan
            </Button>
          )}
        </div>

        <DataTable {...controller.tableProps} />
      </div>

      <ChecklistQuestionDialog
        key={controller.dialog.editingItem?.id ?? 'new'}
        open={controller.dialog.isOpen}
        onOpenChange={controller.dialog.setIsOpen}
        question={controller.dialog.editingItem}
      />

      <ConfirmDialog
        open={controller.deleteDialog.isOpen}
        onOpenChange={controller.deleteDialog.setIsOpen}
        onConfirm={controller.deleteDialog.confirmDelete}
        title="Hapus Pertanyaan Checklist"
        description={`Apakah Anda yakin ingin menghapus "${controller.deleteDialog.deletingItem?.question}"? Data yang dihapus akan dipindahkan ke tempat sampah (Soft Delete).`}
        confirmText="Hapus"
        variant="destructive"
        loading={controller.deleteDialog.isDeleting}
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
