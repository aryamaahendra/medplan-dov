import { RiAlertLine } from '@remixicon/react';
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiAttachmentLine,
  RiBarChartLine,
  RiBriefcaseLine,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiCompass3Line,
  RiFileTextLine,
  RiFireLine,
  RiHistoryLine,
  RiInformationLine,
  RiSaveLine,
} from '@remixicon/react';
import React, { useMemo, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permission';
import { formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type {
  Need,
  PlanningActivityVersion,
  StrategicServicePlan,
  Tujuan,
} from '@/types';

import { FileSection } from '../file-section';
import { GeneralInfoSection } from '../general-info-section';
import { IkkAlignmentSection } from '../ikk-alignment-section';
import { NeedDetailSection } from '../need-detail-section';
import { PlanningAlignmentSection } from '../planning-alignment-section';
import { PriorityStatusSection } from '../priority-status-section';
import { RenstraAlignmentSection } from '../renstra-alignment-section';
import { RlsAlignmentSection } from '../rls-alignment-section';

export interface FormVariantProps {
  data: any;
  setData: (key: any, value?: any) => void;
  errors: any;
  processing: boolean;
  isEditing: boolean;
  isLocked: boolean;
  currentGroup?: { id: number; name: string; year: number } | null;
  need?: Need | null;
  isOrphaned?: boolean;
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  needTypes: { id: number; name: string }[];
  tujuans: Tujuan[];
  kpiGroups: any[];
  strategicServicePlans: StrategicServicePlan[];
  planningActivities: PlanningActivityVersion[];
  fundingSources: { id: number; name: string }[];
  users: { id: number; name: string; nip: string | null }[];
  kldiOptions: { name: string; value: string }[];
  satkerOptions: { name: string; value: string }[];
  handleVolumeChange: (value: string) => void;
  handleUnitPriceChange: (value: string) => void;
  detailValuesRef: React.MutableRefObject<any>;
  getTabErrors: (tabValue: string) => string[];
  visibleTabs: { value: string; label: string; permission: string }[];
  sourceTitle: string | null;
  handleResetSource: () => void;
  setPickerOpen: (open: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  className?: string;
}
export function NeedFormVariant2({
  data,
  setData,
  errors,
  processing,
  isEditing,
  isLocked,
  need,
  isOrphaned = false,
  organizationalUnits,
  needTypes,
  tujuans,
  kpiGroups,
  strategicServicePlans,
  planningActivities,
  fundingSources,
  users,
  kldiOptions,
  satkerOptions,
  handleVolumeChange,
  handleUnitPriceChange,
  detailValuesRef,
  getTabErrors,
  visibleTabs,
  sourceTitle,
  handleResetSource,
  setPickerOpen,
  handleSubmit,
  onCancel,
  className,
}: FormVariantProps) {
  const { hasPermission } = usePermission();
  const [activeSection, setActiveSection] = useState<string>(
    visibleTabs[0]?.value ?? 'usulan',
  );

  const sections = useMemo(() => {
    return [
      {
        value: 'usulan',
        label: 'Data Usulan',
        subtitle: 'Judul, unit, volume, harga',
        icon: RiInformationLine,
        permission: 'update need tab general',
        isFilled: !!data.title && !!data.unit_price,
      },
      {
        value: 'urgency',
        label: 'Urgensi & Status',
        subtitle: 'Tingkat urgensi & prioritas',
        icon: RiFireLine,
        permission: 'update need tab urgency',
        isFilled: !!data.urgency,
      },
      {
        value: 'renstra',
        label: 'Renstra',
        subtitle: 'Sasaran & indikator renstra',
        icon: RiCompass3Line,
        permission: 'update need tab strategic',
        isFilled: (data.sasaran_ids?.length ?? 0) > 0,
      },
      {
        value: 'ikk',
        label: 'IKK',
        subtitle: 'Indikator kinerja kunci',
        icon: RiBarChartLine,
        permission: 'update need tab ikk',
        isFilled: (data.kpi_indicator_ids?.length ?? 0) > 0,
      },
      {
        value: 'rls',
        label: 'RLS',
        subtitle: 'Rencana layanan strategis',
        icon: RiBriefcaseLine,
        permission: 'update need tab rls',
        isFilled: (data.strategic_service_plan_ids?.length ?? 0) > 0,
      },
      {
        value: 'perencanaan',
        label: 'Perencanaan',
        subtitle: 'Program & sub-kegiatan',
        icon: RiCalendarLine,
        permission: 'update need tab planning',
        isFilled: (data.planning_activity_version_ids?.length ?? 0) > 0,
      },
      {
        value: 'detail',
        label: 'Detail KAK',
        subtitle: 'Uraian KAK & spesifikasi',
        icon: RiFileTextLine,
        permission: 'update need tab detail',
        isFilled:
          !!data.detail?.background || !!data.detail?.purpose_and_objectives,
      },
      {
        value: 'lampiran',
        label: 'Lampiran',
        subtitle: 'Berkas bukti pendukung',
        icon: RiAttachmentLine,
        permission: 'update need tab lampiran',
        isFilled: (data.attachments?.length ?? 0) > 0,
      },
    ].filter((s) => hasPermission(s.permission));
  }, [data, hasPermission]);

  const activeIndex = sections.findIndex((s) => s.value === activeSection);
  const currentSectionMeta = sections[activeIndex] ?? sections[0];

  const totalPriceFormatted = useMemo(() => {
    return formatIDR(data.total_price || 0);
  }, [data.total_price]);

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Navigation Rail (4 cols on lg) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Navigasi Formulir
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {sections.length} Bagian
                </span>
              </div>

              {!isEditing && (
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerOpen(true)}
                    className="w-full gap-1.5 text-xs"
                  >
                    <RiHistoryLine className="h-3.5 w-3.5" />
                    Salin Usulan Sebelumnya
                  </Button>
                </div>
              )}

              {sourceTitle && (
                <div className="mt-2 flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs text-primary">
                  <span className="line-clamp-1 text-[11px]">
                    Draf: <strong>{sourceTitle}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetSource}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RiCloseLine className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Section List */}
            <div className="divide-y divide-border/40 py-1">
              {sections.map((section) => {
                const isSelected = section.value === activeSection;
                const errCount = getTabErrors(section.value).length;
                const IconComp = section.icon;

                return (
                  <button
                    key={section.value}
                    type="button"
                    onClick={() => setActiveSection(section.value)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
                      isSelected
                        ? 'bg-primary/10 font-medium text-primary dark:bg-primary/15'
                        : 'text-foreground/80 hover:bg-muted/60 hover:text-foreground',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground group-hover:text-foreground',
                      )}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold">
                          {section.label}
                        </span>
                        {errCount > 0 ? (
                          <Badge
                            variant="destructive"
                            className="h-4 px-1 text-[9px] font-bold"
                          >
                            {errCount}
                          </Badge>
                        ) : section.isFilled ? (
                          <RiCheckLine className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : null}
                      </div>
                      <p className="line-clamp-1 text-[10px] text-muted-foreground">
                        {section.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sidebar Summary & Save Card */}
            <div className="border-t border-border/60 pt-4">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Total Estimasi Biaya
                </span>
                <div className="mt-0.5 text-lg font-bold text-primary">
                  {totalPriceFormatted}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {data.volume
                    ? `${data.volume} ${data.unit || 'unit'}`
                    : 'Volume belum diisi'}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  className="flex-1 text-xs"
                >
                  {isLocked ? 'Kembali' : 'Batal'}
                </Button>

                {!isLocked && (
                  <Button
                    type="submit"
                    size="sm"
                    disabled={processing}
                    className="flex-1 gap-1 text-xs font-semibold"
                  >
                    <RiSaveLine className="h-3.5 w-3.5" />
                    {isEditing ? 'Simpan' : 'Tambah'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Content Canvas (8 cols on lg) */}
        <div className="space-y-4 lg:col-span-8">
          <div>
            {/* Header of Active Section */}
            <div className="border-b border-border/60 pb-4 md:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase">
                    Bagian {activeIndex + 1} dari {sections.length}
                  </span>
                  <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
                    {currentSectionMeta?.label}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {currentSectionMeta?.subtitle}
                  </p>
                </div>

                {getTabErrors(activeSection).length > 0 && (
                  <Badge
                    variant="destructive"
                    className="h-5 gap-1 px-2 text-xs"
                  >
                    Ada {getTabErrors(activeSection).length} field perlu
                    diperbaiki
                  </Badge>
                )}
              </div>
            </div>

            {/* Active Content - Sections kept mounted in DOM */}
            <div className="pt-4 md:pt-6">
              {isOrphaned && (
                <div className="mb-4">
                  <Alert variant="destructive">
                    <RiAlertLine />
                    <AlertTitle className="font-semibold">
                      Unit Kerja Tidak Aktif
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      Unit kerja sebelumnya telah dihapus atau tidak aktif.
                      Silakan pilih unit kerja aktif untuk melanjutkan pembaruan
                      usulan.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <fieldset
                disabled={isLocked}
                className="contents disabled:pointer-events-none disabled:opacity-80"
              >
                <div className={cn(activeSection !== 'usulan' && 'hidden')}>
                  {hasPermission('update need tab general') && (
                    <GeneralInfoSection
                      data={data}
                      setData={setData}
                      errors={errors}
                      organizationalUnits={organizationalUnits}
                      needTypes={needTypes}
                      handleVolumeChange={handleVolumeChange}
                      handleUnitPriceChange={handleUnitPriceChange}
                    />
                  )}
                </div>

                <div className={cn(activeSection !== 'urgency' && 'hidden')}>
                  {hasPermission('update need tab urgency') && (
                    <PriorityStatusSection
                      data={data}
                      setData={setData}
                      errors={errors}
                    />
                  )}
                </div>

                <div className={cn(activeSection !== 'renstra' && 'hidden')}>
                  {hasPermission('update need tab strategic') && (
                    <RenstraAlignmentSection
                      data={data}
                      setData={setData}
                      errors={errors}
                      tujuans={tujuans}
                      year={parseInt(data.year)}
                    />
                  )}
                </div>

                <div className={cn(activeSection !== 'ikk' && 'hidden')}>
                  {hasPermission('update need tab ikk') && (
                    <IkkAlignmentSection
                      data={data}
                      setData={setData}
                      errors={errors}
                      kpiGroups={kpiGroups}
                      year={parseInt(data.year)}
                    />
                  )}
                </div>

                <div className={cn(activeSection !== 'rls' && 'hidden')}>
                  {hasPermission('update need tab rls') && (
                    <RlsAlignmentSection
                      data={data}
                      setData={setData}
                      errors={errors}
                      strategicServicePlans={strategicServicePlans}
                    />
                  )}
                </div>

                <div
                  className={cn(activeSection !== 'perencanaan' && 'hidden')}
                >
                  {hasPermission('update need tab planning') && (
                    <PlanningAlignmentSection
                      data={data}
                      setData={setData}
                      errors={errors}
                      planningActivities={planningActivities}
                      year={parseInt(data.year)}
                    />
                  )}
                </div>

                <div className={cn(activeSection !== 'detail' && 'hidden')}>
                  {hasPermission('update need tab detail') && (
                    <NeedDetailSection
                      initialValues={data.detail}
                      detailValuesRef={detailValuesRef}
                      errors={errors}
                      technicalSpecificationAttachments={
                        data.technical_specification_attachments
                      }
                      technicalSpecificationAttachmentNames={
                        data.technical_specification_attachment_names
                      }
                      setTechnicalSpecificationAttachments={(files) =>
                        setData('technical_specification_attachments', files)
                      }
                      setTechnicalSpecificationAttachmentNames={(names) =>
                        setData(
                          'technical_specification_attachment_names',
                          names,
                        )
                      }
                      existingTechnicalSpecificationAttachments={
                        need?.attachments?.filter(
                          (a) => a.category === 'technical_specifications',
                        ) ?? []
                      }
                      deletedAttachmentIds={data.deleted_attachment_ids}
                      setDeletedAttachmentIds={(ids) =>
                        setData('deleted_attachment_ids', ids)
                      }
                      fundingSources={fundingSources}
                      users={users}
                      kldiOptions={kldiOptions}
                      satkerOptions={satkerOptions}
                      totalPrice={data.total_price}
                    />
                  )}
                </div>

                <div className={cn(activeSection !== 'lampiran' && 'hidden')}>
                  {hasPermission('update need tab lampiran') && (
                    <FileSection
                      files={data.attachments}
                      fileNames={data.attachment_names}
                      setFiles={(files) => setData('attachments', files)}
                      setFileNames={(names) =>
                        setData('attachment_names', names)
                      }
                      existingAttachments={
                        need?.attachments?.filter(
                          (a) => a.category === 'general',
                        ) ?? []
                      }
                      deletedAttachmentIds={data.deleted_attachment_ids}
                      setDeletedAttachmentIds={(ids) =>
                        setData('deleted_attachment_ids', ids)
                      }
                      errors={errors}
                    />
                  )}
                </div>
              </fieldset>

              {/* Step Navigation Glide Buttons */}
              <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4">
                {activeIndex > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setActiveSection(sections[activeIndex - 1].value)
                    }
                    className="gap-1.5 text-xs"
                  >
                    <RiArrowLeftLine className="h-3.5 w-3.5" />
                    <span>Ke: {sections[activeIndex - 1]?.label}</span>
                  </Button>
                ) : (
                  <div />
                )}

                {activeIndex < sections.length - 1 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setActiveSection(sections[activeIndex + 1].value)
                    }
                    className="gap-1.5 text-xs"
                  >
                    <span>Lanjut ke: {sections[activeIndex + 1]?.label}</span>
                    <RiArrowRightLine className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  !isLocked && (
                    <Button
                      type="submit"
                      size="sm"
                      disabled={processing}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <RiSaveLine className="h-3.5 w-3.5" />
                      {isEditing ? 'Simpan Usulan' : 'Tambah Usulan'}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
