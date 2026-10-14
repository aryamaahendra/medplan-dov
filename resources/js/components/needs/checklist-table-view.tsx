import { RiCheckLine, RiCloseLine, RiSubtractLine } from '@remixicon/react';

import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ChecklistQuestion } from '@/types';

interface ChecklistTableViewProps {
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

export function ChecklistTableView({
  questions,
  answers,
  onAnswerChange,
  onNotesChange,
  readonly = false,
}: ChecklistTableViewProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="border-collapse [&_td]:border [&_td]:p-3 [&_td:first-child]:border-l-0 [&_td:last-child]:border-r-0 [&_th]:border [&_th]:p-3 [&_th:first-child]:border-l-0 [&_th:last-child]:border-r-0">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50px] border-r text-center font-semibold">
                  #
                </TableHead>
                <TableHead className="min-w-[300px] border-r font-semibold">
                  Parameter Evaluasi & Kriteria KAK
                </TableHead>
                <TableHead className="w-[240px] border-r text-center font-semibold">
                  Status Kelayakan
                </TableHead>
                <TableHead className="min-w-[260px] font-semibold">
                  Catatan / Temuan Evaluasi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question, index) => {
                const currentAnswer = answers.find(
                  (a) => a.checklist_question_id === question.id,
                );
                const answerValue = currentAnswer?.answer || 'skip';
                const notesValue = currentAnswer?.notes || '';

                return (
                  <TableRow
                    key={question.id}
                    className={cn(
                      'transition-colors hover:bg-muted/20',
                      answerValue === 'yes' && 'bg-emerald-500/[0.02]',
                      answerValue === 'no' && 'bg-rose-500/[0.02]',
                    )}
                  >
                    <TableCell className="border-r text-center align-top font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell className="border-r align-top">
                      <div className="space-y-1">
                        <div className="text-sm leading-snug font-medium text-foreground">
                          {question.question}
                        </div>
                        {question.description && (
                          <div className="text-xs leading-relaxed text-muted-foreground">
                            {question.description}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="border-r text-center align-top">
                      <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-1">
                        <button
                          type="button"
                          disabled={readonly}
                          onClick={() => onAnswerChange(question.id, 'yes')}
                          title="Memenuhi Syarat"
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                            answerValue === 'yes'
                              ? 'bg-emerald-600 font-semibold text-white shadow-xs dark:bg-emerald-500 dark:text-zinc-950'
                              : 'text-muted-foreground hover:text-foreground',
                            readonly && 'cursor-not-allowed opacity-60',
                          )}
                        >
                          <RiCheckLine className="h-3.5 w-3.5" />
                          <span>Ya</span>
                        </button>

                        <button
                          type="button"
                          disabled={readonly}
                          onClick={() => onAnswerChange(question.id, 'no')}
                          title="Tidak Memenuhi Syarat"
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                            answerValue === 'no'
                              ? 'bg-rose-600 font-semibold text-white shadow-xs dark:bg-rose-500 dark:text-zinc-950'
                              : 'text-muted-foreground hover:text-foreground',
                            readonly && 'cursor-not-allowed opacity-60',
                          )}
                        >
                          <RiCloseLine className="h-3.5 w-3.5" />
                          <span>Tidak</span>
                        </button>

                        <button
                          type="button"
                          disabled={readonly}
                          onClick={() => onAnswerChange(question.id, 'skip')}
                          title="Lewati / Belum Dinilai"
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
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
                    </TableCell>

                    <TableCell className="align-top">
                      <Textarea
                        placeholder={readonly ? '-' : 'Catatan evaluator...'}
                        value={notesValue}
                        onChange={(e) =>
                          onNotesChange(question.id, e.target.value)
                        }
                        readOnly={readonly}
                        rows={2}
                        className={cn(
                          'min-h-[52px] resize-y bg-transparent text-xs transition-colors focus-visible:bg-background',
                          notesValue && 'border-primary/40 font-medium',
                        )}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
