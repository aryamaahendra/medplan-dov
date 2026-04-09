import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NeedDetailSectionProps {
  data: any;
  setData: (key: any, value: any) => void;
  errors: any;
}

interface DetailField {
  key: string;
  label: string;
  placeholder: string;
}

const DETAIL_FIELDS: DetailField[] = [
  {
    key: 'background',
    label: 'Latar Belakang',
    placeholder: 'Uraikan latar belakang pengajuan usulan...',
  },
  {
    key: 'purpose_and_objectives',
    label: 'Tujuan dan Sasaran',
    placeholder: 'Jelaskan tujuan dan sasaran yang ingin dicapai...',
  },
  {
    key: 'target_objective',
    label: 'Target / Sasaran Kegiatan',
    placeholder: 'Siapa atau apa yang menjadi target kegiatan...',
  },
  {
    key: 'procurement_organization_name',
    label: 'Nama Organisasi Pengadaan',
    placeholder: 'Nama unit/organisasi yang melaksanakan pengadaan...',
  },
  {
    key: 'funding_source_and_estimated_cost',
    label: 'Sumber Dana & Estimasi Biaya',
    placeholder: 'Sebutkan sumber pendanaan dan perkiraan biaya...',
  },
  {
    key: 'implementation_period',
    label: 'Periode Pelaksanaan',
    placeholder: 'Kapan dan berapa lama kegiatan akan dilaksanakan...',
  },
  {
    key: 'expert_or_skilled_personnel',
    label: 'Tenaga Ahli / SDM Terampil',
    placeholder: 'Uraikan kebutuhan tenaga ahli atau SDM terampil...',
  },
  {
    key: 'technical_specifications',
    label: 'Spesifikasi Teknis',
    placeholder: 'Jelaskan spesifikasi teknis barang/jasa yang dibutuhkan...',
  },
  {
    key: 'training',
    label: 'Pelatihan',
    placeholder: 'Apakah diperlukan pelatihan? Jika ya, uraikan...',
  },
];

export function NeedDetailSection({
  data,
  setData,
  errors,
}: NeedDetailSectionProps) {
  const detail = data.detail ?? {};

  const handleChange = (key: string, value: string) => {
    setData('detail', { ...detail, [key]: value });
  };

  return (
    <div className="space-y-5 py-6">
      <div className="mb-4 space-y-1">
        <p className="text-sm text-muted-foreground">
          Bagian ini berisi informasi dokumen proposal untuk usulan kebutuhan.
          Semua bidang bersifat opsional.
        </p>
      </div>

      <div className="space-y-5">
        {DETAIL_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`detail_${key}`}>{label}</Label>
            <Textarea
              id={`detail_${key}`}
              name={`detail[${key}]`}
              placeholder={placeholder}
              value={detail[key] ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
              rows={3}
              className="resize-none bg-muted/10"
            />
            <InputError message={errors[`detail.${key}`]} />
          </div>
        ))}
      </div>
    </div>
  );
}
