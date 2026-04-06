import { Head, Link } from '@inertiajs/react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  ChevronRight,
  ClipboardList,
  Edit,
  Layers,
  LayoutDashboard,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';

import { PriorityBadge } from '@/components/priority-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import needRoutes from '@/routes/needs';

import {
  formatCurrency,
  STATUS_ICONS,
  STATUS_LABELS,
  STATUS_VARIANTS,
} from './columns';
import type { Need, Sasaran, Tujuan } from './columns';
import { TujuanAlignmentCard } from './components/tujuan-alignment-card';

interface NeedShowProps {
  need: Need;
}

export default function NeedShow({ need }: NeedShowProps) {
  const groupedRenstra = useMemo(() => {
    if (!need.sasarans) {
      return [];
    }

    const tujuanMap = new Map<number, Tujuan & { sasarans: Sasaran[] }>();

    need.sasarans.forEach((sasaran) => {
      const tujuan = sasaran.tujuan;

      if (!tujuan) {
        return;
      }

      if (!tujuanMap.has(tujuan.id)) {
        tujuanMap.set(tujuan.id, { ...tujuan, sasarans: [] });
      }

      const indicators =
        need.indicators?.filter((i) => i.sasaran_id === sasaran.id) ?? [];

      tujuanMap.get(tujuan.id)?.sasarans.push({
        ...sasaran,
        indicators,
      });
    });

    return Array.from(tujuanMap.values());
  }, [need]);

  const StatusIcon = STATUS_ICONS[need.status];

  return (
    <>
      <Head title={`Detail Usulan: ${need.title}`} />

      <div className="flex flex-col gap-8 p-4 md:p-8">
        {/* Header & Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href={needRoutes.index.url()}
                className="hover:text-foreground"
              >
                Usulan Kebutuhan
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Detail Usulan</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {need.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href={needRoutes.index.url()}>
                <ArrowLeft className="mr-2" />
                Kembali
              </Link>
            </Button>
            <Button asChild>
              <Link href={needRoutes.edit.url({ need: need.id })}>
                <Edit className="mr-2" />
                Edit Usulan
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Status & Priority Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="bg-muted/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background ring-1 ring-border">
                    <StatusIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge
                      variant={STATUS_VARIANTS[need.status]}
                      className="mt-0.5 whitespace-nowrap capitalize"
                    >
                      {STATUS_LABELS[need.status]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background ring-1 ring-border">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Urgensi</p>
                    <div className="mt-0.5">
                      <PriorityBadge level={need.urgency} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background ring-1 ring-border">
                    <Target className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dampak</p>
                    <div className="mt-0.5">
                      <PriorityBadge level={need.impact} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* General Info Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Umum</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Unit Kerja
                  </p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {need.organizational_unit?.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Tahun Anggaran
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-mono text-sm font-medium">{need.year}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Jenis Kebutuhan
                  </p>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {need.need_type?.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Volume & Satuan
                  </p>
                  <p className="text-sm font-medium">
                    {Number(need.volume).toLocaleString('id-ID')} {need.unit}
                  </p>
                </div>

                <Separator className="sm:col-span-2" />

                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Harga Satuan
                  </p>
                  <p className="font-mono text-sm font-medium text-muted-foreground">
                    {formatCurrency(need.unit_price)}
                  </p>
                </div>

                <div className="-m-2 space-y-1 rounded-md bg-primary/5 p-2 ring-1 ring-primary/10">
                  <p className="text-xs font-medium tracking-wider text-primary/70 uppercase">
                    Total Kebutuhan Biaya
                  </p>
                  <p className="font-mono text-lg font-bold text-primary">
                    {formatCurrency(need.total_price)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Context & Conditions */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                    Kondisi Saat Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm/relaxed whitespace-pre-wrap">
                    {need.current_condition || (
                      <span className="text-muted-foreground/60 italic">
                        Tidak ada data
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                    Kebutuhan Kondisi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm/relaxed whitespace-pre-wrap">
                    {need.required_condition || (
                      <span className="text-muted-foreground/60 italic">
                        Tidak ada data
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="sm:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                    Deskripsi / Justifikasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm/relaxed whitespace-pre-wrap">
                    {need.description || (
                      <span className="text-muted-foreground/60 italic">
                        Tidak ada deskripsi
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Strategic Alignment - Table Style */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">
                  Penyelarasan Strategis
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Keterkaitan usulan dengan Rencana Strategis (Renstra) melalui
                Tujuan, Sasaran, dan Indikator Kinerja.
              </p>

              {groupedRenstra.length > 0 ? (
                <div className="space-y-4">
                  {groupedRenstra.map((tujuan) => (
                    <TujuanAlignmentCard key={tujuan.id} tujuan={tujuan} />
                  ))}
                </div>
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

          {/* Sidebar Components */}
          <div className="space-y-8">
            {/* KPI Alignment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-primary" />
                  Indikator KPI
                </CardTitle>
                <CardDescription>
                  Hubungan dengan indikator utama organisasi.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {need.kpi_indicators && need.kpi_indicators.length > 0 ? (
                  <div className="divide-y border-t bg-muted/10">
                    {need.kpi_indicators.map((kpi) => (
                      <div key={kpi.id} className="p-4">
                        <p className="text-sm leading-tight font-medium text-foreground">
                          {kpi.name}
                        </p>
                        {kpi.unit && (
                          <Badge
                            variant="secondary"
                            className="mt-2 h-5 text-[10px]"
                          >
                            Unit: {kpi.unit}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-t p-6 text-center">
                    <p className="text-xs text-muted-foreground italic">
                      Tidak ada KPI terpilih.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Strategic Programs */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Program Strategis
                </CardTitle>
                <CardDescription>
                  Kaitan dengan rencana layanan dan program strategis.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {need.strategic_service_plans &&
                need.strategic_service_plans.length > 0 ? (
                  <div className="divide-y border-t bg-muted/10">
                    {need.strategic_service_plans.map((plan) => (
                      <div key={plan.id} className="space-y-2 p-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Program
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {plan.strategic_program}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Rencana Layanan
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {plan.service_plan}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-t p-6 text-center">
                    <p className="text-xs text-muted-foreground italic">
                      Tidak ada program strategis terpilih.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

NeedShow.layout = {
  breadcrumbs: [
    {
      title: 'Usulan Kebutuhan',
      href: needRoutes.index.url(),
    },
    {
      title: 'Detail Usulan',
    },
  ],
};
