import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import PlanningActivityVersionController from '@/actions/App/Http/Controllers/PlanningActivityVersionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface ActivityVersionDialogProps {
  version: PlanningVersion;
  activity?: PlanningActivityVersion | null;
  parents: Pick<PlanningActivityVersion, 'id' | 'name' | 'type'>[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACITIVITY_TYPES = [
  { value: 'program', label: 'Program' },
  { value: 'activity', label: 'Kegiatan' },
  { value: 'sub_activity', label: 'Sub Kegiatan' },
  { value: 'output', label: 'Output' },
];

export function ActivityVersionDialog({
  version,
  activity,
  parents,
  open,
  onOpenChange,
}: ActivityVersionDialogProps) {
  const isEditing = !!activity;

  const [type, setType] = useState<PlanningActivityVersion['type'] | ''>(
    activity?.type ?? '',
  );
  const [parentId, setParentId] = useState<string>(
    activity?.parent_id?.toString() ?? 'none',
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="px-0 pb-0 sm:max-w-[525px]">
        <DialogHeader className="px-4">
          <DialogTitle>
            {isEditing
              ? 'Edit Aktivitas Snapshot'
              : 'Tambah Aktivitas Snapshot'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk ${activity.name}.`
              : `Tambahkan item baru ke snapshot ${version.name}.`}
          </DialogDescription>
        </DialogHeader>

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
            onOpenChange(false);
            toast.success(
              isEditing ? 'Aktivitas diperbarui!' : 'Aktivitas dibuat!',
            );
          }}
          className="no-scrollbar max-h-[calc(100vh-12rem)] space-y-4 overflow-y-auto px-4"
        >
          {({ processing, errors }) => (
            <>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipe</Label>
                    <Select
                      value={type}
                      onValueChange={(v) => setType(v as any)}
                    >
                      <SelectTrigger id="type" className="w-full">
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACITIVITY_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="type" value={type} />
                    <InputError message={errors.type} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Kode</Label>
                    <Input
                      id="code"
                      name="code"
                      defaultValue={activity?.code ?? ''}
                      placeholder="Contoh: 1.02.01"
                    />
                    <InputError message={errors.code} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="parent_id">Induk (Parent)</Label>
                  <Select value={parentId} onValueChange={setParentId}>
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
                            [{parent.type.toUpperCase()}] {parent.name}
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

                <div className="grid gap-2">
                  <Label htmlFor="name">Nama Nomenklatur</Label>
                  <Textarea
                    id="name"
                    name="name"
                    defaultValue={activity?.name ?? ''}
                    required
                  />
                  <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="indicator_name">Nama Indikator</Label>
                  <Input
                    id="indicator_name"
                    name="indicator_name"
                    defaultValue={activity?.indicator_name ?? ''}
                  />
                  <InputError message={errors.indicator_name} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="indicator_baseline_2024">
                      Baseline 2024
                    </Label>
                    <Input
                      id="indicator_baseline_2024"
                      name="indicator_baseline_2024"
                      defaultValue={activity?.indicator_baseline_2024 ?? ''}
                    />
                    <InputError message={errors.indicator_baseline_2024} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perangkat_daerah">Perangkat Daerah</Label>
                    <Input
                      id="perangkat_daerah"
                      name="perangkat_daerah"
                      defaultValue={activity?.perangkat_daerah ?? ''}
                    />
                    <InputError message={errors.perangkat_daerah} />
                  </div>
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
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  {isEditing ? 'Simpan Perubahan' : 'Buat Nomenklatur'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
