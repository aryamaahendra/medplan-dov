import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useDataTable } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import checklistQuestionRoutes from '@/routes/checklist-questions';
import { getChecklistQuestionColumns } from '../components/checklist-question-columns';
import type { ChecklistQuestion } from '../types/checklist-question.types';

export function useChecklistQuestionsIndex() {
  const { hasPermission } = usePermission();
  const [editingQuestion, setEditingQuestion] =
    useState<ChecklistQuestion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] =
    useState<ChecklistQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const dataTable = useDataTable({ only: ['questions', 'filters'] });

  const onEdit = (question: ChecklistQuestion) => {
    setEditingQuestion(question);
    setIsDialogOpen(true);
  };

  const onDelete = (question: ChecklistQuestion) => {
    setDeletingQuestion(question);
  };

  const onCreate = () => {
    setEditingQuestion(null);
    setIsDialogOpen(true);
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

  const columns = useMemo(
    () => getChecklistQuestionColumns(onEdit, onDelete, hasPermission),
    [hasPermission],
  );

  return {
    state: {
      editingQuestion,
      isDialogOpen,
      deletingQuestion,
      isDeleting,
      columns,
    },
    actions: {
      setIsDialogOpen,
      setDeletingQuestion,
      onEdit,
      onDelete,
      onCreate,
      handleConfirmDelete,
    },
    hasPermission,
    dataTable,
  };
}
