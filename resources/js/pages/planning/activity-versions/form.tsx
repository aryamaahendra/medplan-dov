import { Form, router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import PlanningActivityVersionController from '@/actions/App/Http/Controllers/Planning/PlanningActivityVersionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  PlanningActivityVersion,
  PlanningVersion,
} from '@/types/planning-version';

interface ActivityVersionFormProps {
  version: PlanningVersion;
  activity?: PlanningActivityVersion;
  parents: Pick<PlanningActivityVersion, 'id' | 'name' | 'code'>[];
}

interface IndicatorFormState {
  id?: number;
  name: string;
  baseline: string;
  unit: string;
}

export function ActivityVersionForm({
  version,
  activity,
  parents,
}: ActivityVersionFormProps) {
  const isEditing = !!activity;

  const [parentId, setParentId] = useState<string>(
    activity?.parent_id?.toString() ?? 'none',
  );
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

  const handleParentChange = (id: string) => {
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
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
            {/* Left Column: General Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Nomenklatur</CardTitle>
                  <CardDescription>
                    Pilih induk dan tentukan kode serta nama nomenklatur.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="parent_id">Induk (Parent)</Label>
                    <Select value={parentId} onValueChange={handleParentChange}>
                      <SelectTrigger id="parent_id" className="w-full">
                        <SelectValue placeholder="Pilih induk (opsional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          Tanpa Induk (Program)
                        </SelectItem>
                        {parents
                          .filter((p) => p.id !== activity?.id)
                          .map((parent) => (
                            <SelectItem
                              key={parent.id}
                              value={parent.id.toString()}
                            >
                              {parent.code} - {parent.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="parent_id"
                      value={parentId === 'none' ? '' : parentId}
                    />
                    <InputError message={errors.parent_id} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Kode</Label>
                      <Input
                        id="code"
                        name="code"
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value);
                          setCodeExists(false);
                        }}
                        placeholder="Contoh: 1.02.01"
                        className={codeExists ? 'border-destructive' : ''}
                      />
                      {codeExists && (
                        <p className="text-xs text-destructive">
                          Kode ini sudah digunakan dalam versi ini.
                        </p>
                      )}
                      <InputError message={errors.code} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sort_order">Urutan (Sort Order)</Label>
                      <Input
                        id="sort_order"
                        name="sort_order"
                        type="number"
                        defaultValue={activity?.sort_order ?? 0}
                        placeholder="0"
                      />
                      <InputError message={errors.sort_order} />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="name">Nama Nomenklatur</Label>
                    <Textarea
                      id="name"
                      name="name"
                      defaultValue={activity?.name ?? ''}
                      className="min-h-[100px]"
                      required
                    />
                    <InputError message={errors.name} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="perangkat_daerah">Perangkat Daerah</Label>
                    <Input
                      id="perangkat_daerah"
                      name="perangkat_daerah"
                      defaultValue={activity?.perangkat_daerah ?? ''}
                    />
                    <InputError message={errors.perangkat_daerah} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="keterangan">Keterangan</Label>
                    <Textarea
                      id="keterangan"
                      name="keterangan"
                      defaultValue={activity?.keterangan ?? ''}
                    />
                    <InputError message={errors.keterangan} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Indicators */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Indikator</h3>
                <p className="text-sm text-muted-foreground">
                  Target dan capaian untuk nomenklatur ini.
                </p>
              </div>

              <div className="space-y-4">
                {indicators.map((indicator, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold">
                        Indikator {index + 1}
                      </CardTitle>
                      {indicators.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => removeIndicator(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                          <InputError
                            message={errors[`indicators.${index}.name`]}
                          />
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

                <div className="">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addIndicator}
                    className="w-full border-dashed"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Indikator
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 border-t pt-6">
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
        </div>
      )}
    </Form>
  );
}
