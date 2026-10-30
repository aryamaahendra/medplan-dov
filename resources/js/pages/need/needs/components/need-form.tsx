import {
  RiAlertLine,
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
  RiSendPlaneLine,
} from '@remixicon/react';
import React, { useMemo, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNeedForm } from '@/features/need/hooks/use-need-form';
import {
  StrategicAlignmentEditor,
  useStrategicAlignment,
} from '@/features/need/strategic-alignment';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';
import type {
  KpiGroup,
  Need,
  PlanningActivityVersion,
  StrategicServicePlan,
  Tujuan,
} from '@/types';

import { FileSection } from './file-section';
import { GeneralInfoSection } from './general-info-section';
import { NeedDetailSection } from './need-detail-section';
import { NeedLockBanner } from './need-lock-banner';
import { PriorityStatusSection } from './priority-status-section';
import { UnapprovedNeedPickerDialog } from './unapproved-need-picker-dialog';

export interface NeedFormProps {
  need?: Need | null;
  currentGroup?: { id: number; name: string; year: number } | null;
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  needTypes: { id: number; name: string }[];
  tujuans: Tujuan[];
  kpiGroups: KpiGroup[];
  strategicServicePlans: StrategicServicePlan[];
  planningActivities: PlanningActivityVersion[];
  fundingSources: { id: number; name: string }[];
  users: { id: number; name: string; nip: string | null }[];
  kldiOptions: { name: string; value: string }[];
  satkerOptions: { name: string; value: string }[];
  className?: string;
}

export function NeedForm({
  need,
  currentGroup,
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
  className,
}: NeedFormProps) {
  const { hasPermission } = usePermission();

  const { form, state, handlers } = useNeedForm({
    need,
    currentGroup,
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
  });

  const { data, setData, errors, processing } = form;
  const alignmentController = useStrategicAlignment({
    data,
    setData,
    options: {
      tujuans,
      kpiGroups,
      strategicServicePlans,
      planningActivities,
    },
  });
  const {
    isEditing,
    isLocked,
    isOrphaned,
    filteredOrganizationalUnits,
    visibleTabs,
    detailValuesRef,
    pickerOpen,
    sourceTitle,
  } = state;
  const {
    setPickerOpen,
    handleSelectSource,
    handleResetSource,
    getTabErrors,
    handleSubmit,
    handleVolumeChange,
    handleUnitPriceChange,
    onCancel,
  } = handlers;

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
        label: 'Kerangka Acuan Kerja (KAK)',
        subtitle: 'Spesifikasi teknis & uraian KAK',
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

  return (
    <>
      <form onSubmit={handleSubmit} className={cn('w-full', className)}>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Main Content Canvas (8 cols on lg) */}
          <div className="space-y-4 lg:col-span-8">
            <div>
              {/* Header of Active Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
                    {currentSectionMeta?.label}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground uppercase">
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

              {/* Active Content - Sections kept mounted in DOM */}
              <div className="pt-4 md:pt-6">
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
                        organizationalUnits={filteredOrganizationalUnits}
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
                      <StrategicAlignmentEditor
                        framework="renstra"
                        controller={alignmentController}
                        year={parseInt(data.year)}
                        errors={errors}
                        disabled={isLocked}
                      />
                    )}
                  </div>

                  <div className={cn(activeSection !== 'ikk' && 'hidden')}>
                    {hasPermission('update need tab ikk') && (
                      <StrategicAlignmentEditor
                        framework="ikk"
                        controller={alignmentController}
                        year={parseInt(data.year)}
                        errors={errors}
                        disabled={isLocked}
                      />
                    )}
                  </div>

                  <div className={cn(activeSection !== 'rls' && 'hidden')}>
                    {hasPermission('update need tab rls') && (
                      <StrategicAlignmentEditor
                        framework="rls"
                        controller={alignmentController}
                        errors={errors}
                        disabled={isLocked}
                      />
                    )}
                  </div>

                  <div
                    className={cn(activeSection !== 'perencanaan' && 'hidden')}
                  >
                    {hasPermission('update need tab planning') && (
                      <StrategicAlignmentEditor
                        framework="planning"
                        controller={alignmentController}
                        year={parseInt(data.year)}
                        errors={errors}
                        disabled={isLocked}
                      />
                    )}
                  </div>

                  <div className={cn(activeSection !== 'detail' && 'hidden')}>
                    {hasPermission('update need tab detail') && (
                      <NeedDetailSection
                        key={
                          data.source_need_id
                            ? `source-${data.source_need_id}`
                            : 'default'
                        }
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
                <div className="flex items-center justify-between pt-6">
                  {activeIndex > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setActiveSection(sections[activeIndex - 1].value)
                      }
                    >
                      <span>Ke: {sections[activeIndex - 1]?.label}</span>
                    </Button>
                  ) : (
                    <div />
                  )}

                  {activeIndex < sections.length - 1 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {!isLocked && (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={processing}
                          onClick={(e) =>
                            handleSubmit(e, { shouldSubmit: false })
                          }
                        >
                          Simpan sebagai Draft
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="default"
                        onClick={() =>
                          setActiveSection(sections[activeIndex + 1].value)
                        }
                      >
                        <span>
                          Lanjut ke: {sections[activeIndex + 1]?.label}
                        </span>
                      </Button>
                    </div>
                  ) : (
                    !isLocked && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={processing}
                          onClick={(e) =>
                            handleSubmit(e, { shouldSubmit: false })
                          }
                        >
                          Simpan sebagai Draft
                        </Button>
                        <Button
                          type="button"
                          variant="default"
                          disabled={
                            processing ||
                            (isEditing && need?.can?.submit === false)
                          }
                          onClick={(e) =>
                            handleSubmit(e, { shouldSubmit: true })
                          }
                        >
                          <RiSendPlaneLine data-icon="inline-start" />
                          <span>Simpan & Ajukan</span>
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sticky Navigation Rail (4 cols on lg) */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:z-10 lg:col-span-4">
            {need && <NeedLockBanner need={need} />}

            {isOrphaned && (
              <Alert variant="destructive" className="p-2.5">
                <RiAlertLine className="h-4 w-4" />
                <AlertTitle className="text-xs font-semibold">
                  Unit Kerja Tidak Aktif
                </AlertTitle>
                <AlertDescription className="text-xs">
                  Unit kerja sebelumnya tidak aktif. Silakan pilih unit kerja
                  aktif.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Sidebar Summary & Save Card */}
              <div>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onCancel}
                      className="flex-1"
                    >
                      {isLocked ? 'KEMBALI' : 'BATAL'}
                    </Button>
                    {!isLocked && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={processing}
                        onClick={(e) =>
                          handleSubmit(e, { shouldSubmit: false })
                        }
                        className="flex-1"
                      >
                        Simpan Draft
                      </Button>
                    )}
                  </div>
                  {!isLocked && (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      disabled={
                        processing || (isEditing && need?.can?.submit === false)
                      }
                      onClick={(e) => handleSubmit(e, { shouldSubmit: true })}
                      className="w-full"
                    >
                      <RiSendPlaneLine data-icon="inline-start" />
                      <span>Simpan & Ajukan</span>
                    </Button>
                  )}
                </div>
              </div>

              <div>
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
                  <div className="mt-2 flex items-center justify-between rounded-md border border-border/70 bg-muted/50 px-2.5 py-1.5 text-xs text-foreground">
                    <span className="line-clamp-1 text-xss">
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
              <div className="space-y-1 py-1">
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
                          ? 'bg-muted font-semibold text-foreground dark:bg-muted'
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
                          <span className="text-xs font-semibold uppercase">
                            {section.label}
                          </span>
                          {errCount > 0 ? (
                            <Badge
                              variant="destructive"
                              className="h-4 px-1 text-xss font-bold"
                            >
                              {errCount}
                            </Badge>
                          ) : section.isFilled ? (
                            <RiCheckLine className="h-3.5 w-3.5 text-success" />
                          ) : null}
                        </div>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {section.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </form>

      {!isEditing && currentGroup && (
        <UnapprovedNeedPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          targetGroupId={currentGroup.id}
          onSelect={handleSelectSource}
        />
      )}
    </>
  );
}
