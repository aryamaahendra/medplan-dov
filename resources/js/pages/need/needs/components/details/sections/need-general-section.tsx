import { formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Need } from '@/types';

import { NeedFinancialComparisonCards } from '../need-financial-comparison-cards';
import { resolveNeedFinancialFigures } from '../need-financial-utils';

interface NeedGeneralSectionProps {
  need: Need;
}

export function NeedGeneralSection({ need }: NeedGeneralSectionProps) {
  const {
    requestedVolume,
    approvedVolume,
    approvedUnitPrice,
    approvedTotalPrice,
    isApproved,
  } = resolveNeedFinancialFigures(need);

  const formattedVolume = requestedVolume.toLocaleString('id-ID', {
    maximumFractionDigits: 4,
  });
  const formattedApprovedVolume =
    approvedVolume !== null
      ? approvedVolume.toLocaleString('id-ID', {
          maximumFractionDigits: 4,
        })
      : null;

  return (
    <div className="space-y-6">
      {/* Datasheet Header Strip */}
      <div>
        <h3 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
          {need.title}
        </h3>
      </div>

      {/* Financial Determinations Comparison Cards */}
      <NeedFinancialComparisonCards need={need} />
      {/* Horizontal Data Strip Rows */}
      <div className="divide-y divide-border/60">
        <DatasheetRow
          label="Kelompok Usulan"
          value={need.needGroup?.name || '-'}
        />
        <DatasheetRow
          label="Unit Pengusul"
          value={need.organizational_unit?.name || '-'}
        />
        <DatasheetRow
          label="Tahun Anggaran"
          value={String(need.year)}
          isNumeric
        />
        <DatasheetRow
          label="Kategori Kebutuhan"
          value={need.need_type?.name || 'Kebutuhan Umum'}
        />
        <DatasheetRow
          label="Volume Usulan Awal"
          value={`${formattedVolume} ${need.unit}`}
          isNumeric
        />
        {isApproved && formattedApprovedVolume !== null && (
          <DatasheetRow
            label="Volume Disetujui Direktur"
            value={`${formattedApprovedVolume} ${need.unit}`}
            isNumeric
          />
        )}
        <DatasheetRow
          label="Harga Satuan Usulan"
          value={formatIDR(need.unit_price)}
          isNumeric
        />
        {isApproved && approvedUnitPrice !== null && (
          <DatasheetRow
            label="Harga Satuan Disetujui"
            value={formatIDR(approvedUnitPrice)}
            isNumeric
          />
        )}
        <DatasheetRow
          label="Total Anggaran Usulan"
          value={formatIDR(need.total_price)}
          isNumeric
        />
        {isApproved && approvedTotalPrice !== null && (
          <DatasheetRow
            label="Pagu Total Disetujui"
            value={formatIDR(approvedTotalPrice)}
            isNumeric
          />
        )}
        {isApproved &&
          need.is_recommended_for_next_cycle &&
          need.recommended_volume && (
            <DatasheetRow
              label="Sisa Rekomendasi Siklus Berikutnya"
              value={`${Number(need.recommended_volume).toLocaleString(
                'id-ID',
                {
                  maximumFractionDigits: 4,
                },
              )} ${need.unit}`}
              isNumeric
            />
          )}
        <DatasheetRow
          label="Kondisi Saat Ini"
          value={need.current_condition || '-'}
        />
        <DatasheetRow
          label="Kebutuhan Target"
          value={need.required_condition || '-'}
        />
        {need.description && (
          <DatasheetRow
            label="Deskripsi / Justifikasi"
            value={need.description}
            multiline
          />
        )}
      </div>
    </div>
  );
}

function DatasheetRow({
  label,
  value,
  isNumeric = false,
  multiline = false,
}: {
  label: string;
  value: string;
  isNumeric?: boolean;
  multiline?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 py-3 text-xs sm:flex-row sm:gap-6 sm:text-sm',
        multiline ? 'items-start' : 'items-baseline',
      )}
    >
      <div className="w-full shrink-0 font-medium text-muted-foreground sm:w-52">
        {label}
      </div>
      <div
        className={cn(
          'min-w-0 flex-1 font-medium text-foreground',
          isNumeric && 'font-mono font-semibold',
          multiline && 'leading-relaxed whitespace-pre-line',
        )}
      >
        {value}
      </div>
    </div>
  );
}
