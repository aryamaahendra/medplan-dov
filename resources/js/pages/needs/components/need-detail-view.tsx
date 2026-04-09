import type { NeedDetail } from '../columns';

interface NeedDetailViewProps {
  detail?: NeedDetail | null;
}

const DETAIL_FIELDS: { key: keyof NeedDetail; label: string }[] = [
  { key: 'background', label: 'Latar Belakang' },
  { key: 'purpose_and_objectives', label: 'Tujuan dan Sasaran' },
  { key: 'target_objective', label: 'Target / Sasaran Kegiatan' },
  { key: 'procurement_organization_name', label: 'Nama Organisasi Pengadaan' },
  {
    key: 'funding_source_and_estimated_cost',
    label: 'Sumber Dana & Estimasi Biaya',
  },
  { key: 'implementation_period', label: 'Periode Pelaksanaan' },
  { key: 'expert_or_skilled_personnel', label: 'Tenaga Ahli / SDM Terampil' },
  { key: 'technical_specifications', label: 'Spesifikasi Teknis' },
  { key: 'training', label: 'Pelatihan' },
];

export function NeedDetailView({ detail }: NeedDetailViewProps) {
  const hasAnyValue = detail && DETAIL_FIELDS.some(({ key }) => detail[key]);

  if (!hasAnyValue) {
    return (
      <div className="mt-6 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Belum ada informasi detail proposal untuk usulan ini.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {DETAIL_FIELDS.map(({ key, label }) => {
        const value = detail?.[key];

        if (!value) {
          return null;
        }

        return (
          <div key={key} className="space-y-1.5">
            <p className="text-xs font-semibold tracking-tight text-muted-foreground uppercase">
              {label}
            </p>
            <p className="rounded-md bg-muted/30 p-3 text-sm leading-relaxed whitespace-pre-wrap">
              {value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
