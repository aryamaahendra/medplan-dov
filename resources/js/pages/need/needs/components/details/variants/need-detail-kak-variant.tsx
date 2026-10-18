import { EditorRenderer } from '@/components/ui/editor-renderer';
import type { Attachment, NeedDetail } from '@/types';

import { AttachmentList } from '../../attachment-list';
import { ExportPdfDialog } from '../../export-pdf-dialog';
import type { NeedUiVariant } from '../need-show-variants';

interface NeedDetailKakVariantProps {
  needId: number;
  detail?: NeedDetail | null;
  attachments?: Attachment[];
  users: { id: number; name: string; nip: string | null }[];
  variant: NeedUiVariant;
}

export function NeedDetailKakVariant({
  needId,
  detail,
  attachments = [],
  users = [],
  variant,
}: NeedDetailKakVariantProps) {
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

  switch (variant) {
    case 'blueprint':
      return (
        <BlueprintKak
          needId={needId}
          detail={detail}
          attachments={attachments}
          users={users}
        />
      );
    case 'matrix':
      return (
        <MatrixKak
          needId={needId}
          detail={detail}
          attachments={attachments}
          users={users}
        />
      );
    case 'datasheet':
      return (
        <DatasheetKak
          needId={needId}
          detail={detail}
          attachments={attachments}
          users={users}
        />
      );
    case 'parametric':
      return (
        <ParametricKak
          needId={needId}
          detail={detail}
          attachments={attachments}
          users={users}
        />
      );
    case 'tree':
      return (
        <TreeKak
          needId={needId}
          detail={detail}
          attachments={attachments}
          users={users}
        />
      );
    default:
      return (
        <BlueprintKak
          needId={needId}
          detail={detail}
          attachments={attachments}
          users={users}
        />
      );
  }
}

/**
 * 1. Blueprint Ledger:
 * Clean technical parameter sections with dotted leader guides for metadata.
 */
function BlueprintKak({
  needId,
  detail,
  attachments,
  users,
}: {
  needId: number;
  detail: NeedDetail;
  attachments: Attachment[];
  users: { id: number; name: string; nip: string | null }[];
}) {
  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold text-primary uppercase">
            Spesifikasi Dokumen Pengadaan
          </span>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Kerangka Acuan Kerja (KAK)
          </h3>
        </div>
        <ExportPdfDialog needId={needId} users={users} />
      </div>

      {/* Structured Sections */}
      <div className="space-y-6">
        <BlueprintKakItem label="1. Latar Belakang">
          <RichValue value={detail.background} />
        </BlueprintKakItem>

        <BlueprintKakItem label="2. Maksud & Tujuan">
          <RichValue value={detail.purpose_and_objectives} />
        </BlueprintKakItem>

        <BlueprintKakItem label="3. Target / Sasaran Kegiatan">
          <RichValue value={detail.target_objective} />
        </BlueprintKakItem>

        <BlueprintKakItem label="4. Organisasi Pengadaan">
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-muted-foreground">K/L/D/I</span>
              <span className="grow border-b border-dotted border-border/70" />
              <span className="font-medium text-foreground">
                {detail.kldi || '-'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-muted-foreground">Satuan Kerja / SKPD</span>
              <span className="grow border-b border-dotted border-border/70" />
              <span className="font-medium text-foreground">
                {detail.satker_skpd || '-'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-muted-foreground">KPA</span>
              <span className="grow border-b border-dotted border-border/70" />
              <span className="font-medium text-foreground">
                {detail.kpa?.name || '-'}
              </span>
            </div>
          </div>
        </BlueprintKakItem>

        <BlueprintKakItem label="5. Sumber Pendanaan & Biaya">
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-muted-foreground">Sumber Dana</span>
              <span className="grow border-b border-dotted border-border/70" />
              <span className="font-medium text-foreground">
                {detail.funding_sources?.map((s) => s.name).join(', ') || '-'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-muted-foreground">
                Estimasi Total Biaya
              </span>
              <span className="grow border-b border-dotted border-border/70" />
              <span className="font-mono text-xs font-semibold">
                {detail.estimated_cost || '-'}
              </span>
            </div>
          </div>
        </BlueprintKakItem>

        <BlueprintKakItem label="6. Periode Pelaksanaan">
          <RichValue value={detail.implementation_period} />
        </BlueprintKakItem>

        <BlueprintKakItem label="7. Tenaga Ahli / SDM Terampil">
          <RichValue value={detail.expert_or_skilled_personnel} />
        </BlueprintKakItem>

        <BlueprintKakItem label="8. Spesifikasi Teknis">
          <div className="space-y-4">
            <RichValue value={detail.technical_specifications} />
            {attachments.length > 0 && (
              <div className="border-t border-border/60 pt-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Berkas Spesifikasi Teknis Terlampir:
                </span>
                <div className="mt-2">
                  <AttachmentList
                    attachments={attachments}
                    showHeader={false}
                    allowDelete={false}
                    showCard={false}
                    variant="grid"
                  />
                </div>
              </div>
            )}
          </div>
        </BlueprintKakItem>

        <BlueprintKakItem label="9. Pelatihan">
          <RichValue value={detail.training} />
        </BlueprintKakItem>
      </div>
    </div>
  );
}

function BlueprintKakItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-l-2 border-border/80 pl-4">
      <div className="text-xs font-bold text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-2 text-xs leading-relaxed text-foreground sm:text-sm">
        {children}
      </div>
    </div>
  );
}

/**
 * 2. Technical Matrix:
 * Bilateral 2-column parameter presentation.
 */
function MatrixKak({
  needId,
  detail,
  attachments,
  users,
}: {
  needId: number;
  detail: NeedDetail;
  attachments: Attachment[];
  users: { id: number; name: string; nip: string | null }[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-border/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Matriks Spesifikasi KAK
          </h3>
          <p className="text-xs text-muted-foreground">
            Rincian teknis dan operasional kerangka acuan kerja usulan.
          </p>
        </div>
        <ExportPdfDialog needId={needId} users={users} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6 border-l-2 border-border/70 pl-4">
          <MatrixKakBlock title="Latar Belakang">
            <RichValue value={detail.background} />
          </MatrixKakBlock>

          <MatrixKakBlock title="Maksud & Tujuan">
            <RichValue value={detail.purpose_and_objectives} />
          </MatrixKakBlock>

          <MatrixKakBlock title="Target / Sasaran">
            <RichValue value={detail.target_objective} />
          </MatrixKakBlock>

          <MatrixKakBlock title="Organisasi Pengadaan">
            <div className="space-y-1 text-xs sm:text-sm">
              <div>K/L/D/I: {detail.kldi || '-'}</div>
              <div>Satuan Kerja: {detail.satker_skpd || '-'}</div>
              <div>KPA: {detail.kpa?.name || '-'}</div>
            </div>
          </MatrixKakBlock>
        </div>

        <div className="space-y-6 border-l-2 border-primary/70 pl-4">
          <MatrixKakBlock title="Sumber Pendanaan & Biaya">
            <div className="space-y-1 text-xs sm:text-sm">
              <div>
                Sumber Dana:{' '}
                {detail.funding_sources?.map((s) => s.name).join(', ') || '-'}
              </div>
              <div className="font-mono text-xs font-semibold">
                Total Biaya: {detail.estimated_cost || '-'}
              </div>
            </div>
          </MatrixKakBlock>

          <MatrixKakBlock title="Periode Pelaksanaan">
            <RichValue value={detail.implementation_period} />
          </MatrixKakBlock>

          <MatrixKakBlock title="Tenaga Ahli">
            <RichValue value={detail.expert_or_skilled_personnel} />
          </MatrixKakBlock>

          <MatrixKakBlock title="Pelatihan">
            <RichValue value={detail.training} />
          </MatrixKakBlock>
        </div>
      </div>

      {/* Full width for Technical specifications */}
      <div className="border-t border-border/60 pt-6">
        <div className="text-xs font-bold text-foreground uppercase">
          Spesifikasi Teknis Lengkap
        </div>
        <div className="mt-2 text-xs leading-relaxed text-foreground sm:text-sm">
          <RichValue value={detail.technical_specifications} />
          {attachments.length > 0 && (
            <div className="mt-4 border-t border-border/40 pt-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Berkas Lampiran Teknis:
              </span>
              <div className="mt-2">
                <AttachmentList
                  attachments={attachments}
                  showHeader={false}
                  allowDelete={false}
                  showCard={false}
                  variant="grid"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MatrixKakBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-bold text-muted-foreground uppercase">
        {title}
      </div>
      <div className="text-xs leading-relaxed text-foreground sm:text-sm">
        {children}
      </div>
    </div>
  );
}

/**
 * 3. Industrial Datasheet:
 * Clean horizontal strip rows with high contrast.
 */
function DatasheetKak({
  needId,
  detail,
  attachments,
  users,
}: {
  needId: number;
  detail: NeedDetail;
  attachments: Attachment[];
  users: { id: number; name: string; nip: string | null }[];
}) {
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

/**
 * 4. Parametric Table:
 * Open tabular spec without card wrappers.
 */
function ParametricKak({
  needId,
  detail,
  attachments,
  users,
}: {
  needId: number;
  detail: NeedDetail;
  attachments: Attachment[];
  users: { id: number; name: string; nip: string | null }[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-border/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Tabel Parameter KAK
          </h3>
          <p className="text-xs text-muted-foreground">
            Spesifikasi Kerangka Acuan Kerja dalam matriks parameter terbuka.
          </p>
        </div>
        <ExportPdfDialog needId={needId} users={users} />
      </div>

      <div className="divide-y divide-border/40 text-xs sm:text-sm">
        <ParametricSection title="Latar Belakang">
          <RichValue value={detail.background} />
        </ParametricSection>

        <ParametricSection title="Maksud & Tujuan">
          <RichValue value={detail.purpose_and_objectives} />
        </ParametricSection>

        <ParametricSection title="Target / Sasaran">
          <RichValue value={detail.target_objective} />
        </ParametricSection>

        <ParametricSection title="Organisasi Pengadaan">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div>KLDI: {detail.kldi || '-'}</div>
            <div>Satker: {detail.satker_skpd || '-'}</div>
            <div>KPA: {detail.kpa?.name || '-'}</div>
          </div>
        </ParametricSection>

        <ParametricSection title="Pendanaan & Biaya">
          <div className="space-y-1">
            <div>
              Sumber Dana:{' '}
              {detail.funding_sources?.map((s) => s.name).join(', ') || '-'}
            </div>
            <div className="font-mono text-xs font-semibold">
              Estimasi Biaya: {detail.estimated_cost || '-'}
            </div>
          </div>
        </ParametricSection>

        <ParametricSection title="Periode Pelaksanaan">
          <RichValue value={detail.implementation_period} />
        </ParametricSection>

        <ParametricSection title="Tenaga Ahli">
          <RichValue value={detail.expert_or_skilled_personnel} />
        </ParametricSection>

        <ParametricSection title="Spesifikasi Teknis">
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
        </ParametricSection>

        <ParametricSection title="Pelatihan">
          <RichValue value={detail.training} />
        </ParametricSection>
      </div>
    </div>
  );
}

function ParametricSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-3.5">
      <div className="font-semibold text-muted-foreground">{title}</div>
      <div className="mt-1 leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

/**
 * 5. Hierarchy Tree:
 * Technical tree structure.
 */
function TreeKak({
  needId,
  detail,
  attachments,
  users,
}: {
  needId: number;
  detail: NeedDetail;
  attachments: Attachment[];
  users: { id: number; name: string; nip: string | null }[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-border/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Struktur Rincian KAK
          </h3>
          <p className="text-xs text-muted-foreground">
            Dekomposisi bertingkat komponen Kerangka Acuan Kerja.
          </p>
        </div>
        <ExportPdfDialog needId={needId} users={users} />
      </div>

      <div className="space-y-6 pl-2">
        <TreeKakBranch
          index={1}
          title="Dasar Kebutuhan (Latar Belakang & Tujuan)"
        >
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-muted-foreground">
                Latar Belakang:
              </span>
              <div className="mt-1">
                <RichValue value={detail.background} />
              </div>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">
                Maksud & Tujuan:
              </span>
              <div className="mt-1">
                <RichValue value={detail.purpose_and_objectives} />
              </div>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">
                Target / Sasaran:
              </span>
              <div className="mt-1">
                <RichValue value={detail.target_objective} />
              </div>
            </div>
          </div>
        </TreeKakBranch>

        <TreeKakBranch index={2} title="Ketentuan Penyelenggaraan & Biaya">
          <div className="space-y-2 text-xs sm:text-sm">
            <div>
              Organisasi: {detail.kldi || '-'} / {detail.satker_skpd || '-'}{' '}
              (KPA: {detail.kpa?.name || '-'})
            </div>
            <div>
              Sumber Dana:{' '}
              {detail.funding_sources?.map((s) => s.name).join(', ') || '-'}
            </div>
            <div className="font-mono text-xs font-bold text-primary">
              Biaya: {detail.estimated_cost || '-'}
            </div>
            <div>Periode: {detail.implementation_period || '-'}</div>
          </div>
        </TreeKakBranch>

        <TreeKakBranch index={3} title="Spesifikasi Teknis & Pelatihan">
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-muted-foreground">
                Tenaga Ahli:
              </span>
              <div className="mt-1">
                <RichValue value={detail.expert_or_skilled_personnel} />
              </div>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">
                Spesifikasi Teknis:
              </span>
              <div className="mt-1">
                <RichValue value={detail.technical_specifications} />
              </div>
              {attachments.length > 0 && (
                <div className="mt-2">
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
            <div>
              <span className="font-semibold text-muted-foreground">
                Pelatihan:
              </span>
              <div className="mt-1">
                <RichValue value={detail.training} />
              </div>
            </div>
          </div>
        </TreeKakBranch>
      </div>
    </div>
  );
}

function TreeKakBranch({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
          {index}
        </span>
        <span>{title}</span>
      </div>

      <div className="space-y-2 border-l-2 border-border/70 pl-6 text-xs sm:text-sm">
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
