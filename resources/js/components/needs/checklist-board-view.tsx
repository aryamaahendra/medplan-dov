import {
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiHashtag,
  RiSubtractLine,
} from '@remixicon/react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ChecklistQuestion } from '@/types';

interface ChecklistBoardViewProps {
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

export function ChecklistBoardView({
  questions,
  answers,
  onAnswerChange,
  onNotesChange,
  readonly = false,
}: ChecklistBoardViewProps) {
  const grouped = useMemo(() => {
    const yes: Array<{ question: ChecklistQuestion; index: number }> = [];
    const no: Array<{ question: ChecklistQuestion; index: number }> = [];
    const skip: Array<{ question: ChecklistQuestion; index: number }> = [];

    questions.forEach((q, index) => {
      const ans = answers.find((a) => a.checklist_question_id === q.id);
      const val = ans?.answer || 'skip';

      if (val === 'yes') {
        yes.push({ question: q, index });
      } else if (val === 'no') {
        no.push({ question: q, index });
      } else {
        skip.push({ question: q, index });
      }
    });

    return { yes, no, skip };
  }, [questions, answers]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Column 1: Memenuhi Syarat (Ya) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950">
              <RiCheckLine className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
              Memenuhi Syarat (Ya)
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-background font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300"
          >
            {grouped.yes.length}
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {grouped.yes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground italic">
              Belum ada parameter yang dinyatakan memenuhi syarat.
            </div>
          ) : (
            grouped.yes.map(({ question, index }) => (
              <BoardQuestionCard
                key={question.id}
                question={question}
                index={index}
                currentAnswer="yes"
                notes={
                  answers.find((a) => a.checklist_question_id === question.id)
                    ?.notes || ''
                }
                onAnswerChange={(val) => onAnswerChange(question.id, val)}
                onNotesChange={(val) => onNotesChange(question.id, val)}
                readonly={readonly}
                accent="emerald"
              />
            ))
          )}
        </div>
      </div>

      {/* Column 2: Perlu Perbaikan (Tidak) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white dark:bg-rose-500 dark:text-zinc-950">
              <RiCloseLine className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold text-rose-800 dark:text-rose-200">
              Belum Memenuhi (Tidak)
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-rose-500/40 bg-background font-mono text-xs font-semibold text-rose-700 dark:text-rose-300"
          >
            {grouped.no.length}
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {grouped.no.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground italic">
              Tidak ada catatan parameter yang ditolak atau belum memenuhi.
            </div>
          ) : (
            grouped.no.map(({ question, index }) => (
              <BoardQuestionCard
                key={question.id}
                question={question}
                index={index}
                currentAnswer="no"
                notes={
                  answers.find((a) => a.checklist_question_id === question.id)
                    ?.notes || ''
                }
                onAnswerChange={(val) => onAnswerChange(question.id, val)}
                onNotesChange={(val) => onNotesChange(question.id, val)}
                readonly={readonly}
                accent="rose"
              />
            ))
          )}
        </div>
      </div>

      {/* Column 3: Belum Dinilai / Dilewati (Lewati) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/40 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30 text-foreground">
              <RiSubtractLine className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              Belum Dinilai (Lewati)
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-border bg-background font-mono text-xs font-semibold text-muted-foreground"
          >
            {grouped.skip.length}
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {grouped.skip.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground italic">
              Semua parameter telah dievaluasi.
            </div>
          ) : (
            grouped.skip.map(({ question, index }) => (
              <BoardQuestionCard
                key={question.id}
                question={question}
                index={index}
                currentAnswer="skip"
                notes={
                  answers.find((a) => a.checklist_question_id === question.id)
                    ?.notes || ''
                }
                onAnswerChange={(val) => onAnswerChange(question.id, val)}
                onNotesChange={(val) => onNotesChange(question.id, val)}
                readonly={readonly}
                accent="muted"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BoardQuestionCard({
  question,
  index,
  currentAnswer,
  notes,
  onAnswerChange,
  onNotesChange,
  readonly,
  accent,
}: {
  question: ChecklistQuestion;
  index: number;
  currentAnswer: 'yes' | 'no' | 'skip';
  notes: string;
  onAnswerChange: (value: 'yes' | 'no' | 'skip') => void;
  onNotesChange: (value: string) => void;
  readonly: boolean;
  accent: 'emerald' | 'rose' | 'muted';
}) {
  return (
    <Card
      className={cn(
        'transition-all hover:shadow-xs',
        accent === 'emerald' && 'border-emerald-500/30',
        accent === 'rose' && 'border-rose-500/30',
        accent === 'muted' && 'border-border/80',
      )}
    >
      <CardHeader className="p-3.5 pb-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            <RiHashtag className="h-2.5 w-2.5" />
            {index + 1}
          </Badge>

          {/* Quick status switch buttons */}
          {!readonly && (
            <div className="inline-flex rounded-md border border-border/80 bg-muted/30 p-0.5">
              <button
                type="button"
                onClick={() => onAnswerChange('yes')}
                title="Pindahkan ke Memenuhi"
                className={cn(
                  'rounded p-1 transition-colors',
                  currentAnswer === 'yes'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <RiCheckLine className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => onAnswerChange('no')}
                title="Pindahkan ke Belum Memenuhi"
                className={cn(
                  'rounded p-1 transition-colors',
                  currentAnswer === 'no'
                    ? 'bg-rose-600 text-white dark:bg-rose-500 dark:text-zinc-950'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <RiCloseLine className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => onAnswerChange('skip')}
                title="Pindahkan ke Dilewati"
                className={cn(
                  'rounded p-1 transition-colors',
                  currentAnswer === 'skip'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <RiSubtractLine className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <CardTitle className="text-xs leading-snug font-semibold text-foreground sm:text-sm">
          {question.question}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2.5 p-3.5 pt-0">
        {question.description && (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {question.description}
          </p>
        )}

        <div className="relative">
          <Textarea
            placeholder={
              readonly ? 'Tidak ada catatan.' : 'Catatan parameter...'
            }
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            readOnly={readonly}
            rows={2}
            className="min-h-[48px] resize-y bg-muted/20 text-xs transition-colors focus-visible:bg-background"
          />
          {!notes && !readonly && (
            <RiErrorWarningLine className="pointer-events-none absolute top-2.5 right-2.5 h-3.5 w-3.5 text-muted-foreground/30" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
