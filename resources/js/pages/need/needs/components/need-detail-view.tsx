import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EditorRenderer } from '@/components/ui/editor-renderer';
import { Label } from '@/components/ui/label';

import type { Attachment, NeedDetail } from '@/types';

import { AttachmentList } from './attachment-list';
import { ExportPdfDialog } from './export-pdf-dialog';

interface NeedDetailViewProps {
  needId: number;
  detail?: NeedDetail | null;
  attachments?: Attachment[];
  users: { id: number; name: string; nip: string | null }[];
}

const DETAIL_FIELDS: { key: keyof NeedDetail; label: string }[] = [
  { key: 'background', label: 'Latar Belakang' },
  { key: 'purpose_and_objectives', label: 'Maksud & Tujuan' },
  { key: 'target_objective', label: 'Target / Sasaran Kegiatan' },
  { key: 'procurement_organization_name', label: 'Nama Organisasi Pengadaan' },
  {
    key: 'funding_source_id' as any,
    label: 'Sumber Dana & Estimasi Biaya',
  },
  { key: 'implementation_period', label: 'Periode Pelaksanaan' },
  { key: 'expert_or_skilled_personnel', label: 'Tenaga Ahli / SDM Terampil' },
  { key: 'technical_specifications', label: 'Spesifikasi Teknis' },
  { key: 'training', label: 'Pelatihan' },
];

export function NeedDetailView({
  needId,
  detail,
  users = [],
  attachments = [],
}: NeedDetailViewProps) {
  return (
    <Card className="mt-8">
      <CardContent className="p-0">
        <div className="mb-4 flex justify-end gap-1.5 px-4">
          <ExportPdfDialog needId={needId} users={users} />

          {import.meta.env.DEV && (
            <ExportPdfDialog
              needId={needId}
              users={users}
              trigger={
                <Button variant="destructive" size="icon-sm">
                  <Eye />
                </Button>
              }
            />
          )}
        </div>

        <div className="space-y-6">
          {DETAIL_FIELDS.map(({ key, label }) => {
            const value = detail?.[key];

            return (
              <div key={key} className="space-y-1.5">
                <Label className="mb-0 border-t bg-muted/40 px-4 py-3">
                  {label}
                </Label>
                <div className="mb-0 min-h-[120px] w-full border-y border-input bg-background px-4 py-2 text-base md:text-sm">
                  {key === ('funding_source_id' as any) ? (
                    <ul className="list-inside space-y-4 py-2">
                      <li className="list-none">
                        <p className="font-semibold text-muted-foreground">
                          a. Sumber Dana
                        </p>
                        <p className="mt-1 ml-4">
                          {detail?.funding_source?.name ?? '-'}
                        </p>
                      </li>
                      <li className="list-none">
                        <p className="font-semibold text-muted-foreground">
                          b. Total perkiraan biaya:
                        </p>
                        <p className="mt-1 ml-4">
                          {detail?.estimated_cost ?? '-'}
                        </p>
                      </li>
                    </ul>
                  ) : value ? (
                    <EditorRenderer value={value?.toString()} />
                  ) : (
                    <p className="text-sm text-muted-foreground">-</p>
                  )}
                </div>
                {key === 'technical_specifications' &&
                  attachments.length > 0 && (
                    <div className="-mb-6 p-2">
                      <AttachmentList
                        attachments={attachments}
                        showHeader={false}
                        allowDelete={false}
                        showCard={false}
                        variant="grid"
                        className=""
                      />
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
