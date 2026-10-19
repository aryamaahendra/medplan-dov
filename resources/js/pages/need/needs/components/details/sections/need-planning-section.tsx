import type { Need } from '@/types';

interface NeedPlanningSectionProps {
  need: Need;
}

export function NeedPlanningSection({ need }: NeedPlanningSectionProps) {
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
                        className="pl-2 text-xs text-muted-foreground"
                      >
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
