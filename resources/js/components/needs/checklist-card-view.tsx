import {
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiHashtag,
  RiSubtractLine,
} from '@remixicon/react';

import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ChecklistQuestion } from '@/types';

interface ChecklistCardViewProps {
  questions: ChecklistQuestion[];
  answers: Array<{
    checklist_question_id: number;
    answer: 'yes' | 'no' | 'skip';
    notes: string;
  }>;
  onAnswerChange: (questionId: number, value: 'yes' | 'no' | 'skip') => void;
  onNotesChange: (questionId: number, value: string) => void;
  readonly?: boolean;
}

export function ChecklistCardView({
  questions,
  answers,
  onAnswerChange,
  onNotesChange,
  readonly = false,
}: ChecklistCardViewProps) {
  return (
    <div className="divide-y divide-border/60">
      {questions.map((question, index) => {
        const currentAnswer = answers.find(
          (a) => a.checklist_question_id === question.id,
        );
        const answerValue = currentAnswer?.answer || 'skip';
        const notesValue = currentAnswer?.notes || '';

        return (
          <div
            key={question.id}
            className="flex flex-col gap-4 bg-background py-5 transition-colors sm:py-6"
          >
            <div className="flex items-start gap-3.5 sm:gap-4">
              <Badge
                variant="outline"
                className={cn(
                  'mt-0.5 shrink-0 font-mono text-xs',
                  answerValue === 'yes' &&
                    'border-success/30 bg-success/15 text-success-foreground dark:bg-success/20 dark:text-success',
                  answerValue === 'no' &&
                    'border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20',
                )}
              >
                <RiHashtag data-icon="inline-start" />
                {index + 1}
              </Badge>

              <div className="shrink grow space-y-3">
                <div>
                  <h4 className="text-sm leading-snug font-semibold text-foreground sm:text-base">
                    {question.question}
                  </h4>
                  {question.description && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {question.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-1">
                  {/* Segmented Response Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-1">
                      <button
                        type="button"
                        disabled={readonly}
                        onClick={() => onAnswerChange(question.id, 'yes')}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                          answerValue === 'yes'
                            ? 'bg-success font-semibold text-success-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground',
                          readonly && 'cursor-not-allowed opacity-60',
                        )}
                      >
                        <RiCheckLine className="size-3.5" />
                        <span>Ya (Memenuhi)</span>
                      </button>

                      <button
                        type="button"
                        disabled={readonly}
                        onClick={() => onAnswerChange(question.id, 'no')}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                          answerValue === 'no'
                            ? 'bg-destructive font-semibold text-background shadow-xs'
                            : 'text-muted-foreground hover:text-foreground',
                          readonly && 'cursor-not-allowed opacity-60',
                        )}
                      >
                        <RiCloseLine className="size-3.5" />
                        <span>Tidak (Belum)</span>
                      </button>

                      <button
                        type="button"
                        disabled={readonly}
                        onClick={() => onAnswerChange(question.id, 'skip')}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                          answerValue === 'skip'
                            ? 'bg-background font-semibold text-foreground shadow-xs ring-1 ring-border'
                            : 'text-muted-foreground hover:text-foreground',
                          readonly && 'cursor-not-allowed opacity-60',
                        )}
                      >
                        <RiSubtractLine className="size-3.5" />
                        <span>Lewati</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes Field */}
                  <div className="relative">
                    <Textarea
                      placeholder={
                        readonly
                          ? 'Tidak ada catatan khusus.'
                          : 'Tambahkan catatan evaluasi atau referensi bukti...'
                      }
                      value={notesValue}
                      onChange={(e) =>
                        onNotesChange(question.id, e.target.value)
                      }
                      readOnly={readonly}
                      className={cn(
                        'min-h-[72px] resize-y bg-muted/20 text-xs transition-colors focus-visible:bg-background sm:text-sm',
                        notesValue && 'border-primary/40',
                      )}
                    />
                    {!notesValue && !readonly && (
                      <RiErrorWarningLine className="pointer-events-none absolute top-3 right-3 size-4 text-muted-foreground/30" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
