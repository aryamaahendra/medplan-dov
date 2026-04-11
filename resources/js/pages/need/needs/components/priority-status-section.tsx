import InputError from '@/components/input-error';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import type { Need } from '../columns';

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
        <FieldGroup className="w-full">
          <FieldLabel
            htmlFor="is_priority"
            className={cn(
              'cursor-pointer overflow-hidden border transition-all duration-200',
              data.is_priority
                ? 'border-green-500/30! bg-green-500/10! dark:border-green-500/20! dark:bg-green-500/5!'
                : 'border-muted! bg-muted/30! dark:bg-muted/10!',
            )}
          >
            <Field orientation="horizontal" className="p-4">
              <FieldContent>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      data.is_priority
                        ? 'animate-pulse bg-green-500'
                        : 'bg-muted-foreground/30',
                    )}
                  />
                  <FieldTitle
                    className={cn(
                      'text-base',
                      data.is_priority
                        ? 'text-green-700 dark:text-green-400'
                        : '',
                    )}
                  >
                    {data.is_priority
                      ? 'Prioritas Utama'
                      : 'Bukan Prioritas Utama'}
                  </FieldTitle>
                </div>
                <FieldDescription className="mt-1">
                  Tandai jika usulan ini merupakan prioritas strategis yang
                  harus segera dipenuhi.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="is_priority"
                checked={data.is_priority}
                onCheckedChange={(checked) => setData('is_priority', checked)}
              />
            </Field>
          </FieldLabel>
          <InputError message={errors.is_priority} />
        </FieldGroup>
      </div>
    </div>
  );
}
