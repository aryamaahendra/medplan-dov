import { router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import NeedController from '@/actions/App/Http/Controllers/NeedController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';

import type { Need } from '../columns';

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

const PRIORITY_LEVELS = [
  { value: 'high', label: 'Tinggi (High)' },
  { value: 'medium', label: 'Sedang (Medium)' },
  { value: 'low', label: 'Rendah (Low)' },
] as const;

interface NeedFormProps {
  need?: Need | null;
  organizationalUnits: { id: number; name: string }[];
  needTypes: { id: number; name: string }[];
  className?: string;
}

export function NeedForm({
  need,
  organizationalUnits,
  needTypes,
  className,
}: NeedFormProps) {
  const isEditing = !!need;

  const { data, setData, post, patch, processing, errors } = useForm({
    organizational_unit_id: need?.organizational_unit_id?.toString() ?? '',
    need_type_id: need?.need_type_id?.toString() ?? '',
    year: need?.year?.toString() ?? new Date().getFullYear().toString(),
    title: need?.title ?? '',
    description: need?.description ?? '',
    current_condition: need?.current_condition ?? '',
    required_condition: need?.required_condition ?? '',
    unit: need?.unit ?? '',
    volume: need?.volume ?? '',
    unit_price: need?.unit_price ?? '',
    total_price: need?.total_price ?? '',
    urgency: need?.urgency ?? 'medium',
    impact: need?.impact ?? 'medium',
    is_priority: need?.is_priority ?? false,
    status: need?.status ?? 'draft',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const options = {
      onSuccess: () => {
        toast.success(
          isEditing
            ? 'Usulan kebutuhan berhasil diperbarui.'
            : 'Usulan kebutuhan berhasil dibuat.',
        );
      },
    };

    if (isEditing) {
      patch(NeedController.update.url({ need: need.id }), options);
    } else {
      post(NeedController.store.url(), options);
    }
  };

  const handleVolumeChange = (value: string) => {
    const vol = parseFloat(value) || 0;
    const price = parseFloat(data.unit_price) || 0;
    setData((d: typeof data) => ({
      ...d,
      volume: value,
      total_price: (vol * price).toFixed(2),
    }));
  };

  const handleUnitPriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    const vol = parseFloat(data.volume) || 0;
    setData((d: typeof data) => ({
      ...d,
      unit_price: value,
      total_price: (vol * price).toFixed(2),
    }));
  };

  return (
    <Card className={cn('w-full max-w-3xl', className)}>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organizational_unit_id">Unit Kerja</Label>
              <Select
                value={data.organizational_unit_id}
                onValueChange={(v) => setData('organizational_unit_id', v)}
              >
                <SelectTrigger id="organizational_unit_id" className="w-full">
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
              <InputError message={errors.organizational_unit_id} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="need_type_id">Jenis Kebutuhan</Label>
              <Select
                value={data.need_type_id}
                onValueChange={(v) => setData('need_type_id', v)}
              >
                <SelectTrigger id="need_type_id" className="w-full">
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
              <InputError message={errors.need_type_id} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="year">Tahun</Label>
              <Input
                id="year"
                name="year"
                type="number"
                min="2000"
                max="2100"
                value={data.year}
                onChange={(e) => setData('year', e.target.value)}
                required
              />
              <InputError message={errors.year} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={data.status}
                onValueChange={(v) => setData('status', v as Need['status'])}
              >
                <SelectTrigger id="status" className="w-full">
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
              <InputError message={errors.status} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul Usulan</Label>
            <Input
              id="title"
              name="title"
              placeholder="Contoh: Pengadaan Komputer untuk Bidang A"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              required
            />
            <InputError message={errors.title} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detail Usulan</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Uraikan detail usulan kebutuhan..."
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={4}
            />
            <InputError message={errors.description} />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current_condition">Kondisi Saat Ini</Label>
              <Textarea
                id="current_condition"
                name="current_condition"
                placeholder="Jelaskan kondisi saat ini..."
                value={data.current_condition}
                onChange={(e) => setData('current_condition', e.target.value)}
                rows={4}
              />
              <InputError message={errors.current_condition} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="required_condition">
                Kondisi Yang Dibutuhkan
              </Label>
              <Textarea
                id="required_condition"
                name="required_condition"
                placeholder="Jelaskan kondisi yang dibutuhkan..."
                value={data.required_condition}
                onChange={(e) => setData('required_condition', e.target.value)}
                rows={4}
              />
              <InputError message={errors.required_condition} />
            </div>
          </div>

          <div className="mb-5! space-y-3">
            <Label>Satuan</Label>
            <RadioGroup
              value={data.unit}
              onValueChange={(v) => setData('unit', v)}
              className="flex flex-wrap gap-x-6 gap-y-3"
            >
              {UNIT_OPTIONS.map((u) => (
                <div key={u} className="flex items-center space-x-2">
                  <RadioGroupItem value={u} id={`unit-${u}`} />
                  <Label
                    htmlFor={`unit-${u}`}
                    className="cursor-pointer font-normal capitalize"
                  >
                    {u}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <InputError message={errors.unit} />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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

          <div className="space-y-6 rounded-md border border-dashed p-4">
            <div className="space-y-3">
              <Label>Urgensi</Label>
              <RadioGroup
                value={data.urgency}
                onValueChange={(v) => setData('urgency', v as Need['urgency'])}
                className="flex flex-col gap-2 sm:flex-row sm:gap-4"
              >
                {PRIORITY_LEVELS.map((level) => (
                  <div
                    key={level.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={level.value}
                      id={`urgency-${level.value}`}
                    />
                    <Label
                      htmlFor={`urgency-${level.value}`}
                      className="cursor-pointer font-normal"
                    >
                      {level.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <InputError message={errors.urgency} />
            </div>

            <div className="mb-4! space-y-3">
              <Label>Dampak</Label>
              <RadioGroup
                value={data.impact}
                onValueChange={(v) => setData('impact', v as Need['impact'])}
                className="flex flex-col gap-2 sm:flex-row sm:gap-4"
              >
                {PRIORITY_LEVELS.map((level) => (
                  <div
                    key={level.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={level.value}
                      id={`impact-${level.value}`}
                    />
                    <Label
                      htmlFor={`impact-${level.value}`}
                      className="cursor-pointer font-normal"
                    >
                      {level.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <InputError message={errors.impact} />
            </div>

            <div className="pt-2">
              <FieldGroup className="w-full max-sm:gap-4!">
                <FieldLabel
                  htmlFor="is_priority"
                  className={cn(
                    'transition-colors duration-200',
                    data.is_priority
                      ? 'border-green-900/20! bg-green-200/40! dark:border-green-900/30! dark:bg-green-800/40!'
                      : 'border-yellow-900/20! bg-yellow-200/40! dark:border-yellow-900/30! dark:bg-yellow-800/40!',
                  )}
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>
                        {data.is_priority
                          ? 'Prioritas Utama'
                          : 'Bukan Prioritas'}
                      </FieldTitle>
                      <FieldDescription>
                        Tandai jika usulan ini merupakan prioritas utama yang
                        harus segera dipenuhi.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id="is_priority"
                      checked={data.is_priority}
                      onCheckedChange={(checked) =>
                        setData('is_priority', checked)
                      }
                    />
                  </Field>
                </FieldLabel>
                <FieldError errors={[{ message: errors.is_priority }]} />
              </FieldGroup>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t bg-muted/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.visit(needRoutes.index.url())}
          >
            Batal
          </Button>
          <Button type="submit" disabled={processing}>
            {isEditing ? 'Simpan Perubahan' : 'Tambah Usulan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
