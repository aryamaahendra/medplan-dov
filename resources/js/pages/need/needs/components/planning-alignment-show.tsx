import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Need } from '@/types';

interface PlanningAlignmentShowProps {
  need: Need;
}

export function PlanningAlignmentShow({ need }: PlanningAlignmentShowProps) {
  const selectedVersions = need.planning_activity_versions || [];
  const selectedIndicators = need.planning_activity_indicators || [];

  if (selectedVersions.length === 0 && selectedIndicators.length === 0) {
    return (
      <div className="mt-6 flex h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        Belum ada keselarasan perencanaan yang dipilih.
      </div>
    );
  }

  // Filter only subkegiatans for a cleaner display?
  // Or show everything hierarchically? Let's show everything grouped by type.

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
            <CardHeader className="py-3">
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

                  {/* Show indicators for this version if selected */}
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
