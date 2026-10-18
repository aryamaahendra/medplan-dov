import { useForm } from '@inertiajs/react';
import { RiClipboardLine } from '@remixicon/react';
import { useRef } from 'react';
import { toast } from 'sonner';

import NeedChecklistAnswerController from '@/actions/App/Http/Controllers/Need/NeedChecklistAnswerController';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import type { ChecklistAnswer, ChecklistQuestion } from '@/types';

import { ChecklistCardView } from './checklist-card-view';

export type ChecklistVariant = 'card';
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
}: ChecklistFormProps) {
  const { data, setData, post } = useForm({
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
      {/* Render Active Variant */}
      <ChecklistCardView
        questions={questions}
        answers={data.answers}
        onAnswerChange={updateAnswer}
        onNotesChange={updateNotes}
        readonly={readonly}
      />
    </div>
  );
}
