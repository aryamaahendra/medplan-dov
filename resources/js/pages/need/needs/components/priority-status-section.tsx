import { useEffect } from 'react';
import { RadioField } from '@/components/form';
import InputError from '@/components/input-error';
import { PRIORITY_LEVELS } from '@/constants/need';
import { cn } from '@/lib/utils';
import type { Need } from '@/types';

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <RadioField
          label="Tingkat Urgensi"
          value={data.urgency}
          onValueChange={(v) => setData('urgency', v as Need['urgency'])}
          variant="choice-card"
          cols={2}
          options={PRIORITY_LEVELS.map((level) => ({
            label: level.label,
            value: level.value,
            description: level.description.urgency,
          }))}
          error={errors.urgency}
        />

        <RadioField
          label="Tingkat Dampak"
          value={data.impact}
          onValueChange={(v) => setData('impact', v as Need['impact'])}
          variant="choice-card"
          cols={2}
          options={PRIORITY_LEVELS.map((level) => ({
            label: level.label,
            value: level.value,
            description: level.description.impact,
          }))}
          error={errors.impact}
        />
      </div>

      <div className="pt-2">
        <div
          className={cn(
            'overflow-hidden rounded-lg border transition-all duration-200',
            data.is_priority
              ? 'border-destructive/30! bg-destructive/10! dark:border-destructive/20! dark:bg-destructive/10!'
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
                      ? 'animate-pulse bg-destructive'
                      : 'bg-muted-foreground/30',
                  )}
                />
                <span
                  className={cn(
                    'text-base font-semibold',
                    data.is_priority ? 'text-destructive' : '',
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
