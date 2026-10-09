import { Form, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import PlanningActivityVersionController from '@/actions/App/Http/Controllers/Planning/PlanningActivityVersionController';
import { Button } from '@/components/ui/button';

import type {
  ActivityVersionFormProps,
  IndicatorFormState,
} from '../types/planning-activity-version.types';
import { ActivityIndicatorsSection } from './activity-indicators-section';
import { ActivityInfoCard } from './activity-info-card';

export function ActivityVersionForm({
  version,
  activity,
  parents,
  activityTypes,
}: ActivityVersionFormProps) {
  const isEditing = !!activity;

  const [parentId, setParentId] = useState<string>(
    activity?.parent_id?.toString() ?? 'none',
  );
  const [type, setType] = useState<string>(activity?.type ?? '');
  const [code, setCode] = useState(activity?.code ?? '');
  const [codeExists, setCodeExists] = useState(false);

  const [indicators, setIndicators] = useState<IndicatorFormState[]>(
    activity?.indicators?.length
      ? activity.indicators.map((ind) => ({
          id: ind.id,
          name: ind.name,
          baseline: ind.baseline ?? '',
          unit: ind.unit ?? '',
        }))
      : [{ id: undefined, name: '', baseline: '', unit: '' }],
  );

  useEffect(() => {
    if (!code) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          PlanningActivityVersionController.checkCode.url(version.id, {
            query: { code, ignore_id: activity?.id },
          }),
        );
        const { exists } = await response.json();
        setCodeExists(exists);
      } catch (error) {
        console.error('Error checking code:', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [code, version.id, activity?.id]);

  const handleParentChange = (id: string | null) => {
    if (!id) {
      return;
    }

    setParentId(id);
    const parent = parents.find((p) => p.id.toString() === id);

    if (parent && parent.code) {
      if (!code.startsWith(parent.code)) {
        setCode(parent.code + '.');
        setCodeExists(false);
      }
    }
  };

  const addIndicator = () => {
    setIndicators([
      ...indicators,
      { id: undefined, name: '', baseline: '', unit: '' },
    ]);
  };

  const removeIndicator = (index: number) => {
    setIndicators(indicators.filter((_, i) => i !== index));
  };

  return (
    <Form
      key={activity?.id ?? 'new-activity-version'}
      {...(isEditing
        ? PlanningActivityVersionController.update.form({
            planning_activity_version: activity.id,
          })
        : PlanningActivityVersionController.store.form({
            planning_version: version.id,
          }))}
      onSuccess={() => {
        toast.success(
          isEditing ? 'Aktivitas diperbarui!' : 'Aktivitas dibuat!',
        );
      }}
      className="space-y-8"
    >
      {({ processing, errors }) => (
        <div className="space-y-8">
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.visit(
                  PlanningActivityVersionController.index.url(version.id),
                )
              }
            >
              Batal
            </Button>
            <Button type="submit" disabled={processing || codeExists}>
              {isEditing ? 'Simpan Perubahan' : 'Buat Nomenklatur'}
            </Button>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <ActivityInfoCard
                activity={activity}
                parents={parents}
                activityTypes={activityTypes}
                parentId={parentId}
                onParentChange={handleParentChange}
                code={code}
                onCodeChange={(newCode) => {
                  setCode(newCode);
                  setCodeExists(false);
                }}
                codeExists={codeExists}
                type={type}
                onTypeChange={setType}
                errors={errors}
              />
            </div>

            <ActivityIndicatorsSection
              indicators={indicators}
              onAddIndicator={addIndicator}
              onRemoveIndicator={removeIndicator}
              errors={errors}
            />
          </div>
        </div>
      )}
    </Form>
  );
}
