import {
  RiCheckboxCircleFill,
  RiCheckDoubleFill,
  RiCloseCircleFill,
  RiSubtractFill,
} from '@remixicon/react';
import { useMemo } from 'react';

import { ChecklistForm } from '@/components/needs/checklist-form';
import { Card, CardContent } from '@/components/ui/card';
import type { ChecklistAnswer, ChecklistQuestion, Need } from '@/types';

interface NeedChecklistSectionProps {
  need: Need;
  questions: ChecklistQuestion[];
  existingAnswers: ChecklistAnswer[];
  isLocked: boolean;
}

export function NeedChecklistSection({
  need,
  questions,
  existingAnswers,
  isLocked,
}: NeedChecklistSectionProps) {
  const readonly = !need.can?.performChecklist || isLocked;

  const stats = useMemo(() => {
    let yesCount = 0;
    let noCount = 0;
    let skipCount = 0;

    questions.forEach((q) => {
      const ans = existingAnswers.find((a) => a.checklist_question_id === q.id);

      if (ans?.answer === 'yes') {
        yesCount += 1;
      } else if (ans?.answer === 'no') {
        noCount += 1;
      } else {
        skipCount += 1;
      }
    });

    const totalCount = questions.length;
    const evaluatedCount = yesCount + noCount;
    const progressPercent =
      totalCount > 0 ? Math.round((evaluatedCount / totalCount) * 100) : 0;

    return {
      yesCount,
      noCount,
      skipCount,
      totalCount,
      evaluatedCount,
      progressPercent,
    };
  }, [questions, existingAnswers]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="border-b border-border/80 pb-4">
        <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Lembar Evaluasi Kesiapan KAK
        </h3>
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
          Instrumen verifikasi kelengkapan dan kesiapan Kerangka Acuan Kerja
          (KAK) sebelum penetapan persetujuan.
        </p>
      </div>

      {/* Compact Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card size="sm" className="border-border/70 shadow-2xs">
          <CardContent className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                Kemajuan
              </span>
              <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {stats.progressPercent}%
              </div>
              <p className="text-xss text-muted-foreground">
                {stats.evaluatedCount} dari {stats.totalCount} terisi
              </p>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
              <RiCheckDoubleFill className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card size="sm" className="border-border/70 shadow-2xs">
          <CardContent className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                Memenuhi
              </span>
              <div className="font-mono text-2xl font-bold tracking-tight text-success-foreground dark:text-success">
                {stats.yesCount}
              </div>
              <p className="text-xss text-muted-foreground">
                Kriteria terpenuhi
              </p>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success-foreground dark:bg-success/20 dark:text-success">
              <RiCheckboxCircleFill className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card size="sm" className="border-border/70 shadow-2xs">
          <CardContent className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                Belum Memenuhi
              </span>
              <div className="font-mono text-2xl font-bold tracking-tight text-destructive">
                {stats.noCount}
              </div>
              <p className="text-xss text-muted-foreground">Perlu perbaikan</p>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive dark:bg-destructive/20">
              <RiCloseCircleFill className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card size="sm" className="border-border/70 shadow-2xs">
          <CardContent className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-xss font-semibold tracking-wider text-muted-foreground uppercase">
                Dilewati
              </span>
              <div className="font-mono text-2xl font-bold tracking-tight text-muted-foreground">
                {stats.skipCount}
              </div>
              <p className="text-xss text-muted-foreground">Belum dinilai</p>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <RiSubtractFill className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Checklist Form */}
      <div>
        <ChecklistForm
          needId={need.id}
          questions={questions}
          existingAnswers={existingAnswers}
          readonly={readonly}
        />
      </div>
    </div>
  );
}
