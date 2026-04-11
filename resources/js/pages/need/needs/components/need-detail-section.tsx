import { useState } from 'react';
import type { MutableRefObject } from 'react';
import InputError from '@/components/input-error';
import { Editor } from '@/components/ui/editor';
import { Label } from '@/components/ui/label';

interface NeedDetailSectionProps {
  initialValues: any;
  detailValuesRef: MutableRefObject<any>;
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
  initialValues: providedInitialValues,
  detailValuesRef,
  errors,
}: NeedDetailSectionProps) {
  // Capture the initial values on mount to avoid reading ref during render.
  // This is safe because Editor is an uncontrolled component and uses this value
  // primarily for initialization.
  const [initialValues] = useState(providedInitialValues);

  const handleChange = (key: string, value: string) => {
    detailValuesRef.current = {
      ...detailValuesRef.current,
      [key]: value,
    };
  };

  return (
    <div className="space-y-5 py-6">
      <div className="mb-4 space-y-1">
        <p className="text-sm text-muted-foreground">
          Bagian ini berisi informasi dokumen proposal untuk usulan kebutuhan.
          Semua bidang bersifat opsional.
        </p>
      </div>

      <div className="-mx-4 space-y-6">
        {DETAIL_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <Label className="mb-0 border-t bg-muted/40 px-4 py-3">
              {label}
            </Label>
            <Editor
              id={`detail_${key}`}
              placeholder={'Type here ...'}
              value={initialValues?.[key] ?? ''}
              onChange={(value) => handleChange(key, value)}
              className="mb-0 bg-muted/10"
            />
            <InputError message={errors[`detail.${key}`]} />
            <Label className="mb-0 border-b bg-muted/40 px-4 py-3 text-xs text-muted-foreground italic">
              *{placeholder}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
