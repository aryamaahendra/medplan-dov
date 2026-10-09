import { RiAddLine, RiDeleteBinLine } from '@remixicon/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { IndicatorFormState } from '../types/planning-activity-version.types';

interface ActivityIndicatorsSectionProps {
  indicators: IndicatorFormState[];
  onAddIndicator: () => void;
  onRemoveIndicator: (index: number) => void;
  errors: Record<string, string | undefined>;
}

export function ActivityIndicatorsSection({
  indicators,
  onAddIndicator,
  onRemoveIndicator,
  errors,
}: ActivityIndicatorsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Indikator</h3>
        <p className="text-sm text-muted-foreground">
          Target dan capaian untuk nomenklatur ini.
        </p>
      </div>

      <div className="space-y-4">
        {indicators.map((indicator, index) => (
          <Card key={index} size="sm">
            <CardHeader>
              <CardTitle>Indikator {index + 1}</CardTitle>
              {indicators.length > 1 && (
                <CardAction>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => onRemoveIndicator(index)}
                  >
                    <RiDeleteBinLine />
                  </Button>
                </CardAction>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Nama Indikator</Label>
                  <input
                    type="hidden"
                    name={`indicators[${index}][id]`}
                    value={indicator.id ?? ''}
                  />
                  <Input
                    name={`indicators[${index}][name]`}
                    defaultValue={indicator.name}
                    placeholder="Cth: Persentase Capaian"
                    required
                  />
                  <InputError message={errors[`indicators.${index}.name`]} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Baseline</Label>
                    <Input
                      name={`indicators[${index}][baseline]`}
                      defaultValue={indicator.baseline}
                      placeholder="Cth: 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Satuan</Label>
                    <Input
                      name={`indicators[${index}][unit]`}
                      defaultValue={indicator.unit}
                      placeholder="Cth: Persen (%)"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {indicators.length === 0 && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              Belum ada indikator yang ditambahkan.
            </p>
          </div>
        )}

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddIndicator}
            className="w-full border-dashed"
          >
            <RiAddLine data-icon="inline-start" />
            Tambah Indikator
          </Button>
        </div>
      </div>
    </div>
  );
}
