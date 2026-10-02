import { useForm } from '@inertiajs/react';
import { RiHistoryLine } from '@remixicon/react';
import { useState } from 'react';
import { toast } from 'sonner';

import NeedGroupController from '@/actions/App/Http/Controllers/Need/NeedGroupController';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import type { NeedGroup } from './columns';
import { BulkRolloverDialog } from './components/bulk-rollover-dialog';

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

  // Convert ISO string to datetime-local input format (YYYY-MM-DDTHH:mm)
  const formatForInput = (dateStr?: string | null) => {
    if (!dateStr) {
      return '';
    }

    const d = new Date(dateStr);

    if (isNaN(d.getTime())) {
      return dateStr.slice(0, 16);
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [rolloverPickerOpen, setRolloverPickerOpen] = useState(false);

  const { data, setData, submit, processing, errors } = useForm({
    name: needGroup?.name ?? '',
    description: needGroup?.description ?? '',
    year: needGroup?.year ?? new Date().getFullYear(),
    is_active: needGroup?.is_active ?? true,
    submission_start_at: formatForInput(needGroup?.submission_start_at),
    submission_end_at: formatForInput(needGroup?.submission_end_at),
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
        <div className="grid gap-2">
          <Label htmlFor="name">Nama Kelompok</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            placeholder="Contoh: Usulan Kebutuhan 2026"
            required
          />
          <InputError message={errors.name} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="year">Tahun</Label>
          <Input
            id="year"
            type="number"
            value={data.year}
            onChange={(e) => setData('year', parseInt(e.target.value))}
            min={2020}
            max={2030}
            required
          />
          <InputError message={errors.year} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            placeholder="Deskripsi opsional..."
            rows={3}
          />
          <InputError message={errors.description} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="submission_start_at">Mulai Pengajuan</Label>
            <Input
              id="submission_start_at"
              type="datetime-local"
              value={data.submission_start_at}
              onChange={(e) => setData('submission_start_at', e.target.value)}
            />
            <InputError message={errors.submission_start_at} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="submission_end_at">Batas Pengajuan</Label>
            <Input
              id="submission_end_at"
              type="datetime-local"
              value={data.submission_end_at}
              onChange={(e) => setData('submission_end_at', e.target.value)}
            />
            <InputError message={errors.submission_end_at} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={data.is_active}
            onCheckedChange={(checked) => setData('is_active', checked)}
          />
          <Label htmlFor="is_active">Aktif</Label>
        </div>

        {!isEditing && (
          <div className="rounded-md border bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">
                  Tarik Usulan Lama
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {data.carry_over_need_ids.length > 0
                    ? `${data.carry_over_need_ids.length} usulan terpilih akan ditarik ke kelompok ini.`
                    : 'Pilih usulan belum disetujui untuk disertakan.'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => setRolloverPickerOpen(true)}
              >
                <RiHistoryLine className="h-3.5 w-3.5" />
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
