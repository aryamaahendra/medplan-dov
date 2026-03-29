import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import NeedController from '@/actions/App/Http/Controllers/NeedController';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import type { Need } from './columns';

const UNIT_OPTIONS = [
  'pcs',
  'unit',
  'orang',
  'paket',
  'set',
  'buah',
  'lembar',
  'kg',
  'liter',
  'meter',
] as const;

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Diajukan' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
] as const;

interface NeedDialogProps {
  need?: Need | null;
  organizationalUnits: { id: number; name: string }[];
  needTypes: { id: number; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NeedDialog({
  need,
  organizationalUnits,
  needTypes,
  open,
  onOpenChange,
}: NeedDialogProps) {
  const isEditing = !!need;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Usulan Kebutuhan' : 'Tambah Usulan Kebutuhan'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Perbarui detail untuk usulan "${need.title}".`
              : 'Tambahkan usulan kebutuhan baru ke dalam sistem.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          key={need?.id ?? 'new-need'}
          {...(isEditing
            ? NeedController.update.form({ need: need.id })
            : NeedController.store.form())}
          onSuccess={() => {
            onOpenChange(false);
            toast.success(
              isEditing
                ? 'Usulan kebutuhan berhasil diperbarui.'
                : 'Usulan kebutuhan berhasil dibuat.',
            );
          }}
          className="space-y-4 py-2"
        >
          {({ data, setData, processing, errors }: any) => {
            /** Recalculate total_price whenever volume or unit_price changes. */
            const handleVolumeChange = (value: string) => {
              const vol = parseFloat(value) || 0;
              const price = parseFloat(data.unit_price) || 0;
              setData({
                ...data,
                volume: value,
                total_price: (vol * price).toFixed(2),
              });
            };

            const handleUnitPriceChange = (value: string) => {
              const price = parseFloat(value) || 0;
              const vol = parseFloat(data.volume) || 0;
              setData({
                ...data,
                unit_price: value,
                total_price: (vol * price).toFixed(2),
              });
            };

            return (
              <>
                {/* Unit Kerja & Jenis Kebutuhan */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="organizational_unit_id">Unit Kerja</Label>
                    <Select
                      value={data.organizational_unit_id}
                      onValueChange={(v) =>
                        setData('organizational_unit_id', v)
                      }
                    >
                      <SelectTrigger id="organizational_unit_id">
                        <SelectValue placeholder="Pilih unit kerja" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizationalUnits.map((u) => (
                          <SelectItem key={u.id} value={u.id.toString()}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="organizational_unit_id"
                      value={data.organizational_unit_id}
                    />
                    <InputError message={errors.organizational_unit_id} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="need_type_id">Jenis Kebutuhan</Label>
                    <Select
                      value={data.need_type_id}
                      onValueChange={(v) => setData('need_type_id', v)}
                    >
                      <SelectTrigger id="need_type_id">
                        <SelectValue placeholder="Pilih jenis kebutuhan" />
                      </SelectTrigger>
                      <SelectContent>
                        {needTypes.map((t) => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="need_type_id"
                      value={data.need_type_id}
                    />
                    <InputError message={errors.need_type_id} />
                  </div>
                </div>

                {/* Tahun & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="year">Tahun</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      min="2000"
                      max="2100"
                      defaultValue={
                        need?.year?.toString() ??
                        new Date().getFullYear().toString()
                      }
                      required
                    />
                    <InputError message={errors.year} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={data.status}
                      onValueChange={(v) =>
                        setData('status', v as Need['status'])
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="status" value={data.status} />
                    <InputError message={errors.status} />
                  </div>
                </div>

                {/* Judul Usulan */}
                <div className="grid gap-2">
                  <Label htmlFor="title">Judul Usulan</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Contoh: Pengadaan Komputer untuk Bidang A"
                    defaultValue={need?.title ?? ''}
                    required
                    autoFocus
                  />
                  <InputError message={errors.title} />
                </div>

                {/* Deskripsi */}
                <div className="grid gap-2">
                  <Label htmlFor="description">Detail Usulan</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Uraikan detail usulan kebutuhan..."
                    defaultValue={need?.description ?? ''}
                    rows={3}
                  />
                  <InputError message={errors.description} />
                </div>

                {/* Kondisi Saat Ini & Kondisi Yang Dibutuhkan */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current_condition">Kondisi Saat Ini</Label>
                    <Textarea
                      id="current_condition"
                      name="current_condition"
                      placeholder="Jelaskan kondisi saat ini..."
                      defaultValue={need?.current_condition ?? ''}
                      rows={3}
                    />
                    <InputError message={errors.current_condition} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="required_condition">
                      Kondisi Yang Dibutuhkan
                    </Label>
                    <Textarea
                      id="required_condition"
                      name="required_condition"
                      placeholder="Jelaskan kondisi yang dibutuhkan..."
                      defaultValue={need?.required_condition ?? ''}
                      rows={3}
                    />
                    <InputError message={errors.required_condition} />
                  </div>
                </div>

                {/* Satuan (Radio) */}
                <div className="grid gap-2">
                  <Label>Satuan</Label>
                  <RadioGroup
                    value={data.unit}
                    onValueChange={(v) => setData('unit', v)}
                    className="flex flex-wrap gap-x-4 gap-y-2"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <div key={u} className="flex items-center gap-1.5">
                        <RadioGroupItem value={u} id={`unit-${u}`} />
                        <Label
                          htmlFor={`unit-${u}`}
                          className="cursor-pointer font-normal"
                        >
                          {u}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <InputError message={errors.unit} />
                </div>

                {/* Volume, Harga Satuan, Total */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="volume">Jumlah (Volume)</Label>
                    <Input
                      id="volume"
                      name="volume"
                      type="number"
                      min="0"
                      step="0.0001"
                      placeholder="0"
                      value={data.volume}
                      onChange={(e) => handleVolumeChange(e.target.value)}
                      required
                    />
                    <InputError message={errors.volume} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="unit_price">Harga Satuan (Rp)</Label>
                    <Input
                      id="unit_price"
                      name="unit_price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={data.unit_price}
                      onChange={(e) => handleUnitPriceChange(e.target.value)}
                      required
                    />
                    <InputError message={errors.unit_price} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="total_price">Total Harga (Rp)</Label>
                    <Input
                      id="total_price"
                      name="total_price"
                      type="number"
                      value={data.total_price}
                      readOnly
                      className="bg-muted text-muted-foreground"
                      tabIndex={-1}
                    />
                    <InputError message={errors.total_price} />
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
                    {isEditing ? 'Simpan Perubahan' : 'Tambah Usulan'}
                  </Button>
                </DialogFooter>
              </>
            );
          }}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
