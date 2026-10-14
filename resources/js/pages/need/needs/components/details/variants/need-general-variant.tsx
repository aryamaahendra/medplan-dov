import { formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Need } from '@/types';

import type { NeedUiVariant } from '../need-show-variants';

interface NeedGeneralVariantProps {
  need: Need;
  variant: NeedUiVariant;
}

export function NeedGeneralVariant({ need, variant }: NeedGeneralVariantProps) {
  switch (variant) {
    case 'blueprint':
      return <BlueprintGeneral need={need} />;
    case 'matrix':
      return <MatrixGeneral need={need} />;
    case 'datasheet':
      return <DatasheetGeneral need={need} />;
    case 'parametric':
      return <ParametricGeneral need={need} />;
    case 'tree':
      return <TreeGeneral need={need} />;
    default:
      return <BlueprintGeneral need={need} />;
  }
}

/**
 * 1. Blueprint Ledger:
 * Dotted leader lines connecting sans labels to values.
 * Monospace strictly for numbers, prices, volumes, and years.
 */
function BlueprintGeneral({ need }: { need: Need }) {
  return (
    <div className="space-y-6">
      {/* Spec Header */}
      <div className="border-b border-border/80 pb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold tracking-wider text-primary uppercase">
            Spesifikasi Pokok Usulan
          </span>
          <span className="font-mono text-xs">
            REG-{need.id.toString().padStart(5, '0')}
          </span>
        </div>
        <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {need.title}
        </h3>
      </div>

      {/* Dotted Leader Line Rows */}
      <div className="space-y-3 text-xs sm:text-sm">
        <BlueprintRow
          label="Kelompok Usulan"
          value={need.needGroup?.name || '-'}
        />
        <BlueprintRow
          label="Unit Pengusul"
          value={need.organizational_unit?.name || '-'}
        />
        <BlueprintRow
          label="Tahun Anggaran"
          value={String(need.year)}
          isNumeric
        />
        <BlueprintRow
          label="Kategori Kebutuhan"
          value={need.need_type?.name || 'Kebutuhan Umum'}
        />
        <BlueprintRow
          label="Volume Pengadaan"
          value={`${need.volume} ${need.unit}`}
          isNumeric
        />
        <BlueprintRow
          label="Estimasi Harga Satuan"
          value={formatIDR(need.unit_price)}
          isNumeric
        />
        <BlueprintRow
          label="Total Pagu Anggaran"
          value={formatIDR(need.total_price)}
          isNumeric
          highlight
        />
      </div>

      {/* Conditions in Blueprint Context Box */}
      <div className="space-y-3 border-t border-border/60 pt-4">
        <div className="border-l-2 border-border/80 pl-3">
          <div className="text-xs font-semibold text-muted-foreground">
            Kondisi Eksisting Saat Ini
          </div>
          <p className="mt-1 text-xs leading-relaxed text-foreground sm:text-sm">
            {need.current_condition || (
              <span className="text-muted-foreground italic">
                Tidak ada data kondisi saat ini.
              </span>
            )}
          </p>
        </div>

        <div className="border-l-2 border-primary pl-3">
          <div className="text-xs font-semibold text-primary">
            Target Kebutuhan yang Diharapkan
          </div>
          <p className="mt-1 text-xs leading-relaxed text-foreground sm:text-sm">
            {need.required_condition || (
              <span className="text-muted-foreground italic">
                Tidak ada data target kebutuhan.
              </span>
            )}
          </p>
        </div>

        {need.description && (
          <div className="border-l-2 border-muted-foreground/40 pl-3">
            <div className="text-xs font-semibold text-muted-foreground">
              Justifikasi & Deskripsi Kebutuhan
            </div>
            <p className="mt-1 text-xs leading-relaxed whitespace-pre-line text-foreground sm:text-sm">
              {need.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BlueprintRow({
  label,
  value,
  isNumeric = false,
  highlight = false,
}: {
  label: string;
  value: string;
  isNumeric?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="grow border-b border-dotted border-border/70" />
      <span
        className={cn(
          'shrink-0 text-right font-medium',
          isNumeric && 'font-mono font-semibold',
          highlight ? 'text-primary' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * 2. Technical Matrix:
 * Asymmetric 2-column bilateral split with vertical technical guide lines.
 */
function MatrixGeneral({ need }: { need: Need }) {
  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="border-b border-border/80 pb-3">
        <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Matriks Parameter Pengadaan
        </div>
        <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {need.title}
        </h3>
      </div>

      {/* Dual Column Parameter Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column: Administrative Identifiers */}
        <div className="space-y-3 border-l-2 border-border/70 pl-4">
          <div className="text-xs font-bold text-muted-foreground uppercase">
            Parameter Administratif
          </div>
          <MatrixItem
            label="Kelompok Usulan"
            value={need.needGroup?.name || '-'}
          />
          <MatrixItem
            label="Satuan Kerja"
            value={need.organizational_unit?.name || '-'}
          />
          <MatrixItem
            label="Klasifikasi Kebutuhan"
            value={need.need_type?.name || 'Umum'}
          />
          <MatrixItem
            label="Tahun Anggaran"
            value={String(need.year)}
            isNumeric
          />
        </div>

        {/* Right Column: Fiscal & Volume Metrics */}
        <div className="space-y-3 border-l-2 border-primary/70 pl-4">
          <div className="text-xs font-bold text-primary uppercase">
            Parameter Kuantitatif & Pagu
          </div>
          <MatrixItem
            label="Volume Kebutuhan"
            value={`${need.volume} ${need.unit}`}
            isNumeric
          />
          <MatrixItem
            label="Harga Satuan"
            value={formatIDR(need.unit_price)}
            isNumeric
          />
          <MatrixItem
            label="Total Pagu Indikatif"
            value={formatIDR(need.total_price)}
            isNumeric
            highlight
          />
        </div>
      </div>

      {/* Technical Narrative Context */}
      <div className="grid grid-cols-1 gap-4 border-t border-border/60 pt-4 md:grid-cols-2">
        <div className="rounded-md bg-muted/20 p-3.5 text-xs sm:text-sm">
          <span className="font-semibold text-muted-foreground">
            Kondisi Saat Ini:
          </span>
          <p className="mt-1 leading-relaxed text-foreground">
            {need.current_condition || '-'}
          </p>
        </div>

        <div className="rounded-md bg-muted/20 p-3.5 text-xs sm:text-sm">
          <span className="font-semibold text-primary">
            Target Kondisi Solusi:
          </span>
          <p className="mt-1 leading-relaxed text-foreground">
            {need.required_condition || '-'}
          </p>
        </div>
      </div>

      {need.description && (
        <div className="border-t border-border/40 pt-3 text-xs sm:text-sm">
          <span className="font-semibold text-muted-foreground">
            Justifikasi Pengadaan:
          </span>
          <p className="mt-1 leading-relaxed whitespace-pre-line text-foreground">
            {need.description}
          </p>
        </div>
      )}
    </div>
  );
}

function MatrixItem({
  label,
  value,
  isNumeric = false,
  highlight = false,
}: {
  label: string;
  value: string;
  isNumeric?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col text-xs sm:text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'mt-0.5 font-medium',
          isNumeric && 'font-mono font-semibold',
          highlight ? 'font-bold text-primary' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * 3. Industrial Datasheet:
 * Clean horizontal technical strips, high contrast, sans text with mono numbers.
 */
function DatasheetGeneral({ need }: { need: Need }) {
  return (
    <div className="space-y-6">
      {/* Datasheet Header Strip */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-foreground/80 pb-3">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Lembar Data Usulan Pengadaan
          </span>
          <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {need.title}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Total Anggaran</div>
          <div className="font-mono text-lg font-black text-primary sm:text-xl">
            {formatIDR(need.total_price)}
          </div>
        </div>
      </div>

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
          label="Volume Kuantitas"
          value={`${need.volume} ${need.unit}`}
          isNumeric
        />
        <DatasheetRow
          label="Estimasi Harga Satuan"
          value={formatIDR(need.unit_price)}
          isNumeric
        />
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

/**
 * 4. Parametric Table:
 * Open borderless tabular ledger: Parameter | Keterangan | Nilai.
 */
function ParametricGeneral({ need }: { need: Need }) {
  const rows = [
    {
      param: 'Kelompok Usulan',
      detail: 'Klasifikasi kelompok pengajuan',
      val: need.needGroup?.name || '-',
      isNum: false,
    },
    {
      param: 'Unit Pengusul',
      detail: 'Satuan organisasi pengusul',
      val: need.organizational_unit?.name || '-',
      isNum: false,
    },
    {
      param: 'Tahun Anggaran',
      detail: 'Periode tahun fiskal berjalan',
      val: String(need.year),
      isNum: true,
    },
    {
      param: 'Jenis Kebutuhan',
      detail: 'Kategori spesifikasi barang/jasa',
      val: need.need_type?.name || 'Kebutuhan Umum',
      isNum: false,
    },
    {
      param: 'Volume & Satuan',
      detail: 'Banyak kuantitas kebutuhan',
      val: `${need.volume} ${need.unit}`,
      isNum: true,
    },
    {
      param: 'Estimasi Harga Satuan',
      detail: 'Nilai per unit satuan pengadaan',
      val: formatIDR(need.unit_price),
      isNum: true,
    },
    {
      param: 'Total Alokasi Pagu',
      detail: 'Perhitungan pagu indikatif belanja',
      val: formatIDR(need.total_price),
      isNum: true,
      isHighlight: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-3">
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {need.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          Tabel ringkasan parameter data pokok usulan pengadaan.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border/80 text-muted-foreground">
              <th className="py-2.5 font-semibold">Parameter</th>
              <th className="py-2.5 font-semibold">Keterangan</th>
              <th className="py-2.5 text-right font-semibold">
                Nilai Spesifikasi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((row) => (
              <tr
                key={row.param}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="py-3 font-medium text-foreground">
                  {row.param}
                </td>
                <td className="py-3 text-muted-foreground">{row.detail}</td>
                <td
                  className={cn(
                    'py-3 text-right font-medium',
                    row.isNum && 'font-mono font-semibold',
                    row.isHighlight
                      ? 'font-bold text-primary'
                      : 'text-foreground',
                  )}
                >
                  {row.val}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Conditions Section */}
      <div className="space-y-3 border-t border-border/60 pt-4 text-xs sm:text-sm">
        <div>
          <span className="font-semibold text-muted-foreground">
            Kondisi Saat Ini:
          </span>
          <p className="mt-1 leading-relaxed text-foreground">
            {need.current_condition || '-'}
          </p>
        </div>
        <div>
          <span className="font-semibold text-primary">Kebutuhan Solusi:</span>
          <p className="mt-1 leading-relaxed text-foreground">
            {need.required_condition || '-'}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 5. Hierarchy Tree:
 * Structural breakdown with clean branch guide lines.
 */
function TreeGeneral({ need }: { need: Need }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-3">
        <div className="text-xs font-semibold tracking-wider text-primary uppercase">
          Struktur Spesifikasi Kebutuhan
        </div>
        <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {need.title}
        </h3>
      </div>

      {/* Tree Nodes */}
      <div className="space-y-6 pl-2">
        {/* Branch 1: Administrasi */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
              1
            </span>
            <span>Identitas Administratif</span>
          </div>

          <div className="space-y-2 border-l-2 border-border/70 pl-6 text-xs sm:text-sm">
            <TreeItem
              label="Kelompok Usulan"
              value={need.needGroup?.name || '-'}
            />
            <TreeItem
              label="Unit Pengusul"
              value={need.organizational_unit?.name || '-'}
            />
            <TreeItem
              label="Kategori Jenis"
              value={need.need_type?.name || 'Umum'}
            />
            <TreeItem
              label="Tahun Anggaran"
              value={String(need.year)}
              isNumeric
            />
          </div>
        </div>

        {/* Branch 2: Pagu & Kuantitas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
              2
            </span>
            <span>Alokasi Fiskal & Kuantitas</span>
          </div>

          <div className="space-y-2 border-l-2 border-primary/70 pl-6 text-xs sm:text-sm">
            <TreeItem
              label="Volume Pengadaan"
              value={`${need.volume} ${need.unit}`}
              isNumeric
            />
            <TreeItem
              label="Estimasi Harga Satuan"
              value={formatIDR(need.unit_price)}
              isNumeric
            />
            <TreeItem
              label="Total Alokasi Pagu"
              value={formatIDR(need.total_price)}
              isNumeric
              highlight
            />
          </div>
        </div>

        {/* Branch 3: Konteks & Justifikasi */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-muted-foreground">
              3
            </span>
            <span>Evaluasi Konteks Kebutuhan</span>
          </div>

          <div className="space-y-3 border-l-2 border-border/70 pl-6 text-xs sm:text-sm">
            <div>
              <span className="text-xs text-muted-foreground">
                Kondisi Eksisting:
              </span>
              <p className="mt-0.5 leading-relaxed text-foreground">
                {need.current_condition || '-'}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-primary">
                Target Solusi:
              </span>
              <p className="mt-0.5 leading-relaxed text-foreground">
                {need.required_condition || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeItem({
  label,
  value,
  isNumeric = false,
  highlight = false,
}: {
  label: string;
  value: string;
  isNumeric?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-right font-medium',
          isNumeric && 'font-mono font-semibold',
          highlight ? 'font-bold text-primary' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  );
}
