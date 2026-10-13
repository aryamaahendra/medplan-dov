import { RiAddLine, RiDeleteBinLine } from '@remixicon/react';

import { FormGrid, InputField } from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
                <input
                  type="hidden"
                  name={`indicators[${index}][id]`}
                  value={indicator.id ?? ''}
                />
                <InputField
                  label="Nama Indikator"
                  name={`indicators[${index}][name]`}
                  defaultValue={indicator.name}
                  placeholder="Cth: Persentase Capaian"
                  required
                  error={errors[`indicators.${index}.name`]}
                />
                <FormGrid cols={2}>
                  <InputField
                    label="Baseline"
                    name={`indicators[${index}][baseline]`}
                    defaultValue={indicator.baseline}
                    placeholder="Cth: 100"
                  />
                  <InputField
                    label="Satuan"
                    name={`indicators[${index}][unit]`}
                    defaultValue={indicator.unit}
                    placeholder="Cth: Persen (%)"
                  />
                </FormGrid>
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
