import {
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiHashtag,
  RiSubtractLine,
} from '@remixicon/react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card>
      <CardContent className="divide-y p-0">
        {questions.map((question, index) => {
          const currentAnswer = answers.find(
            (a) => a.checklist_question_id === question.id,
          );
          const answerValue = currentAnswer?.answer || 'skip';
          const notesValue = currentAnswer?.notes || '';

          return (
            <div
              key={question.id}
              className={cn(
                'flex flex-col gap-4 p-5 transition-colors',
                answerValue === 'yes' && 'hover:bg-emerald-500/5',
                answerValue === 'no' && 'hover:bg-rose-500/5',
                answerValue === 'skip' && 'hover:bg-muted/30',
              )}
            >
              <div className="flex items-start gap-4">
                <Badge
                  variant="outline"
                  className={cn(
                    'mt-0.5 shrink-0 font-mono text-xs',
                    answerValue === 'yes' &&
                      'border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
                    answerValue === 'no' &&
                      'border-rose-500/40 text-rose-700 dark:text-rose-300',
                  )}
                >
                  <RiHashtag data-icon="inline-start" className="h-3 w-3" />
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
                      <span className="text-xs font-medium text-muted-foreground">
                        Hasil Evaluasi:
                      </span>
                      <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-1">
                        <button
                          type="button"
                          disabled={readonly}
                          onClick={() => onAnswerChange(question.id, 'yes')}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                            answerValue === 'yes'
                              ? 'bg-emerald-600 font-semibold text-white shadow-xs dark:bg-emerald-500 dark:text-zinc-950'
                              : 'text-muted-foreground hover:text-foreground',
                            readonly && 'cursor-not-allowed opacity-60',
                          )}
                        >
                          <RiCheckLine className="h-3.5 w-3.5" />
                          <span>Ya (Memenuhi)</span>
                        </button>

                        <button
                          type="button"
                          disabled={readonly}
                          onClick={() => onAnswerChange(question.id, 'no')}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                            answerValue === 'no'
                              ? 'bg-rose-600 font-semibold text-white shadow-xs dark:bg-rose-500 dark:text-zinc-950'
                              : 'text-muted-foreground hover:text-foreground',
                            readonly && 'cursor-not-allowed opacity-60',
                          )}
                        >
                          <RiCloseLine className="h-3.5 w-3.5" />
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
                          <RiSubtractLine className="h-3.5 w-3.5" />
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
                        <RiErrorWarningLine className="pointer-events-none absolute top-3 right-3 h-4 w-4 text-muted-foreground/30" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
