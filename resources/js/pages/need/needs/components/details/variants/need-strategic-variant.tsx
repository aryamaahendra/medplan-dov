import type {
  KpiIndicator,
  Need,
  Sasaran,
  StrategicServicePlan,
  Tujuan,
} from '@/types';

import type { NeedUiVariant } from '../need-show-variants';

interface NeedStrategicVariantProps {
  need: Need;
  groupedRenstra: (Tujuan & { sasarans: Sasaran[] })[];
  variant: NeedUiVariant;
}

export function NeedStrategicVariant({
  need,
  groupedRenstra,
  variant,
}: NeedStrategicVariantProps) {
  const kpiIndicators = need.kpi_indicators || [];
  const rlsPlans = need.strategic_service_plans || [];

  const isEmpty =
    groupedRenstra.length === 0 &&
    kpiIndicators.length === 0 &&
    rlsPlans.length === 0;

  if (isEmpty) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground italic">
        Belum ada data penyelarasan Renstra, IKK, atau RLS pada usulan ini.
      </div>
    );
  }

  switch (variant) {
    case 'blueprint':
      return (
        <BlueprintStrategic
          groupedRenstra={groupedRenstra}
          kpiIndicators={kpiIndicators}
          rlsPlans={rlsPlans}
        />
      );
    case 'matrix':
      return (
        <MatrixStrategic
          groupedRenstra={groupedRenstra}
          kpiIndicators={kpiIndicators}
          rlsPlans={rlsPlans}
        />
      );
    case 'datasheet':
      return (
        <DatasheetStrategic
          groupedRenstra={groupedRenstra}
          kpiIndicators={kpiIndicators}
          rlsPlans={rlsPlans}
        />
      );
    case 'parametric':
      return (
        <ParametricStrategic
          groupedRenstra={groupedRenstra}
          kpiIndicators={kpiIndicators}
          rlsPlans={rlsPlans}
        />
      );
    case 'tree':
      return (
        <TreeStrategic
          groupedRenstra={groupedRenstra}
          kpiIndicators={kpiIndicators}
          rlsPlans={rlsPlans}
        />
      );
    default:
      return (
        <BlueprintStrategic
          groupedRenstra={groupedRenstra}
          kpiIndicators={kpiIndicators}
          rlsPlans={rlsPlans}
        />
      );
  }
}

/**
 * 1. Blueprint Ledger:
 * Dotted leader lines, sans text, monospace numbers.
 */
function BlueprintStrategic({
  groupedRenstra,
  kpiIndicators,
  rlsPlans,
}: {
  groupedRenstra: (Tujuan & { sasarans: Sasaran[] })[];
  kpiIndicators: KpiIndicator[];
  rlsPlans: StrategicServicePlan[];
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-primary uppercase">
            Spesifikasi Keselarasan Strategis
          </span>
          <span className="font-mono text-xs">
            {groupedRenstra.length + kpiIndicators.length + rlsPlans.length}{' '}
            Indikator Terkait
          </span>
        </div>
        <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Penyelarasan Renstra, IKK & RLS
        </h3>
      </div>

      {/* Part 1: Renstra */}
      {groupedRenstra.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-muted-foreground uppercase">
            [1] Rencana Strategis (Renstra)
          </div>

          <div className="space-y-4 pl-3">
            {groupedRenstra.map((tujuan) => (
              <div
                key={tujuan.id}
                className="space-y-2 border-l-2 border-border/70 pl-4"
              >
                <div className="text-xs font-semibold text-foreground sm:text-sm">
                  Tujuan: {tujuan.name}
                </div>

                <div className="space-y-2">
                  {tujuan.sasarans.map((sasaran) => (
                    <div
                      key={sasaran.id}
                      className="space-y-1.5 text-xs sm:text-sm"
                    >
                      <div className="text-muted-foreground">
                        Sasaran: {sasaran.name}
                      </div>

                      {sasaran.indicators?.map((ind) => (
                        <div
                          key={ind.id}
                          className="flex items-baseline justify-between gap-2 pl-3 text-xs"
                        >
                          <span className="text-foreground">{ind.name}</span>
                          <span className="grow border-b border-dotted border-border/70" />
                          <span className="shrink-0 font-mono text-xs font-semibold text-primary">
                            {formatIndicatorTarget(ind)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Part 2: IKK */}
      {kpiIndicators.length > 0 && (
        <div className="space-y-4 border-t border-border/60 pt-6">
          <div className="text-xs font-bold text-muted-foreground uppercase">
            [2] Indikator Kinerja Kunci (IKK)
          </div>

          <div className="space-y-2.5 pl-3 text-xs sm:text-sm">
            {kpiIndicators.map((kpi) => (
              <div
                key={kpi.id}
                className="flex items-baseline justify-between gap-2 border-b border-border/40 pb-2"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">
                    {kpi.name}
                  </span>
                  {kpi.unit && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Satuan: {kpi.unit})
                    </span>
                  )}
                </div>
                <span className="grow border-b border-dotted border-border/70" />
                <span className="shrink-0 font-mono text-xs font-semibold text-primary">
                  {formatKpiTarget(kpi)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Part 3: RLS */}
      {rlsPlans.length > 0 && (
        <div className="space-y-4 border-t border-border/60 pt-6">
          <div className="text-xs font-bold text-muted-foreground uppercase">
            [3] Rencana Layanan Strategis (RLS)
          </div>

          <div className="space-y-2.5 pl-3 text-xs sm:text-sm">
            {rlsPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-baseline justify-between gap-2 border-b border-border/40 pb-2"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-foreground">
                    {plan.strategic_program}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {plan.service_plan}
                  </span>
                </div>
                <span className="grow border-b border-dotted border-border/70" />
                <span className="shrink-0 font-mono text-xs text-foreground">
                  TA {plan.year}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 2. Technical Matrix:
 * Dual-column matrix grouping with vertical guide lines.
 */
function MatrixStrategic({
  groupedRenstra,
  kpiIndicators,
  rlsPlans,
}: {
  groupedRenstra: (Tujuan & { sasarans: Sasaran[] })[];
  kpiIndicators: KpiIndicator[];
  rlsPlans: StrategicServicePlan[];
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-3">
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Matriks Penyelarasan Strategis & Layanan
        </h3>
        <p className="text-xs text-muted-foreground">
          Pemetaan keterkaitan tujuan Renstra, indikator IKK, dan program
          layanan strategis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column: Renstra Goals & Objectives */}
        <div className="space-y-4 border-l-2 border-border/80 pl-4">
          <div className="text-xs font-bold text-muted-foreground uppercase">
            Pilar Renstra Instansi
          </div>

          {groupedRenstra.map((tujuan) => (
            <div key={tujuan.id} className="space-y-2">
              <div className="text-xs font-bold text-foreground">
                Tujuan: {tujuan.name}
              </div>
              {tujuan.sasarans.map((sasaran) => (
                <div key={sasaran.id} className="space-y-1 pl-2 text-xs">
                  <div className="text-muted-foreground">
                    Sasaran: {sasaran.name}
                  </div>
                  {sasaran.indicators?.map((ind) => (
                    <div
                      key={ind.id}
                      className="flex items-center justify-between pl-2 text-xs text-foreground/90"
                    >
                      <span>- {ind.name}</span>
                      <span className="font-mono text-xs font-semibold text-primary">
                        {formatIndicatorTarget(ind)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right Column: IKK & RLS */}
        <div className="space-y-6 border-l-2 border-primary/70 pl-4">
          {kpiIndicators.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-primary uppercase">
                Indikator Kinerja Kunci (IKK)
              </div>
              {kpiIndicators.map((kpi) => (
                <div key={kpi.id} className="space-y-0.5 text-xs">
                  <div className="font-medium text-foreground">{kpi.name}</div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Satuan: {kpi.unit || '-'}</span>
                    <span className="font-mono text-xs text-primary">
                      {formatKpiTarget(kpi)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {rlsPlans.length > 0 && (
            <div className="space-y-3 border-t border-border/40 pt-4">
              <div className="text-xs font-bold text-muted-foreground uppercase">
                Rencana Layanan Strategis (RLS)
              </div>
              {rlsPlans.map((plan) => (
                <div key={plan.id} className="space-y-0.5 text-xs">
                  <div className="font-medium text-foreground">
                    {plan.strategic_program}
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{plan.service_plan}</span>
                    <span className="font-mono text-xs">TA {plan.year}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Industrial Datasheet:
 * Clean horizontal technical strips, high contrast.
 */
function DatasheetStrategic({
  groupedRenstra,
  kpiIndicators,
  rlsPlans,
}: {
  groupedRenstra: (Tujuan & { sasarans: Sasaran[] })[];
  kpiIndicators: KpiIndicator[];
  rlsPlans: StrategicServicePlan[];
}) {
  return (
    <div className="space-y-6">
      <div className="border-b-2 border-foreground/80 pb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase">
          Lembar Spesifikasi Kinerja Terpadu
        </span>
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Renstra, IKK & RLS
        </h3>
      </div>

      <div className="divide-y divide-border/60">
        {/* Renstra rows */}
        {groupedRenstra.map((tujuan) => (
          <div key={tujuan.id} className="py-3 text-xs sm:text-sm">
            <div className="font-semibold text-foreground">
              [Renstra] Tujuan: {tujuan.name}
            </div>
            <div className="mt-2 space-y-1.5 pl-4">
              {tujuan.sasarans.map((sasaran) => (
                <div key={sasaran.id}>
                  <div className="text-muted-foreground">
                    Sasaran: {sasaran.name}
                  </div>
                  {sasaran.indicators?.map((ind) => (
                    <div
                      key={ind.id}
                      className="flex items-baseline justify-between gap-4 pt-0.5 pl-3 text-xs"
                    >
                      <span className="text-foreground">{ind.name}</span>
                      <span className="font-mono text-xs font-medium text-primary">
                        {formatIndicatorTarget(ind)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* IKK rows */}
        {kpiIndicators.map((kpi) => (
          <div
            key={kpi.id}
            className="flex items-baseline justify-between gap-4 py-3 text-xs sm:text-sm"
          >
            <div>
              <span className="font-semibold text-foreground">
                [IKK] {kpi.name}
              </span>
              {kpi.unit && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (Satuan: {kpi.unit})
                </span>
              )}
            </div>
            <span className="font-mono text-xs font-medium text-primary">
              {formatKpiTarget(kpi)}
            </span>
          </div>
        ))}

        {/* RLS rows */}
        {rlsPlans.map((plan) => (
          <div
            key={plan.id}
            className="flex items-baseline justify-between gap-4 py-3 text-xs sm:text-sm"
          >
            <div>
              <span className="font-semibold text-foreground">
                [RLS] {plan.strategic_program}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {plan.service_plan}
              </span>
            </div>
            <span className="font-mono text-xs text-foreground">
              TA {plan.year}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 4. Parametric Table:
 * Open tabular spec without box cards.
 */
function ParametricStrategic({
  groupedRenstra,
  kpiIndicators,
  rlsPlans,
}: {
  groupedRenstra: (Tujuan & { sasarans: Sasaran[] })[];
  kpiIndicators: KpiIndicator[];
  rlsPlans: StrategicServicePlan[];
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-3">
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Tabel Spesifikasi Keselarasan Kinerja
        </h3>
        <p className="text-xs text-muted-foreground">
          Rincian parameter sasaran strategis, indikator capaian, dan rencana
          layanan.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border/80 text-muted-foreground">
              <th className="py-2.5 font-semibold">Tipe Pilar</th>
              <th className="py-2.5 font-semibold">
                Nomenklatur Indikator / Program
              </th>
              <th className="py-2.5 text-right font-semibold">
                Target Capaian
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {/* Renstra Items */}
            {groupedRenstra.flatMap((tujuan) =>
              tujuan.sasarans.flatMap((sasaran) =>
                (sasaran.indicators || []).map((ind) => (
                  <tr
                    key={`ind-${ind.id}`}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="py-2.5 font-medium text-muted-foreground">
                      Renstra
                    </td>
                    <td className="py-2.5">
                      <div className="font-medium text-foreground">
                        {ind.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Sasaran: {sasaran.name}
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs font-semibold text-primary">
                      {formatIndicatorTarget(ind)}
                    </td>
                  </tr>
                )),
              ),
            )}

            {/* IKK Items */}
            {kpiIndicators.map((kpi) => (
              <tr
                key={`kpi-${kpi.id}`}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="py-2.5 font-medium text-muted-foreground">
                  IKK
                </td>
                <td className="py-2.5">
                  <div className="font-medium text-foreground">{kpi.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Satuan: {kpi.unit || '-'}
                  </div>
                </td>
                <td className="py-2.5 text-right font-mono text-xs font-semibold text-primary">
                  {formatKpiTarget(kpi)}
                </td>
              </tr>
            ))}

            {/* RLS Items */}
            {rlsPlans.map((plan) => (
              <tr
                key={`rls-${plan.id}`}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="py-2.5 font-medium text-muted-foreground">
                  RLS
                </td>
                <td className="py-2.5">
                  <div className="font-medium text-foreground">
                    {plan.strategic_program}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {plan.service_plan}
                  </div>
                </td>
                <td className="py-2.5 text-right font-mono text-xs text-foreground">
                  TA {plan.year}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 5. Hierarchy Tree:
 * Structural breakdown linking Renstra, IKK, and RLS.
 */
function TreeStrategic({
  groupedRenstra,
  kpiIndicators,
  rlsPlans,
}: {
  groupedRenstra: (Tujuan & { sasarans: Sasaran[] })[];
  kpiIndicators: KpiIndicator[];
  rlsPlans: StrategicServicePlan[];
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-3">
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Hierarki Keselarasan Kinerja Organisasi
        </h3>
        <p className="text-xs text-muted-foreground">
          Pohon hubungan keterkaitan tujuan strategis hingga indikator
          operasional.
        </p>
      </div>

      <div className="space-y-6 pl-2">
        {/* Branch 1: Renstra */}
        {groupedRenstra.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-foreground">
              [Pilar A] Sasaran Strategis Renstra
            </div>

            <div className="space-y-3 border-l-2 border-border/70 pl-6 text-xs sm:text-sm">
              {groupedRenstra.map((tujuan) => (
                <div key={tujuan.id} className="space-y-1">
                  <div className="font-semibold text-foreground">
                    {tujuan.name}
                  </div>
                  {tujuan.sasarans.map((sasaran) => (
                    <div key={sasaran.id} className="pl-3 text-xs">
                      <div className="text-muted-foreground">
                        {sasaran.name}
                      </div>
                      {sasaran.indicators?.map((ind) => (
                        <div
                          key={ind.id}
                          className="flex justify-between pt-0.5 pl-3 text-foreground/90"
                        >
                          <span>- {ind.name}</span>
                          <span className="font-mono text-xs font-semibold text-primary">
                            {formatIndicatorTarget(ind)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Branch 2: IKK */}
        {kpiIndicators.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-primary">
              [Pilar B] Indikator Kinerja Kunci (IKK)
            </div>

            <div className="space-y-2 border-l-2 border-primary/70 pl-6 text-xs sm:text-sm">
              {kpiIndicators.map((kpi) => (
                <div
                  key={kpi.id}
                  className="flex justify-between gap-4 text-xs"
                >
                  <span className="text-foreground">{kpi.name}</span>
                  <span className="font-mono text-xs font-semibold text-primary">
                    {formatKpiTarget(kpi)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Branch 3: RLS */}
        {rlsPlans.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-muted-foreground">
              [Pilar C] Rencana Layanan Strategis (RLS)
            </div>

            <div className="space-y-2 border-l-2 border-border/70 pl-6 text-xs sm:text-sm">
              {rlsPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex justify-between gap-4 text-xs"
                >
                  <span className="text-foreground">
                    {plan.strategic_program}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    TA {plan.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatIndicatorTarget(ind: {
  baseline?: string | null;
  targets?: { id: number; year: number; target: string }[];
}): string {
  if (ind.targets && ind.targets.length > 0) {
    return ind.targets.map((t) => `T${t.year}: ${t.target}`).join(', ');
  }

  return ind.baseline ? `Baseline: ${ind.baseline}` : '-';
}

function formatKpiTarget(kpi: KpiIndicator): string {
  if (kpi.annual_targets && kpi.annual_targets.length > 0) {
    const targets = kpi.annual_targets
      .filter((t) => t.target_value)
      .map((t) => `T${t.year}: ${t.target_value}`);

    if (targets.length > 0) {
      return targets.join(', ');
    }
  }

  return kpi.baseline_value ? `Baseline: ${kpi.baseline_value}` : '-';
}
