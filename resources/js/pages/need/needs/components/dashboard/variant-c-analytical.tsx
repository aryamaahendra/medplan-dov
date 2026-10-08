import { Link } from '@inertiajs/react';
import {
  RiFilterLine,
  RiPieChartLine,
  RiMoneyDollarCircleLine,
  RiTargetLine,
  RiShieldCheckLine,
  RiBuildingLine,
  RiCloseLine,
} from '@remixicon/react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { NeedsDashboardPayload } from '@/types/needs-dashboard';

interface VariantCProps {
  payload: NeedsDashboardPayload;
  defaultTab?: string;
}

export function VariantCAnalytical({
  payload,
  defaultTab = 'overview',
}: VariantCProps) {
  const {
    currentGroup,
    stats,
    stageDistribution,
    needsByUnit,
    needsByType,
    sasaranOverview,
    fundingSources,
    checklistBuckets,
    myUnitData,
  } = payload;
  const groupId = currentGroup?.id;

  // Global slice filter state
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Filter chips helper
  const activeChips = [
    selectedUnitId && {
      type: 'unit',
      label:
        needsByUnit.find((u) => u.unit_id === selectedUnitId)?.name ||
        'Unit Kerja',
      onClear: () => setSelectedUnitId(null),
    },
    selectedTypeId && {
      type: 'type',
      label:
        needsByType.find((t) => t.type_id === selectedTypeId)?.name ||
        'Kategori',
      onClear: () => setSelectedTypeId(null),
    },
    selectedStage && {
      type: 'stage',
      label: `Tahap: ${selectedStage}`,
      onClear: () => setSelectedStage(null),
    },
  ].filter(Boolean) as Array<{
    type: string;
    label: string;
    onClear: () => void;
  }>;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Global Slice Bar & Active Filter Chips */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <RiFilterLine className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Multi-Dimensional Slice Bar
            </span>
            <span className="text-xs text-muted-foreground">
              (Cross-filter data antardimensi)
            </span>
          </div>

          {activeChips.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedUnitId(null);
                setSelectedTypeId(null);
                setSelectedStage(null);
              }}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Reset Filter
            </Button>
          )}
        </div>

        {/* Slice Dropdowns / Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unit selector pill */}
          <select
            value={selectedUnitId ?? ''}
            onChange={(e) =>
              setSelectedUnitId(e.target.value ? Number(e.target.value) : null)
            }
            className="h-8 rounded-md border border-border/80 bg-card px-2.5 text-xs text-foreground outline-hidden focus:border-ring"
          >
            <option value="">Semua Unit Kerja</option>
            {needsByUnit.map((unit) => (
              <option
                key={unit.unit_id ?? unit.name}
                value={unit.unit_id ?? ''}
              >
                {unit.name} ({unit.count})
              </option>
            ))}
          </select>

          {/* Type selector pill */}
          <select
            value={selectedTypeId ?? ''}
            onChange={(e) =>
              setSelectedTypeId(e.target.value ? Number(e.target.value) : null)
            }
            className="h-8 rounded-md border border-border/80 bg-card px-2.5 text-xs text-foreground outline-hidden focus:border-ring"
          >
            <option value="">Semua Kategori Kebutuhan</option>
            {needsByType.map((t) => (
              <option key={t.type_id} value={t.type_id}>
                {t.name} ({t.count})
              </option>
            ))}
          </select>

          {/* Stage selector pill */}
          <select
            value={selectedStage ?? ''}
            onChange={(e) => setSelectedStage(e.target.value || null)}
            className="h-8 rounded-md border border-border/80 bg-card px-2.5 text-xs text-foreground outline-hidden focus:border-ring"
          >
            <option value="">Semua Tahapan</option>
            <option value="draft">
              Draft ({stageDistribution.draft.count})
            </option>
            <option value="under_review">
              Menunggu Review ({stageDistribution.under_review.count})
            </option>
            <option value="approved">
              Disetujui ({stageDistribution.approved.count})
            </option>
            <option value="rejected">
              Ditolak ({stageDistribution.rejected.count})
            </option>
          </select>
        </div>

        {/* Active Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-1">
            <span className="text-[11px] text-muted-foreground">
              Filter aktif:
            </span>
            {activeChips.map((chip) => (
              <Badge
                key={chip.label}
                variant="secondary"
                className="gap-1 px-2 py-0.5 text-xs font-normal"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onClear}
                  className="rounded-full p-0.5 hover:bg-muted"
                >
                  <RiCloseLine className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 2. Analytical Workspace Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto border-b border-border/70 bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="gap-1.5 data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <RiPieChartLine className="size-3.5" />
            Ringkasan
          </TabsTrigger>
          <TabsTrigger
            value="budget"
            className="gap-1.5 data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <RiMoneyDollarCircleLine className="size-3.5" />
            Alokasi Anggaran
          </TabsTrigger>
          <TabsTrigger
            value="alignment"
            className="gap-1.5 data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <RiTargetLine className="size-3.5" />
            Penyelarasan Renstra
          </TabsTrigger>
          <TabsTrigger
            value="quality"
            className="gap-1.5 data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <RiShieldCheckLine className="size-3.5" />
            Kualitas & Checklist
          </TabsTrigger>
          {myUnitData && (
            <TabsTrigger
              value="myunit"
              className="gap-1.5 data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <RiBuildingLine className="size-3.5" />
              Unit Saya ({myUnitData.name})
            </TabsTrigger>
          )}
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="flex flex-col gap-6 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/70 p-4">
              <span className="text-xs text-muted-foreground">
                TOTAL KEBUTUHAN
              </span>
              <div className="mt-1 font-mono text-2xl font-bold">
                {formatNumber(stats.total_needs)}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Estimasi belanja {formatCompactIDR(stats.total_budget)}
              </p>
            </Card>
            <Card className="border-border/70 p-4">
              <span className="text-xs text-muted-foreground">
                DISETUJUI DIREKTUR
              </span>
              <div className="mt-1 font-mono text-2xl font-bold text-emerald-600">
                {formatNumber(stats.approved_by_director)}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {formatCompactIDR(stats.approved_budget)} anggaran terkunci
              </p>
            </Card>
            <Card className="border-border/70 p-4">
              <span className="text-xs text-muted-foreground">
                AWAITING REVIEW
              </span>
              <div className="mt-1 font-mono text-2xl font-bold text-amber-600">
                {formatNumber(stats.awaiting_director)}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {formatCompactIDR(stats.awaiting_director_budget)} butuh telaah
              </p>
            </Card>
            <Card className="border-border/70 p-4">
              <span className="text-xs text-muted-foreground">
                PRIORITAS TINGGI
              </span>
              <div className="mt-1 font-mono text-2xl font-bold text-orange-600">
                {formatNumber(stats.priority_needs)}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Urgensi & Dampak Tinggi
              </p>
            </Card>
          </div>

          {/* Quick distributions */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/70 p-5">
              <CardTitle className="mb-3 text-sm font-semibold">
                Distribusi per Tahapan Siklus
              </CardTitle>
              <div className="flex flex-col gap-2.5">
                {Object.entries(stageDistribution).map(([key, item]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="capitalize">
                        {key === 'under_review' ? 'Menunggu Review' : key}
                      </span>
                      <span>
                        {item.count} item - {formatCompactIDR(item.budget)} (
                        {item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                      <div
                        style={{ width: `${Math.max(item.percentage, 3)}%` }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border/70 p-5">
              <CardTitle className="mb-3 text-sm font-semibold">
                Distribusi Kategori Utama
              </CardTitle>
              <div className="flex flex-col gap-2.5">
                {needsByType.slice(0, 5).map((type) => (
                  <div key={type.type_id} className="flex flex-col gap-1">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="max-w-[60%] truncate">{type.name}</span>
                      <span>
                        {type.count} item -{' '}
                        {formatCompactIDR(type.total_budget)} ({type.percentage}
                        %)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                      <div
                        style={{ width: `${Math.max(type.percentage, 3)}%` }}
                        className="h-full rounded-full bg-blue-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: BUDGET & FUNDING SOURCES */}
        <TabsContent value="budget" className="flex flex-col gap-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Budget by Funding Source (5 cols) */}
            <Card className="border-border/70 p-5 lg:col-span-5">
              <CardTitle className="mb-1 text-sm font-semibold">
                Sumber Pendanaan (Funding Sources)
              </CardTitle>
              <p className="mb-4 text-xs text-muted-foreground">
                Pengelompokan anggaran berdasarkan alokasi dana
              </p>
              {fundingSources.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Belum ada rincian sumber dana terhubung.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {fundingSources.map((fs) => (
                    <div key={fs.name} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-foreground">
                          {fs.name}
                        </span>
                        <span className="font-mono">
                          {formatCompactIDR(fs.total_budget)} ({fs.needs_count}{' '}
                          usulan)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                        <div
                          style={{
                            width: `${Math.max(stats.total_budget > 0 ? (fs.total_budget / stats.total_budget) * 100 : 0, 4)}%`,
                          }}
                          className="h-full rounded-full bg-emerald-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Unit Budget Ranking (7 cols) */}
            <Card className="border-border/70 p-5 lg:col-span-7">
              <CardTitle className="mb-1 text-sm font-semibold">
                Alokasi Anggaran Tiap Unit Kerja
              </CardTitle>
              <p className="mb-4 text-xs text-muted-foreground">
                Urutan unit pemohon anggaran terbesar
              </p>
              <div className="flex max-h-[350px] flex-col gap-2.5 overflow-y-auto pr-1">
                {needsByUnit.map((unit) => (
                  <Link
                    key={unit.unit_id ?? unit.name}
                    href={needRoutes.index.url({
                      query: {
                        need_group_id: groupId,
                        ...(unit.unit_id
                          ? {
                              organizational_unit_id: [unit.unit_id.toString()],
                            }
                          : {}),
                      },
                    })}
                    className="flex items-center justify-between rounded-md p-2 text-xs transition-colors hover:bg-accent/40"
                  >
                    <span className="max-w-[55%] truncate font-medium text-foreground">
                      {unit.name}
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-muted-foreground">
                        {unit.count} usulan
                      </span>
                      <span className="font-semibold">
                        {formatCompactIDR(unit.total_budget)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: STRATEGIC ALIGNMENT (RENSTRA) */}
        <TabsContent value="alignment" className="flex flex-col gap-6 pt-4">
          <Card className="border-border/70 p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Penyelarasan Sasaran Strategis (Renstra)
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Distribusi usulan kebutuhan yang mendukung capaian sasaran
                  strategis rumah sakit
                </p>
              </div>
              <Badge variant="outline" className="w-fit font-mono text-xs">
                {sasaranOverview.length} Sasaran Terdaftar
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sasaranOverview.map((sasaran) => {
                const hasNeeds = sasaran.needs_count > 0;

                return (
                  <div
                    key={sasaran.id}
                    className={cn(
                      'flex flex-col justify-between rounded-lg border p-3 text-xs transition-colors',
                      hasNeeds
                        ? 'border-border/80 bg-card'
                        : 'border-dashed border-border/60 bg-muted/10 opacity-70',
                    )}
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        {sasaran.tujuan_name}
                      </span>
                      <h4 className="mt-1 line-clamp-2 font-medium text-foreground">
                        {sasaran.name}
                      </h4>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 font-mono">
                      <span className="text-muted-foreground">
                        Usulan terkait:
                      </span>
                      <span
                        className={cn(
                          'font-semibold',
                          hasNeeds ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        {sasaran.needs_count} item
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 4: QUALITY & CHECKLIST SCORES */}
        <TabsContent value="quality" className="flex flex-col gap-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/70 p-5">
              <CardTitle className="mb-1 text-sm font-semibold">
                Sebaran Skor Checklist (Histogram)
              </CardTitle>
              <p className="mb-4 text-xs text-muted-foreground">
                Tingkat kepatuhan checklist pertanyaan per usulan
              </p>
              <div className="flex flex-col gap-3">
                {Object.entries(checklistBuckets).map(([bucket, count]) => {
                  const pct =
                    stats.total_needs > 0
                      ? Math.round((count / stats.total_needs) * 100)
                      : 0;

                  return (
                    <div key={bucket} className="flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-xs">
                        <span>Skor {bucket}%</span>
                        <span>
                          {count} usulan ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                        <div
                          style={{ width: `${Math.max(pct, 2)}%` }}
                          className="h-full rounded-full bg-emerald-600"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="border-border/70 p-5">
              <CardTitle className="mb-1 text-sm font-semibold">
                Rangkuman Kepatuhan Administrasi
              </CardTitle>
              <p className="mb-4 text-xs text-muted-foreground">
                Indikator kelayakan untuk masuk tahapan verifikasi
              </p>
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between border-b border-border/50 py-2">
                  <span className="text-muted-foreground">
                    Rata-rata Skor Checklist:
                  </span>
                  <span className="font-mono font-bold">
                    {Math.round(stats.avg_completeness)}%
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 py-2">
                  <span className="text-muted-foreground">
                    Usulan Siap Telaah (Skor &gt;= 85%):
                  </span>
                  <Link
                    href={needRoutes.index.url({
                      query: {
                        need_group_id: groupId,
                        min_checklist_score: ['85'],
                      },
                    })}
                    className="font-mono font-bold text-primary hover:underline"
                  >
                    Buka Filter &rarr;
                  </Link>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 py-2">
                  <span className="text-muted-foreground">
                    Usulan Terkunci:
                  </span>
                  <span className="font-mono font-bold">
                    {stats.locked_count} item
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 5: MY UNIT (Role-aware default for unit heads / staff) */}
        {myUnitData && (
          <TabsContent value="myunit" className="flex flex-col gap-6 pt-4">
            <Card className="border-border/70 p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Ringkasan Unit: {myUnitData.name}
                  </CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Data khusus pengajuan usulan unit kerja Anda dalam siklus
                    ini
                  </p>
                </div>
                <Link
                  href={needRoutes.index.url({
                    query: {
                      need_group_id: groupId,
                      organizational_unit_id: [myUnitData.unit_id.toString()],
                    },
                  })}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Buka Daftar Usulan Unit Saya &rarr;
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/70 p-3">
                  <span className="text-[11px] text-muted-foreground">
                    TOTAL USULAN
                  </span>
                  <div className="mt-1 font-mono text-xl font-bold">
                    {myUnitData.total_needs}
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formatCompactIDR(myUnitData.total_budget)}
                  </span>
                </div>
                <div className="rounded-lg border border-border/70 p-3">
                  <span className="text-[11px] text-muted-foreground">
                    DISETUJUI DIREKTUR
                  </span>
                  <div className="mt-1 font-mono text-xl font-bold text-emerald-600">
                    {myUnitData.approved_count}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Sudah final
                  </span>
                </div>
                <div className="rounded-lg border border-border/70 p-3">
                  <span className="text-[11px] text-muted-foreground">
                    MENUNGGU REVIEW
                  </span>
                  <div className="mt-1 font-mono text-xl font-bold text-amber-600">
                    {myUnitData.under_review_count}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Dalam proses verifikasi
                  </span>
                </div>
                <div className="rounded-lg border border-border/70 p-3">
                  <span className="text-[11px] text-muted-foreground">
                    DITOLAK / REVISI
                  </span>
                  <div className="mt-1 font-mono text-xl font-bold text-destructive">
                    {myUnitData.rejected_count}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Perlu diperbaiki
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
