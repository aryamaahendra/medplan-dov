import type { Need } from '@/types';

import type { NeedUiVariant } from '../need-show-variants';

interface NeedPlanningVariantProps {
  need: Need;
  variant: NeedUiVariant;
}

export function NeedPlanningVariant({
  need,
  variant,
}: NeedPlanningVariantProps) {
  const selectedVersions = need.planning_activity_versions || [];
  const selectedIndicators = need.planning_activity_indicators || [];

  if (selectedVersions.length === 0 && selectedIndicators.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground italic">
        Belum ada keselarasan dokumen perencanaan pembangunan pada usulan ini.
      </div>
    );
  }

  // Group by activity type (Program, Kegiatan, Sub Kegiatan)
  const groupedVersions = selectedVersions.reduce(
    (acc, v) => {
      if (!acc[v.type]) {
        acc[v.type] = [];
      }

      acc[v.type].push(v);

      return acc;
    },
    {} as Record<string, typeof selectedVersions>,
  );

  switch (variant) {
    case 'blueprint':
      return (
        <BlueprintPlanning
          groupedVersions={groupedVersions}
          selectedIndicators={selectedIndicators}
        />
      );
    case 'matrix':
      return (
        <MatrixPlanning
          groupedVersions={groupedVersions}
          selectedIndicators={selectedIndicators}
        />
      );
    case 'datasheet':
      return (
        <DatasheetPlanning
          groupedVersions={groupedVersions}
          selectedIndicators={selectedIndicators}
        />
      );
    case 'parametric':
      return (
        <ParametricPlanning
          groupedVersions={groupedVersions}
          selectedIndicators={selectedIndicators}
        />
      );
    case 'tree':
      return (
        <TreePlanning
          groupedVersions={groupedVersions}
          selectedIndicators={selectedIndicators}
        />
      );
    default:
      return (
        <BlueprintPlanning
          groupedVersions={groupedVersions}
          selectedIndicators={selectedIndicators}
        />
      );
  }
}

/**
 * 1. Blueprint Ledger:
 * Dotted leader lines with activity codes in mono, names in sans.
 */
function BlueprintPlanning({
  groupedVersions,
  selectedIndicators,
}: {
  groupedVersions: Record<string, Need['planning_activity_versions']>;
  selectedIndicators: NonNullable<Need['planning_activity_indicators']>;
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-3">
        <span className="text-xs font-semibold text-primary uppercase">
          Spesifikasi Nomenklatur Perencanaan
        </span>
        <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Keselarasan Aktivitas SIPD
        </h3>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedVersions).map(([type, versions]) => (
          <div key={type} className="space-y-3">
            <div className="text-xs font-bold text-muted-foreground uppercase">
              Tingkat {type}
            </div>

            <div className="space-y-2.5 pl-3">
              {versions?.map((v) => {
                const indicators = selectedIndicators.filter(
                  (i) => i.planning_activity_version_id === v.id,
                );

                return (
                  <div key={v.id} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2 text-xs sm:text-sm">
                      <span className="font-medium text-foreground">
                        {v.name}
                      </span>
                      <span className="grow border-b border-dotted border-border/70" />
                      <span className="shrink-0 font-mono text-xs font-semibold text-primary">
                        {v.code || '-'}
                      </span>
                    </div>

                    {indicators.length > 0 && (
                      <div className="space-y-1 pl-4 text-xs text-muted-foreground">
                        {indicators.map((ind) => (
                          <div
                            key={ind.id}
                            className="flex items-center gap-1.5"
                          >
                            <span className="text-muted-foreground/60">•</span>
                            <span>Tolok Ukur: {ind.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 2. Technical Matrix:
 * Bilateral split grouping of program activities.
 */
function MatrixPlanning({
  groupedVersions,
  selectedIndicators,
}: {
  groupedVersions: Record<string, Need['planning_activity_versions']>;
  selectedIndicators: NonNullable<Need['planning_activity_indicators']>;
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-3">
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Matriks Perencanaan Pembangunan Daerah
        </h3>
        <p className="text-xs text-muted-foreground">
          Penyelarasan kodefikasi program, kegiatan, dan sub-kegiatan beserta
          indikatornya.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Object.entries(groupedVersions).map(([type, versions]) => (
          <div
            key={type}
            className="space-y-3 border-l-2 border-border/70 pl-4"
          >
            <div className="text-xs font-bold text-muted-foreground uppercase">
              Klasifikasi {type}
            </div>

            <div className="space-y-3">
              {versions?.map((v) => {
                const indicators = selectedIndicators.filter(
                  (i) => i.planning_activity_version_id === v.id,
                );

                return (
                  <div key={v.id} className="space-y-1 text-xs">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-foreground">
                        {v.name}
                      </span>
                      <span className="font-mono text-xs font-bold text-primary">
                        {v.code || '-'}
                      </span>
                    </div>

                    {indicators.map((ind) => (
                      <div key={ind.id} className="pl-2 text-muted-foreground">
                        - Indikator: {ind.name}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 3. Industrial Datasheet:
 * Clean horizontal strip rows.
 */
function DatasheetPlanning({
  groupedVersions,
  selectedIndicators,
}: {
  groupedVersions: Record<string, Need['planning_activity_versions']>;
  selectedIndicators: NonNullable<Need['planning_activity_indicators']>;
}) {
  return (
    <div className="space-y-6">
      <div className="border-b-2 border-foreground/80 pb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase">
          Lembar Spesifikasi Perencanaan Pembangunan
        </span>
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Nomenklatur Aktivitas SIPD
        </h3>
      </div>

      <div className="divide-y divide-border/60">
        {Object.entries(groupedVersions).map(([type, versions]) => (
          <div key={type} className="py-3 text-xs sm:text-sm">
            <div className="text-xs font-bold text-muted-foreground uppercase">
              [{type}]
            </div>
            <div className="mt-2 space-y-2 pl-3">
              {versions?.map((v) => {
                const indicators = selectedIndicators.filter(
                  (i) => i.planning_activity_version_id === v.id,
                );

                return (
                  <div key={v.id} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-medium text-foreground">
                        {v.name}
                      </span>
                      <span className="font-mono text-xs font-semibold text-primary">
                        {v.code || '-'}
                      </span>
                    </div>

                    {indicators.map((ind) => (
                      <div
                        key={ind.id}
                        className="pl-3 text-xs text-muted-foreground"
                      >
                        • Tolok Ukur: {ind.name}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 4. Parametric Table:
 * Open tabular spec without card wrappers.
 */
function ParametricPlanning({
  groupedVersions,
  selectedIndicators,
}: {
  groupedVersions: Record<string, Need['planning_activity_versions']>;
  selectedIndicators: NonNullable<Need['planning_activity_indicators']>;
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-3">
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Tabel Nomenklatur Perencanaan SIPD
        </h3>
        <p className="text-xs text-muted-foreground">
          Daftar keselarasan aktivitas perencanaan pembangunan beserta
          kodefikasinya.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border/80 text-muted-foreground">
              <th className="py-2.5 font-semibold">Tingkat</th>
              <th className="py-2.5 font-semibold">
                Nama Aktivitas & Tolok Ukur
              </th>
              <th className="py-2.5 text-right font-semibold">Kode Rekening</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {Object.entries(groupedVersions).flatMap(([type, versions]) =>
              (versions || []).map((v) => {
                const indicators = selectedIndicators.filter(
                  (i) => i.planning_activity_version_id === v.id,
                );

                return (
                  <tr
                    key={v.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="py-3 font-medium text-muted-foreground">
                      {type}
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-foreground">
                        {v.name}
                      </div>
                      {indicators.map((ind) => (
                        <div
                          key={ind.id}
                          className="text-[11px] text-muted-foreground"
                        >
                          • {ind.name}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 text-right font-mono text-xs font-semibold text-primary">
                      {v.code || '-'}
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 5. Hierarchy Tree:
 * Technical tree structure.
 */
function TreePlanning({
  groupedVersions,
  selectedIndicators,
}: {
  groupedVersions: Record<string, Need['planning_activity_versions']>;
  selectedIndicators: NonNullable<Need['planning_activity_indicators']>;
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-3">
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Hierarki Nomenklatur Perencanaan
        </h3>
        <p className="text-xs text-muted-foreground">
          Pohon susunan tingkat program, kegiatan, dan sub-kegiatan SIPD.
        </p>
      </div>

      <div className="space-y-6 pl-2">
        {Object.entries(groupedVersions).map(([type, versions]) => (
          <div key={type} className="space-y-3">
            <div className="text-xs font-bold text-foreground">
              Tingkat {type}
            </div>

            <div className="space-y-3 border-l-2 border-border/70 pl-6 text-xs sm:text-sm">
              {versions?.map((v) => {
                const indicators = selectedIndicators.filter(
                  (i) => i.planning_activity_version_id === v.id,
                );

                return (
                  <div key={v.id} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-medium text-foreground">
                        {v.name}
                      </span>
                      <span className="font-mono text-xs font-semibold text-primary">
                        {v.code || '-'}
                      </span>
                    </div>

                    {indicators.map((ind) => (
                      <div
                        key={ind.id}
                        className="pl-3 text-xs text-muted-foreground"
                      >
                        |- Indikator: {ind.name}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
