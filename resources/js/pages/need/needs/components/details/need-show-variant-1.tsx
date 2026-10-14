import { Link } from '@inertiajs/react';
import {
  RiAlertLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiAttachmentLine,
  RiBarChartLine,
  RiBriefcaseLine,
  RiCalendarLine,
  RiCheckLine,
  RiCompass3Line,
  RiEdit2Line,
  RiFileDownloadLine,
  RiFileTextLine,
  RiFireLine,
  RiInformationLine,
  RiLockLine,
  RiLockUnlockLine,
  RiQuillPenLine,
} from '@remixicon/react';
import { useMemo, useState } from 'react';

import {
  DirectorReviewBadge,
  PriorityBadge,
  ProposalStatusBadge,
  ReadinessBadge,
  UrgencyImpactBadge,
} from '@/components/badges';
import { ChecklistForm } from '@/components/needs/checklist-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermission } from '@/hooks/use-permission';
import { formatDate, formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type {
  ChecklistAnswer,
  ChecklistQuestion,
  Need,
  Sasaran,
  Tujuan,
} from '@/types';

import { ExportPdfDialog } from '../export-pdf-dialog';
import { IkkAlignmentShow } from '../ikk-alignment-show';
import { NeedAttachmentsTab } from '../need-attachments-tab';
import { NeedDetailView } from '../need-detail-view';
import { NeedDirectorReviewDialog } from '../need-director-review-dialog';
import { NeedGeneralInfo } from '../need-general-info';
import { NeedLockBanner } from '../need-lock-banner';
import { NeedLockDialog } from '../need-lock-dialog';
import { PlanningAlignmentShow } from '../planning-alignment-show';
import { RlsAlignmentShow } from '../rls-alignment-show';
import { StrategicAlignmentSection } from '../strategic-alignment-section';

export interface NeedShowVariantProps {
  need: Need;
  checklistQuestions: { data: ChecklistQuestion[] };
  existingAnswers: { data: ChecklistAnswer[] };
  users: { id: number; name: string; nip: string | null }[];
}

export function NeedShowVariant1({
  need,
  checklistQuestions,
  existingAnswers,
  users,
}: NeedShowVariantProps) {
  const { hasPermission } = usePermission();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [lockModalMode, setLockModalMode] = useState<'lock' | 'unlock'>('lock');
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);

  const isLocked = !!need.is_locked;
  const canManageLock =
    hasPermission('lock need') || hasPermission('unlock need');
  const canReviewDirector =
    hasPermission('review need director') && need.status === 'approved';
  const checklistAnswers = useMemo(
    () => existingAnswers?.data ?? [],
    [existingAnswers?.data],
  );

  const groupedRenstra = useMemo(() => {
    if (!need.sasarans) {
      return [];
    }

    const map = new Map<number, Tujuan & { sasarans: Sasaran[] }>();

    need.sasarans.forEach((sasaran) => {
      const tujuan = sasaran.tujuan;

      if (!tujuan) {
        return;
      }

      if (!map.has(tujuan.id)) {
        map.set(tujuan.id, { ...tujuan, sasarans: [] });
      }

      const indicators =
        need.indicators?.filter((i) => i.sasaran_id === sasaran.id) ?? [];

      map.get(tujuan.id)?.sasarans.push({
        ...sasaran,
        indicators,
      });
    });

    return Array.from(map.values());
  }, [need]);

  const sections = useMemo(() => {
    return [
      {
        value: 'usulan',
        label: 'Data Usulan',
        subtitle: 'Informasi pokok, volume & pagu',
        icon: RiInformationLine,
        permission: 'view need tab general',
        count: `${need.volume} ${need.unit}`,
      },
      {
        value: 'urgency',
        label: 'Urgensi & Status',
        subtitle: 'Tingkat urgensi & prioritas',
        icon: RiFireLine,
        permission: 'view need tab urgency',
        count: need.urgency,
      },
      {
        value: 'renstra',
        label: 'Renstra',
        subtitle: 'Tujuan & sasaran strategis',
        icon: RiCompass3Line,
        permission: 'view need tab strategic',
        count: `${need.sasarans?.length || 0} sasaran`,
      },
      {
        value: 'ikk',
        label: 'IKK',
        subtitle: 'Indikator kinerja kunci',
        icon: RiBarChartLine,
        permission: 'view need tab ikk',
        count: `${need.kpi_indicators?.length || 0} indikator`,
      },
      {
        value: 'rls',
        label: 'RLS',
        subtitle: 'Rencana layanan strategis',
        icon: RiBriefcaseLine,
        permission: 'view need tab rls',
        count: `${need.strategic_service_plans?.length || 0} layanan`,
      },
      {
        value: 'perencanaan',
        label: 'Perencanaan',
        subtitle: 'Aktivitas & sub-kegiatan',
        icon: RiCalendarLine,
        permission: 'view need tab planning',
        count: `${need.planning_activity_versions?.length || 0} aktivitas`,
      },
      {
        value: 'detail',
        label: 'Detail KAK',
        subtitle: 'Kerangka acuan kerja lengkap',
        icon: RiFileTextLine,
        permission: 'view need tab detail',
        count: need.detail ? 'Tersedia' : 'Kosong',
      },
      {
        value: 'lampiran',
        label: 'Lampiran',
        subtitle: 'Berkas bukti dukung',
        icon: RiAttachmentLine,
        permission: 'view need tab lampiran',
        count: `${need.attachments?.length || 0} berkas`,
      },
      {
        value: 'checklist',
        label: 'Evaluasi KAK',
        subtitle: 'Kelayakan & kelengkapan',
        icon: RiCheckLine,
        permission: 'view need tab checklist',
        count: `${checklistAnswers.length} terjawab`,
      },
    ].filter((s) => hasPermission(s.permission));
  }, [need, checklistAnswers, hasPermission]);

  const [activeSection, setActiveSection] = useState<string>(
    sections[0]?.value ?? 'usulan',
  );

  const currentIndex = sections.findIndex((s) => s.value === activeSection);
  const currentSectionData = sections[currentIndex] || sections[0];

  const goPrev = () => {
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].value);
    }
  };

  const goNext = () => {
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].value);
    }
  };

  const isOrphaned = Boolean(
    need.organizational_unit_id && !need.organizational_unit,
  );

  return (
    <div className="space-y-6">
      {/* Lock Banner */}
      <NeedLockBanner need={need} />

      {/* Inactive Unit Alert Banner */}
      {isOrphaned && (
        <Alert variant="destructive">
          <RiAlertLine className="h-4 w-4" />
          <AlertTitle className="font-semibold">
            Unit Kerja Tidak Aktif
          </AlertTitle>
          <AlertDescription className="text-sm">
            Unit kerja sebelumnya telah dihapus atau tidak aktif.
          </AlertDescription>
        </Alert>
      )}
      {/* Breadcrumb & Quick Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            render={
              <Link
                href={
                  need.need_group_id
                    ? needRoutes.index.url({
                        query: { need_group_id: need.need_group_id },
                      })
                    : needRoutes.index.url()
                }
              >
                <RiArrowLeftLine className="h-4 w-4" />
              </Link>
            }
          />
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Kelompok Usulan {need.year}</span>
              <span>/</span>
              <span>
                {need.organizational_unit?.name ||
                  (isOrphaned ? 'Unit Tidak Aktif' : 'Unit Kerja')}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {need.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canReviewDirector && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReviewDialogOpen(true)}
              className="gap-1.5"
            >
              <RiQuillPenLine className="h-4 w-4" />
              <span>Review Direktur</span>
            </Button>
          )}

          {canManageLock && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLockModalMode(isLocked ? 'unlock' : 'lock');
                setIsLockDialogOpen(true);
              }}
              className="gap-1.5"
            >
              {isLocked ? (
                <>
                  <RiLockUnlockLine className="h-4 w-4" />
                  <span>Buka Kunci</span>
                </>
              ) : (
                <>
                  <RiLockLine className="h-4 w-4" />
                  <span>Kunci Usulan</span>
                </>
              )}
            </Button>
          )}

          <ExportPdfDialog
            needId={need.id}
            users={users}
            trigger={
              <Button variant="outline" size="sm" className="gap-1.5">
                <RiFileDownloadLine className="h-4 w-4" />
                <span>Unduh KAK</span>
              </Button>
            }
          />

          {need.can?.update && !isLocked && (
            <Button
              size="sm"
              className="gap-1.5"
              render={
                <Link href={needRoutes.edit.url({ need: need.id })}>
                  <RiEdit2Line className="h-4 w-4" />
                  <span>Edit Usulan</span>
                </Link>
              }
            />
          )}
        </div>
      </div>

      {/* Main Studio 2-Column Layout */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left Navigation Rail & Overview Sheet */}
        <aside className="w-full shrink-0 space-y-4 lg:w-80">
          {/* Navigation Items Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Navigasi Rincian Usulan
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs">
                  {currentIndex + 1} / {sections.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="flex flex-col gap-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.value;

                  return (
                    <button
                      key={section.value}
                      type="button"
                      onClick={() => setActiveSection(section.value)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-xs transition-colors',
                        isActive
                          ? 'bg-primary font-medium text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            isActive
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground',
                          )}
                        />
                        <div className="truncate">
                          <div className="truncate font-medium">
                            {section.label}
                          </div>
                          <div
                            className={cn(
                              'truncate text-[11px]',
                              isActive
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground/70',
                            )}
                          >
                            {section.subtitle}
                          </div>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'ml-2 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px]',
                          isActive
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {section.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Sticky Proposal Dossier Card */}
          <Card className="sticky top-6 border-border shadow-sm">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Ringkasan Pagu & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <span className="text-xs text-muted-foreground">
                  Total Estimasi Biaya
                </span>
                <div className="text-xl font-bold tracking-tight text-foreground">
                  {formatIDR(need.total_price)}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {need.volume} {need.unit} @ {formatIDR(need.unit_price)}
                  </span>
                  <span className="font-mono text-[11px] text-foreground">
                    TA {need.year}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Status Usulan</span>
                  <ProposalStatusBadge status={need.status} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tingkat Urgensi</span>
                  <UrgencyImpactBadge
                    urgency={need.urgency}
                    impact={need.impact}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Prioritas</span>
                  <PriorityBadge isPriority={need.is_priority} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Kesiapan Dokumen
                  </span>
                  <ReadinessBadge percentage={need.checklist_percentage ?? 0} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Review Direktur</span>
                  <DirectorReviewBadge need={need} />
                </div>
              </div>

              {need.notes && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-primary">
                    <RiQuillPenLine className="h-3.5 w-3.5" />
                    <span>Catatan Telaah Direktur</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {need.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Right Active Section Canvas */}
        <main className="min-w-0 flex-1 space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {currentSectionData && (
                      <currentSectionData.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      {currentSectionData?.label}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {currentSectionData?.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="gap-1 text-xs"
                  >
                    <RiArrowLeftLine className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={goNext}
                    disabled={currentIndex === sections.length - 1}
                    className="gap-1 text-xs"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <RiArrowRightLine className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Section 1: Data Usulan */}
              {activeSection === 'usulan' && (
                <div className="space-y-6">
                  <NeedGeneralInfo need={need} />
                </div>
              )}

              {/* Section 2: Urgensi & Status */}
              {activeSection === 'urgency' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Card className="border-border/60">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                          Klasifikasi Kebutuhan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Tingkat Urgensi
                          </span>
                          <span className="text-xs font-medium text-foreground capitalize">
                            {need.urgency}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Dampak Pelayanan
                          </span>
                          <span className="text-xs font-medium text-foreground capitalize">
                            {need.impact}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Status Prioritas
                          </span>
                          <PriorityBadge isPriority={need.is_priority} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Jenis Kebutuhan
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            {need.need_type?.name || 'Umum'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/60">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                          Status Pengusulan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Status Dokumen
                          </span>
                          <ProposalStatusBadge status={need.status} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Kesiapan Dokumen
                          </span>
                          <ReadinessBadge
                            percentage={need.checklist_percentage ?? 0}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Tanggal Usulan
                          </span>
                          <span className="text-xs text-foreground">
                            {need.created_at
                              ? formatDate(need.created_at)
                              : '-'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Section 3: Renstra */}
              {activeSection === 'renstra' && (
                <div className="space-y-4">
                  <StrategicAlignmentSection groupedRenstra={groupedRenstra} />
                </div>
              )}

              {/* Section 4: IKK */}
              {activeSection === 'ikk' && (
                <div className="space-y-4">
                  <IkkAlignmentShow need={need} />
                </div>
              )}

              {/* Section 5: RLS */}
              {activeSection === 'rls' && (
                <div className="space-y-4">
                  <RlsAlignmentShow need={need} />
                </div>
              )}

              {/* Section 6: Perencanaan */}
              {activeSection === 'perencanaan' && (
                <div className="space-y-4">
                  <PlanningAlignmentShow need={need} />
                </div>
              )}

              {/* Section 7: Detail KAK */}
              {activeSection === 'detail' && (
                <div className="space-y-4">
                  <NeedDetailView
                    needId={need.id}
                    detail={need.detail}
                    users={users}
                    attachments={
                      need.attachments?.filter(
                        (a) => a.category === 'technical_specifications',
                      ) ?? []
                    }
                  />
                </div>
              )}

              {/* Section 8: Lampiran */}
              {activeSection === 'lampiran' && (
                <div className="space-y-4">
                  <NeedAttachmentsTab need={need} />
                </div>
              )}

              {/* Section 9: Evaluasi & Checklist */}
              {activeSection === 'checklist' && (
                <div className="space-y-4">
                  <ChecklistForm
                    needId={need.id}
                    questions={checklistQuestions.data}
                    existingAnswers={checklistAnswers}
                    readonly={!need.can?.performChecklist || isLocked}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Dialog Modals */}
      <NeedDirectorReviewDialog
        need={need}
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
      />

      <NeedLockDialog
        need={need}
        open={isLockDialogOpen}
        onOpenChange={setIsLockDialogOpen}
        mode={lockModalMode}
      />
    </div>
  );
}
