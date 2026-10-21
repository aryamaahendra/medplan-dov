import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NeedIkkTable } from '@/pages/need/needs/components/details/need-ikk-table';
import { NeedRenstraTable } from '@/pages/need/needs/components/details/need-renstra-table';
import type { Need } from '@/types';
import { groupRenstraSasaransByTujuan } from './strategic-alignment-engine';
import type { AlignmentFramework } from './strategic-alignment-engine';

export interface StrategicAlignmentViewerProps {
  framework: AlignmentFramework;
  need: Need;
}

export function StrategicAlignmentViewer({
  framework,
  need,
}: StrategicAlignmentViewerProps) {
  switch (framework) {
    case 'renstra':
      return <RenstraAlignmentViewer need={need} />;
    case 'ikk':
      return <IkkAlignmentViewer need={need} />;
    case 'rls':
      return <RlsAlignmentViewer need={need} />;
    case 'planning':
      return <PlanningAlignmentViewer need={need} />;
  }
}

// ---------------------------------------------------------------------------
// 1. Renstra Viewer
// ---------------------------------------------------------------------------

function RenstraAlignmentViewer({ need }: { need: Need }) {
  const groupedRenstra = useMemo(
    () => groupRenstraSasaransByTujuan(need.sasarans),
    [need.sasarans],
  );

  return (
    <div className="pt-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Penyelarasan Strategis</h2>
        <p className="text-sm text-muted-foreground">
          Keterkaitan usulan dengan Rencana Strategis (Renstra) melalui Tujuan,
          Sasaran, dan Indikator Kinerja.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {groupedRenstra.length > 0 ? (
          <NeedRenstraTable
            groupedRenstra={groupedRenstra}
            needYear={need.year}
          />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground italic">
                Belum ada penyelarasan strategis yang dipilih.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. IKK Viewer
// ---------------------------------------------------------------------------

function IkkAlignmentViewer({ need }: { need: Need }) {
  const kpis = need.kpi_indicators || [];

  return (
    <div className="pt-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Penyelarasan KPI (IKK)</h2>
        <p className="text-sm text-muted-foreground">
          Hubungan usulan dengan Indikator Kinerja Kunci (IKK) organisasi.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {kpis.length > 0 ? (
          <NeedIkkTable kpiIndicators={kpis} needYear={need.year} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground italic">
                Belum ada Indikator Kinerja Kunci (IKK) yang dipilih.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. RLS Viewer
// ---------------------------------------------------------------------------

function RlsAlignmentViewer({ need }: { need: Need }) {
  const plans = need.strategic_service_plans || [];

  return (
    <div className="pt-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">
          Rencana Layanan Strategis (RLS)
        </h2>
        <p className="text-sm text-muted-foreground">
          Kaitan usulan dengan rencana layanan dan program strategis organisasi.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {plans.length > 0 ? (
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="gap-0 p-0">
                <div className="border-b bg-muted/30 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium tracking-wide">
                      Program: {plan.strategic_program}
                    </span>
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y bg-background">
                    <RlsInfoItem label="Tahun" value={plan.year} />
                    <RlsInfoItem
                      label="Rencana Layanan"
                      value={plan.service_plan}
                    />
                    <RlsInfoItem label="Target" value={plan.target} />
                    <RlsInfoItem
                      label="Arah Kebijakan"
                      value={plan.policy_direction}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground italic">
                Belum ada Rencana Layanan Strategis (RLS) yang dipilih.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function RlsInfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 px-4 py-3 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-foreground">
        {value || (
          <span className="text-muted-foreground/50 italic">
            Tidak ada data
          </span>
        )}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Planning Viewer
// ---------------------------------------------------------------------------

function PlanningAlignmentViewer({ need }: { need: Need }) {
  const selectedVersions = need.planning_activity_versions || [];
  const selectedIndicators = need.planning_activity_indicators || [];

  if (selectedVersions.length === 0 && selectedIndicators.length === 0) {
    return (
      <div className="mt-6 flex h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        Belum ada keselarasan perencanaan yang dipilih.
      </div>
    );
  }

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
    <div className="mt-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Keselarasan Perencanaan</h2>
        <p className="text-sm text-muted-foreground">
          Informasi keselarasan usulan dengan program dan kegiatan pembangunan.
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(groupedVersions).map(([type, versions]) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                {type}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {versions.map((v) => (
                <div key={v.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5 shrink-0">
                      {v.code || '-'}
                    </Badge>
                    <span className="text-sm font-medium">{v.name}</span>
                  </div>

                  {selectedIndicators.filter(
                    (i) => i.planning_activity_version_id === v.id,
                  ).length > 0 && (
                    <div className="ml-7 space-y-1">
                      {selectedIndicators
                        .filter((i) => i.planning_activity_version_id === v.id)
                        .map((i) => (
                          <div
                            key={i.id}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                            <span>Indikator: {i.name}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
