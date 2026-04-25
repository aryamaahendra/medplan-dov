import { AlertCircle, Hash } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { RadioGroup } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { ChecklistQuestion } from '@/types';

import { ResponseOption } from './response-option';

interface ChecklistItemProps {
  index: number;
  question: ChecklistQuestion;
  answer?: {
    checklist_question_id: number;
    answer: 'yes' | 'no' | 'skip';
    notes: string;
  };
  onAnswerChange: (value: 'yes' | 'no' | 'skip') => void;
  onNotesChange: (value: string) => void;
  readonly?: boolean;
}

export function ChecklistItem({
  index,
  question,
  answer,
  onAnswerChange,
  onNotesChange,
  readonly = false,
}: ChecklistItemProps) {
  return (
    <div className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/5">
      <div className="flex items-start gap-6">
        <Badge variant="outline" className="mt-0.5">
          <Hash />
          {index + 1}
        </Badge>

        <div className="shrink grow space-y-1">
          <h4 className="text-sm leading-snug font-medium sm:text-base">
            {question.question}
          </h4>
          {question.description && (
            <p className="text-xs text-muted-foreground sm:text-sm">
              {question.description}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <RadioGroup
                value={answer?.answer}
                onValueChange={(val) =>
                  !readonly && onAnswerChange(val as 'yes' | 'no' | 'skip')
                }
                disabled={readonly}
                className="flex flex-wrap gap-2"
              >
                <ResponseOption
                  id={`q-${question.id}-yes`}
                  value="yes"
                  label="Ya"
                  isActive={answer?.answer === 'yes'}
                  activeClass=""
                  disabled={readonly}
                />
                <ResponseOption
                  id={`q-${question.id}-no`}
                  value="no"
                  label="Tidak"
                  isActive={answer?.answer === 'no'}
                  activeClass=""
                  disabled={readonly}
                />
                <ResponseOption
                  id={`q-${question.id}-skip`}
                  value="skip"
                  label="Lewati"
                  isActive={answer?.answer === 'skip'}
                  activeClass=""
                  disabled={readonly}
                />
              </RadioGroup>
            </div>

            <div className="relative">
              <Textarea
                placeholder={readonly ? '' : 'Tambahkan catatan khusus...'}
                value={answer?.notes || ''}
                onChange={(e) => !readonly && onNotesChange(e.target.value)}
                readOnly={readonly}
                className="min-h-[80px] bg-muted/20 transition-colors focus-visible:bg-background"
              />
              {!answer?.notes && (
                <AlertCircle className="absolute top-3 right-3 h-4 w-4 text-muted-foreground/20" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
