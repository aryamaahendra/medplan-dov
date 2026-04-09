import { Card, CardContent } from '@/components/ui/card';
import { EditorRenderer } from '@/components/ui/editor-renderer';
import { Label } from '@/components/ui/label';
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
    <Card className="mt-8 py-6">
      <CardContent className="p-0">
        <div className="space-y-6">
          {DETAIL_FIELDS.map(({ key, label }) => {
            const value = detail?.[key];

            if (!value) {
              return null;
            }

            return (
              <div key={key} className="space-y-1.5">
                <Label className="mb-0 border-t bg-muted/40 px-4 py-3">
                  {label}
                </Label>
                <div className="mb-0 min-h-[120px] w-full border-y border-input bg-background px-4 py-2 text-base md:text-sm">
                  <EditorRenderer value={value?.toString()} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
