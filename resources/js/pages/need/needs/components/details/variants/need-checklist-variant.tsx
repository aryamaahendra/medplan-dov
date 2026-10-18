import { ChecklistForm } from '@/components/needs/checklist-form';
import type { ChecklistAnswer, ChecklistQuestion, Need } from '@/types';

interface NeedChecklistVariantProps {
  need: Need;
  questions: ChecklistQuestion[];
  existingAnswers: ChecklistAnswer[];
  isLocked: boolean;
}

export function NeedChecklistVariant({
  need,
  questions,
  existingAnswers,
  isLocked,
}: NeedChecklistVariantProps) {
  const readonly = !need.can?.performChecklist || isLocked;

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

      {/* Interactive Checklist Form */}
      <div>
        <ChecklistForm
          needId={need.id}
          questions={questions}
          existingAnswers={existingAnswers}
          readonly={readonly}
          initialVariant="card"
        />
      </div>
    </div>
  );
}
