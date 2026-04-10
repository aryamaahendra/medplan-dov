import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import PlanningActivityController from '@/actions/App/Http/Controllers/PlanningActivityController';
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
import type { PlanningActivity } from '@/types/planning-activity';

interface PlanningActivityDialogProps {
  activity?: PlanningActivity | null;
  parents: Pick<PlanningActivity, 'id' | 'name' | 'type'>[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACITIVITY_TYPES = [
  { value: 'program', label: 'Program' },
  { value: 'activity', label: 'Kegiatan' },
  { value: 'sub_activity', label: 'Sub Kegiatan' },
  { value: 'output', label: 'Output' },
];

export function PlanningActivityDialog({
  activity,
  parents,
  open,
  onOpenChange,
}: PlanningActivityDialogProps) {
  const isEditing = !!activity;

  // Use local state for custom select components since Inertia v3 <Form>
  // tracks native inputs via name/defaultValue.
  const [type, setType] = useState<PlanningActivity['type'] | ''>(
    activity?.type ?? '',
  );
  const [parentId, setParentId] = useState<string>(
    activity?.parent_id?.toString() ?? 'none',
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pb-0 sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Nomenklatur' : 'Tambah Nomenklatur'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk ${activity.name}.`
              : 'Tambahkan item perencanaan baru ke hirarki.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          key={activity?.id ?? 'new-activity'}
          {...(isEditing
            ? PlanningActivityController.update.form({
                planning_activity: activity.id,
              })
            : PlanningActivityController.store.form())}
          onSuccess={() => {
            onOpenChange(false);
            toast.success(
              isEditing ? 'Nomenklatur diperbarui!' : 'Nomenklatur dibuat!',
            );
          }}
          className="space-y-4"
        >
          {({ processing, errors }) => (
            <>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipe</Label>
                  <Select value={type} onValueChange={(v) => setType(v as any)}>
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
                      {parents.map((parent) => (
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
                  <Label htmlFor="code">Kode</Label>
                  <Input
                    id="code"
                    name="code"
                    defaultValue={activity?.code ?? ''}
                    placeholder="Contoh: 1.02.01"
                  />
                  <InputError message={errors.code} />
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
              </div>

              <DialogFooter className="mb-0">
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
