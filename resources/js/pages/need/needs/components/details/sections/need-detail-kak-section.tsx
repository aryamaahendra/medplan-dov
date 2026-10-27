import React from 'react';

import { EditorRenderer } from '@/components/ui/editor-renderer';
import type { Attachment, NeedDetail } from '@/types';

import { AttachmentList } from '../../attachment-list';
import { ExportPdfDialog } from '../../export-pdf-dialog';

interface NeedDetailKakSectionProps {
  needId: number;
  detail?: NeedDetail | null;
  attachments?: Attachment[];
  users: { id: number; name: string; nip: string | null }[];
}

export function NeedDetailKakSection({
  needId,
  detail,
  attachments = [],
  users = [],
}: NeedDetailKakSectionProps) {
  if (!detail) {
    return (
      <div className="space-y-4 py-8">
        <div className="flex justify-end">
          <ExportPdfDialog needId={needId} users={users} />
        </div>
        <div className="py-12 text-center text-sm text-muted-foreground italic">
          Dokumen Kerangka Acuan Kerja (KAK) belum diisi.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b-2 border-foreground/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Lembar Spesifikasi KAK
          </span>
          <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Kerangka Acuan Kerja
          </h3>
        </div>
        <ExportPdfDialog needId={needId} users={users} />
      </div>

      <div className="divide-y divide-border/60">
        <DatasheetKakRow label="Latar Belakang">
          <RichValue value={detail.background} />
        </DatasheetKakRow>

        <DatasheetKakRow label="Maksud & Tujuan">
          <RichValue value={detail.purpose_and_objectives} />
        </DatasheetKakRow>

        <DatasheetKakRow label="Target / Sasaran">
          <RichValue value={detail.target_objective} />
        </DatasheetKakRow>

        <DatasheetKakRow label="Organisasi Pengadaan">
          <div className="space-y-1 text-xs">
            <div>K/L/D/I: {detail.kldi || '-'}</div>
            <div>Satker: {detail.satker_skpd || '-'}</div>
            <div>KPA: {detail.kpa?.name || '-'}</div>
          </div>
        </DatasheetKakRow>

        <DatasheetKakRow label="Pendanaan & Biaya">
          <div className="space-y-1 text-xs">
            <div>
              Sumber Dana:{' '}
              {detail.funding_sources?.map((s) => s.name).join(', ') || '-'}
            </div>
            <div className="font-mono text-xs font-semibold">
              Estimasi: {detail.estimated_cost || '-'}
            </div>
          </div>
        </DatasheetKakRow>

        <DatasheetKakRow label="Periode Pelaksanaan">
          <RichValue value={detail.implementation_period} />
        </DatasheetKakRow>

        <DatasheetKakRow label="Tenaga Ahli">
          <RichValue value={detail.expert_or_skilled_personnel} />
        </DatasheetKakRow>

        <DatasheetKakRow label="Spesifikasi Teknis">
          <div className="space-y-3">
            <RichValue value={detail.technical_specifications} />
            {attachments.length > 0 && (
              <div className="pt-2">
                <AttachmentList
                  attachments={attachments}
                  showHeader={false}
                  allowDelete={false}
                  showCard={false}
                  variant="grid"
                />
              </div>
            )}
          </div>
        </DatasheetKakRow>

        <DatasheetKakRow label="Pelatihan">
          <RichValue value={detail.training} />
        </DatasheetKakRow>
      </div>
    </div>
  );
}

function DatasheetKakRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 py-4 text-xs sm:flex-row sm:gap-6 sm:text-sm">
      <div className="w-full shrink-0 font-medium text-muted-foreground sm:w-52">
        {label}
      </div>
      <div className="min-w-0 flex-1 leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}

function RichValue({ value }: { value?: string | null }) {
  if (!value) {
    return <span className="text-muted-foreground italic">-</span>;
  }

  return <EditorRenderer value={value.toString()} />;
}
