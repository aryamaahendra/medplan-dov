import { useForm } from '@inertiajs/react';
import { RiHistoryLine } from '@remixicon/react';
import { useState } from 'react';
import { toast } from 'sonner';

import NeedGroupController from '@/actions/App/Http/Controllers/Need/NeedGroupController';
import {
  FormGrid,
  InputField,
  SwitchField,
  TextareaField,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { formatForDateTimeInput } from '@/lib/formatters';
import type { NeedGroup } from '../types/need-group.types';
import { BulkRolloverDialog } from './bulk-rollover-dialog';

interface NeedGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  needGroup?: NeedGroup | null;
}

export function NeedGroupDialog({
  open,
  onOpenChange,
  needGroup,
}: NeedGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pb-0 sm:max-w-[425px]">
        <NeedGroupForm
          key={needGroup?.id ?? 'new-need-group'}
          needGroup={needGroup}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function NeedGroupForm({
  needGroup,
  onClose,
}: {
  needGroup?: NeedGroup | null;
  onClose: () => void;
}) {
  const isEditing = !!needGroup;

  const [rolloverPickerOpen, setRolloverPickerOpen] = useState(false);

  const { data, setData, submit, processing, errors } = useForm({
    name: needGroup?.name ?? '',
    description: needGroup?.description ?? '',
    year: needGroup?.year ?? new Date().getFullYear(),
    is_active: needGroup?.is_active ?? true,
    submission_start_at: formatForDateTimeInput(needGroup?.submission_start_at),
    submission_end_at: formatForDateTimeInput(needGroup?.submission_end_at),
    carry_over_need_ids: [] as number[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submit(
      isEditing
        ? NeedGroupController.update({ need_group: needGroup.id })
        : NeedGroupController.store(),
      {
        onSuccess: () => {
          toast.success(
            isEditing
              ? 'Kelompok usulan berhasil diperbarui.'
              : 'Kelompok usulan berhasil dibuat.',
          );
          onClose();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Ubah Kelompok Usulan' : 'Tambah Kelompok Usulan'}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Perbarui informasi kelompok usulan di sini.'
            : 'Masukan detail kelompok usulan baru di sini.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <InputField
          id="name"
          label="Nama Kelompok"
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
          placeholder="Contoh: Usulan Kebutuhan 2026"
          required
          error={errors.name}
        />

        <InputField
          id="year"
          type="number"
          label="Tahun"
          value={data.year}
          onChange={(e) => setData('year', parseInt(e.target.value) || 0)}
          min={2020}
          max={2030}
          required
          error={errors.year}
        />

        <TextareaField
          id="description"
          label="Deskripsi"
          value={data.description}
          onChange={(e) => setData('description', e.target.value)}
          placeholder="Deskripsi opsional..."
          rows={3}
          error={errors.description}
        />

        <FormGrid cols={2}>
          <InputField
            id="submission_start_at"
            label="Mulai Pengajuan"
            type="datetime-local"
            value={data.submission_start_at}
            onChange={(e) => setData('submission_start_at', e.target.value)}
            error={errors.submission_start_at}
          />

          <InputField
            id="submission_end_at"
            label="Batas Pengajuan"
            type="datetime-local"
            value={data.submission_end_at}
            onChange={(e) => setData('submission_end_at', e.target.value)}
            error={errors.submission_end_at}
          />
        </FormGrid>

        <SwitchField
          id="is_active"
          label="Aktif"
          checked={data.is_active}
          onCheckedChange={(checked) => setData('is_active', checked)}
          error={errors.is_active}
        />
        {!isEditing && (
          <div className="rounded-md border bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">
                  Tarik Usulan Lama
                </Label>
                <p className="text-xss text-muted-foreground">
                  {data.carry_over_need_ids.length > 0
                    ? `${data.carry_over_need_ids.length} usulan terpilih akan ditarik ke kelompok ini.`
                    : 'Pilih usulan belum disetujui untuk disertakan.'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setRolloverPickerOpen(true)}
              >
                <RiHistoryLine data-icon="inline-start" />
                {data.carry_over_need_ids.length > 0
                  ? 'Ubah Pilihan'
                  : 'Pilih Usulan'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {!isEditing && (
        <BulkRolloverDialog
          open={rolloverPickerOpen}
          onOpenChange={setRolloverPickerOpen}
          targetYear={data.year}
          initialSelectedIds={data.carry_over_need_ids}
          onSelectIds={(ids) => setData('carry_over_need_ids', ids)}
        />
      )}

      <DialogFooter className="mb-0!">
        <Button type="button" variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit" disabled={processing}>
          {isEditing ? 'Simpan Perubahan' : 'Tambah Kelompok'}
        </Button>
      </DialogFooter>
    </form>
  );
}
