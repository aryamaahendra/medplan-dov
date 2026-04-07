import { router, useForm } from '@inertiajs/react';
import {
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Info,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import NeedChecklistAnswerController from '@/actions/NeedChecklistAnswerController';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { ChecklistAnswer, ChecklistQuestion } from '@/types';

interface ChecklistFormProps {
  needId: number;
  questions: ChecklistQuestion[];
  existingAnswers: ChecklistAnswer[];
}

export function ChecklistForm({
  needId,
  questions,
  existingAnswers,
}: ChecklistFormProps) {
  const { data, setData } = useForm({
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

  const isInitialMount = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const performSave = useCallback(() => {
    router.post(
      NeedChecklistAnswerController.store.url({ need: needId }),
      { answers: data.answers },
      {
        preserveScroll: true,
      },
    );
  }, [data.answers, needId]);

  // Handle auto-save
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSave();
    }, 1000); // 1 second debounce for all changes

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [data.answers, performSave]);

  const updateAnswer = (questionId: number, value: 'yes' | 'no' | 'skip') => {
    setData(
      'answers',
      data.answers.map((a) =>
        a.checklist_question_id === questionId ? { ...a, answer: value } : a,
      ),
    );
  };

  const updateNotes = (questionId: number, notes: string) => {
    setData(
      'answers',
      data.answers.map((a) =>
        a.checklist_question_id === questionId ? { ...a, notes } : a,
      ),
    );
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <Info className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Tidak ada pertanyaan checklist</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Belum ada pertanyaan checklist yang dikonfigurasi untuk kelompok
          usulan ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">
            Checklist Kelayakan
          </h2>
          <p className="text-sm text-muted-foreground">
            Lengkapi checklist di bawah ini untuk menilai kelayakan usulan.
            Perubahan disimpan secara otomatis.
          </p>
        </div>
      </div>

      <div className="divide-y rounded-xl border bg-card shadow-sm">
        {questions.map((q, index) => {
          const currentAnswer = data.answers.find(
            (a) => a.checklist_question_id === q.id,
          );

          return (
            <div key={q.id} className="p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <h4 className="leading-relaxed font-medium text-foreground">
                        {q.question}
                      </h4>
                      {q.description && (
                        <p className="text-sm text-muted-foreground">
                          {q.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-4 lg:w-72 lg:items-end">
                  <RadioGroup
                    value={currentAnswer?.answer}
                    onValueChange={(val) =>
                      updateAnswer(q.id, val as 'yes' | 'no' | 'skip')
                    }
                    className="flex flex-wrap gap-2 lg:justify-end"
                  >
                    <Label
                      htmlFor={`q-${q.id}-yes`}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all hover:bg-muted/50 ${
                        currentAnswer?.answer === 'yes'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10'
                          : ''
                      }`}
                    >
                      <RadioGroupItem
                        value="yes"
                        id={`q-${q.id}-yes`}
                        className="sr-only"
                      />
                      <CheckCircle2 className="h-4 w-4" />
                      Ya
                    </Label>
                    <Label
                      htmlFor={`q-${q.id}-no`}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all hover:bg-muted/50 ${
                        currentAnswer?.answer === 'no'
                          ? 'border-destructive bg-destructive/5 text-destructive dark:bg-destructive/10'
                          : ''
                      }`}
                    >
                      <RadioGroupItem
                        value="no"
                        id={`q-${q.id}-no`}
                        className="sr-only"
                      />
                      <XCircle className="h-4 w-4" />
                      Tidak
                    </Label>
                    <Label
                      htmlFor={`q-${q.id}-skip`}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all hover:bg-muted/50 ${
                        currentAnswer?.answer === 'skip'
                          ? 'border-muted-foreground/30 bg-muted/30 text-muted-foreground'
                          : ''
                      }`}
                    >
                      <RadioGroupItem
                        value="skip"
                        id={`q-${q.id}-skip`}
                        className="sr-only"
                      />
                      <HelpCircle className="h-4 w-4" />
                      Lewati
                    </Label>
                  </RadioGroup>
                </div>
              </div>

              <div className="mt-4 flex gap-4 pl-12">
                <Textarea
                  placeholder="Tambahkan catatan khusus untuk poin ini..."
                  value={currentAnswer?.notes || ''}
                  onChange={(e) => updateNotes(q.id, e.target.value)}
                  className="min-h-[80px] bg-muted/20"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
