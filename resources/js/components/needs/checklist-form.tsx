import { useForm } from '@inertiajs/react';
import {
  RiCheckDoubleLine,
  RiCheckLine,
  RiClipboardLine,
  RiCloseLine,
  RiKanbanView,
  RiLayoutGridLine,
  RiLoaderLine,
  RiSubtractLine,
  RiTableLine,
} from '@remixicon/react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import NeedChecklistAnswerController from '@/actions/App/Http/Controllers/Need/NeedChecklistAnswerController';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { ChecklistAnswer, ChecklistQuestion } from '@/types';

import { ChecklistBoardView } from './checklist-board-view';
import { ChecklistCardView } from './checklist-card-view';
import { ChecklistTableView } from './checklist-table-view';

export type ChecklistVariant = 'card' | 'table' | 'board';

interface ChecklistFormProps {
  needId: number;
  questions: ChecklistQuestion[];
  existingAnswers: ChecklistAnswer[];
  readonly?: boolean;
  initialVariant?: ChecklistVariant;
}

export function ChecklistForm({
  needId,
  questions,
  existingAnswers,
  readonly = false,
  initialVariant = 'table',
}: ChecklistFormProps) {
  const [activeVariant, setActiveVariant] =
    useState<ChecklistVariant>(initialVariant);

  const { data, setData, post, processing } = useForm({
    answers: questions.map((q) => {
      const existing = existingAnswers.find(
        (a) => a.checklist_question_id === q.id,
      );

      return {
        checklist_question_id: q.id,
        answer: existing?.answer || 'skip',
        notes: existing?.notes || '',
      };
    }),
  });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const performSave = (answersToSave: typeof data.answers) => {
    if (readonly) {
      return;
    }

    post(NeedChecklistAnswerController.store.url({ need: needId }), {
      preserveScroll: true,
      optimistic: (props: any) => {
        const currentAnswers = props.existingAnswers?.data || [];

        return {
          existingAnswers: {
            ...props.existingAnswers,
            data: answersToSave.map((a) => {
              const existing = currentAnswers.find(
                (ex: any) =>
                  ex.checklist_question_id === a.checklist_question_id,
              );

              return {
                ...existing,
                ...a,
                need_id: needId,
              } as ChecklistAnswer;
            }),
          },
        };
      },
      onSuccess: () => {
        toast.success('Pembaruan checklist berhasil disimpan', {
          id: 'checklist-save',
        });
      },
      onError: () => {
        toast.error('Gagal menyimpan pembaruan checklist');
        setData(
          'answers',
          questions.map((q) => {
            const existing = existingAnswers.find(
              (a) => a.checklist_question_id === q.id,
            );

            return {
              checklist_question_id: q.id,
              answer: existing?.answer || 'skip',
              notes: existing?.notes || '',
            };
          }),
        );
      },
    });
  };

  const updateAnswers = (nextAnswers: typeof data.answers) => {
    setData('answers', nextAnswers);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSave(nextAnswers);
    }, 1000);
  };

  const updateAnswer = (questionId: number, value: 'yes' | 'no' | 'skip') => {
    const nextAnswers = data.answers.map((a) =>
      a.checklist_question_id === questionId ? { ...a, answer: value } : a,
    );
    updateAnswers(nextAnswers);
  };

  const updateNotes = (questionId: number, notes: string) => {
    const nextAnswers = data.answers.map((a) =>
      a.checklist_question_id === questionId ? { ...a, notes } : a,
    );
    updateAnswers(nextAnswers);
  };

  // Evaluation summary stats
  const stats = useMemo(() => {
    let yesCount = 0;
    let noCount = 0;
    let skipCount = 0;

    data.answers.forEach((ans) => {
      if (ans.answer === 'yes') {
        yesCount += 1;
      } else if (ans.answer === 'no') {
        noCount += 1;
      } else {
        skipCount += 1;
      }
    });

    const evaluatedCount = yesCount + noCount;
    const totalCount = questions.length;
    const progressPercent =
      totalCount > 0 ? Math.round((evaluatedCount / totalCount) * 100) : 0;

    return {
      yesCount,
      noCount,
      skipCount,
      evaluatedCount,
      totalCount,
      progressPercent,
    };
  }, [data.answers, questions.length]);

  if (questions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <RiClipboardLine className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Tidak ada pertanyaan checklist</CardTitle>
            <CardDescription className="mt-1 max-w-xs">
              Belum ada pertanyaan checklist yang dikonfigurasi untuk kelompok
              usulan ini.
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4 space-y-6">
      {/* Header and Toolbar with Variant Switcher */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Checklist Kelayakan
              </h2>
              {processing && (
                <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <RiLoaderLine className="h-3 w-3 animate-spin" />
                  <span>Menyimpan...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Lengkapi instrumen evaluasi untuk menilai kelayakan teknis usulan.
            </p>
          </div>

          {/* 3 Variant Switcher Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-medium text-muted-foreground">
              Tampilan:
            </span>
            <ToggleGroup
              value={[activeVariant]}
              onValueChange={(val) => {
                if (val[0]) {
                  setActiveVariant(val[0] as ChecklistVariant);
                }
              }}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem
                value="card"
                aria-label="Tampilan Kartu"
                title="Tampilan Kartu Rinci"
                className="gap-1.5 text-xs"
              >
                <RiLayoutGridLine className="h-3.5 w-3.5" />
                <span>Kartu</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="table"
                aria-label="Tampilan Tabel"
                title="Tampilan Matriks Tabel"
                className="gap-1.5 text-xs"
              >
                <RiTableLine className="h-3.5 w-3.5" />
                <span>Tabel</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="board"
                aria-label="Tampilan Papan Status"
                title="Tampilan Papan Status Terkelompok"
                className="gap-1.5 text-xs"
              >
                <RiKanbanView className="h-3.5 w-3.5" />
                <span>Papan</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Evaluation Metrics / Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/40 bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-300"
            >
              <RiCheckLine className="h-3 w-3" />
              <span>Memenuhi: {stats.yesCount}</span>
            </Badge>

            <Badge
              variant="outline"
              className="gap-1 border-rose-500/40 bg-rose-500/10 font-semibold text-rose-700 dark:text-rose-300"
            >
              <RiCloseLine className="h-3 w-3" />
              <span>Belum Memenuhi: {stats.noCount}</span>
            </Badge>

            <Badge
              variant="outline"
              className="gap-1 border-border bg-muted/50 font-medium text-muted-foreground"
            >
              <RiSubtractLine className="h-3 w-3" />
              <span>Dilewati: {stats.skipCount}</span>
            </Badge>

            <span className="font-mono text-xs text-muted-foreground">
              ({stats.evaluatedCount}/{stats.totalCount} terisi)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RiCheckDoubleLine className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">
              {stats.progressPercent}%
            </span>
            <span>selesai</span>
          </div>
        </div>
      </div>

      {/* Render Active Variant */}
      {activeVariant === 'card' && (
        <ChecklistCardView
          questions={questions}
          answers={data.answers}
          onAnswerChange={updateAnswer}
          onNotesChange={updateNotes}
          readonly={readonly}
        />
      )}

      {activeVariant === 'table' && (
        <ChecklistTableView
          questions={questions}
          answers={data.answers}
          onAnswerChange={updateAnswer}
          onNotesChange={updateNotes}
          readonly={readonly}
        />
      )}

      {activeVariant === 'board' && (
        <ChecklistBoardView
          questions={questions}
          answers={data.answers}
          onAnswerChange={updateAnswer}
          onNotesChange={updateNotes}
          readonly={readonly}
        />
      )}
    </div>
  );
}
