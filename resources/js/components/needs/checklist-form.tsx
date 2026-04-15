import { useForm } from '@inertiajs/react';
import { ClipboardList, Loader2 } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import type { ChecklistAnswer, ChecklistQuestion } from '@/types';

import { ChecklistItem } from './checklist-item';
import NeedChecklistAnswerController from '@/actions/App/Http/Controllers/Need/NeedChecklistAnswerController';

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
        // Rollback local state to match server props
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

  if (questions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Tidak ada pertanyaan checklist</CardTitle>
          <CardDescription className="max-w-xs pt-1">
            Belum ada pertanyaan checklist yang dikonfigurasi untuk kelompok
            usulan ini.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4 space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Checklist Kelayakan
          </h2>
          {processing && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Menyimpan...</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Lengkapi checklist di bawah ini untuk menilai kelayakan usulan. Sistem
          akan menyimpan perubahan secara otomatis.
        </p>
      </div>

      <Card className="py-0">
        <CardContent className="divide-y p-0">
          {questions.map((q, index) => (
            <ChecklistItem
              key={q.id}
              index={index}
              question={q}
              answer={data.answers.find(
                (a) => a.checklist_question_id === q.id,
              )}
              onAnswerChange={(val) => updateAnswer(q.id, val)}
              onNotesChange={(val) => updateNotes(q.id, val)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
