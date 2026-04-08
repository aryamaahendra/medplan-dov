import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { AssignedQuestion, ChecklistQuestion } from '../types';
import { QuestionBankDialog } from './question-bank-dialog';

interface Props {
  questionsCount: number;
  availableQuestions: ChecklistQuestion[];
  assignedQuestions: AssignedQuestion[];
  onAdd: (q: ChecklistQuestion) => void;
  onSave: () => void;
  processing: boolean;
  isDirty: boolean;
  isSelectorOpen: boolean;
  onSelectorOpenChange: (open: boolean) => void;
}

export function QuestionToolbar({
  questionsCount,
  availableQuestions,
  assignedQuestions,
  onAdd,
  onSave,
  processing,
  isDirty,
  isSelectorOpen,
  onSelectorOpenChange,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-medium">
        Daftar Pertanyaan ({questionsCount})
      </h2>
      <div className="flex gap-2">
        <QuestionBankDialog
          availableQuestions={availableQuestions}
          assignedQuestions={assignedQuestions}
          onAdd={onAdd}
          open={isSelectorOpen}
          onOpenChange={onSelectorOpenChange}
        />

        <Button
          onClick={onSave}
          disabled={processing || !isDirty}
          size="sm"
          className="gap-2"
        >
          <Save className="size-4" />
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}
