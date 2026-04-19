import { useEffect } from 'react';
import InputError from '@/components/input-error';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

import type { Need } from '@/types';

const STATUS_OPTIONS = [
  {
    value: 'draft',
    label: 'Draft',
    description: 'Usulan masih dalam tahap pengerjaan.',
  },
  {
    value: 'submitted',
    label: 'Diajukan',
    description: 'Usulan telah dikirim untuk ditelaah.',
  },
  {
    value: 'approved',
    label: 'Disetujui',
    description: 'Usulan telah disetujui untuk diproses.',
  },
  {
    value: 'rejected',
    label: 'Ditolak',
    description: 'Usulan tidak dapat dilanjutkan.',
  },
] as const;

const PRIORITY_LEVELS = [
  {
    value: 'high',
    label: 'Tinggi',
    description: {
      urgency: 'Butuh penanganan segera dan mendesak.',
      impact: 'Berpengaruh besar terhadap operasional utama.',
    },
  },
  {
    value: 'medium',
    label: 'Sedang',
    description: {
      urgency: 'Dibutuhkan namun masih bisa dijadwalkan.',
      impact: 'Berpengaruh pada efisiensi kerja tim.',
    },
  },
  {
    value: 'low',
    label: 'Rendah',
    description: {
      urgency: 'Dapat dipenuhi sesuai ketersediaan sumber daya.',
      impact: 'Dampak minimal terhadap keseluruhan sistem.',
    },
  },
] as const;

interface PriorityStatusSectionProps {
  data: any;
  setData: (key: string, value: any) => void;
  errors: any;
}

export function PriorityStatusSection({
  data,
  setData,
  errors,
}: PriorityStatusSectionProps) {
  useEffect(() => {
    setData('is_priority', data.urgency === 'high' && data.impact === 'high');
  }, [data.urgency, data.impact, setData]);

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-3">
        <Label>Status Usulan</Label>
        <RadioGroup
          value={data.status}
          onValueChange={(v) => setData('status', v as Need['status'])}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          {STATUS_OPTIONS.map((s) => (
            <FieldLabel
              key={s.value}
              htmlFor={`status-${s.value}`}
              className="cursor-pointer"
            >
              <Field orientation="horizontal" className="p-3">
                <FieldContent>
                  <FieldTitle>{s.label}</FieldTitle>
                  <FieldDescription className="text-xs">
                    {s.description}
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem value={s.value} id={`status-${s.value}`} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
        <InputError message={errors.status} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-3">
          <Label>Tingkat Urgensi</Label>
          <RadioGroup
            value={data.urgency}
            onValueChange={(v) => setData('urgency', v as Need['urgency'])}
            className="g-cols-1 grid gap-3 space-y-2 md:grid-cols-2"
          >
            {PRIORITY_LEVELS.map((level) => (
              <FieldLabel
                key={level.value}
                htmlFor={`urgency-${level.value}`}
                className="cursor-pointer"
              >
                <Field orientation="horizontal" className="p-2.5">
                  <FieldContent>
                    <FieldTitle>{level.label}</FieldTitle>
                    <FieldDescription className="text-xs">
                      {level.description.urgency}
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem
                    value={level.value}
                    id={`urgency-${level.value}`}
                  />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          <InputError message={errors.urgency} />
        </div>

        <div className="space-y-3">
          <Label>Tingkat Dampak</Label>
          <RadioGroup
            value={data.impact}
            onValueChange={(v) => setData('impact', v as Need['impact'])}
            className="g-cols-1 grid gap-3 space-y-2 md:grid-cols-2"
          >
            {PRIORITY_LEVELS.map((level) => (
              <FieldLabel
                key={level.value}
                htmlFor={`impact-${level.value}`}
                className="cursor-pointer"
              >
                <Field orientation="horizontal" className="p-2.5">
                  <FieldContent>
                    <FieldTitle>{level.label}</FieldTitle>
                    <FieldDescription className="text-xs">
                      {level.description.impact}
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem
                    value={level.value}
                    id={`impact-${level.value}`}
                  />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          <InputError message={errors.impact} />
        </div>
      </div>

      <div className="pt-2">
        <div
          className={cn(
            'overflow-hidden rounded-lg border transition-all duration-200',
            data.is_priority
              ? 'border-red-500/30! bg-red-500/10! dark:border-red-500/20! dark:bg-red-500/5!'
              : 'border-muted! bg-muted/30! dark:bg-muted/10!',
          )}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    data.is_priority
                      ? 'animate-pulse bg-red-500'
                      : 'bg-muted-foreground/30',
                  )}
                />
                <span
                  className={cn(
                    'text-base font-semibold',
                    data.is_priority ? 'text-red-700 dark:text-red-400' : '',
                  )}
                >
                  {data.is_priority
                    ? 'Prioritas Utama'
                    : 'Bukan Prioritas Utama'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {data.is_priority
                  ? 'Usulan ini otomatis ditandai sebagai prioritas strategis karena Urgensi & Dampak Tinggi.'
                  : 'Tandai Urgensi & Dampak sebagai "Tinggi" untuk menjadikan usulan ini prioritas.'}
              </p>
            </div>
          </div>
        </div>
        <InputError message={errors.is_priority} />
      </div>
    </div>
  );
}
