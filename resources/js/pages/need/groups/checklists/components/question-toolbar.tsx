import type { AssignedQuestion, ChecklistQuestion } from '../types';
import { QuestionBankDialog } from './question-bank-dialog';

interface Props {
  questionsCount: number;
  availableQuestions: ChecklistQuestion[];
  assignedQuestions: AssignedQuestion[];
  onAdd: (q: ChecklistQuestion) => void;
  isSelectorOpen: boolean;
  onSelectorOpenChange: (open: boolean) => void;
}

export function QuestionToolbar({
  questionsCount,
  availableQuestions,
  assignedQuestions,
  onAdd,
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
      </div>
    </div>
  );
}
