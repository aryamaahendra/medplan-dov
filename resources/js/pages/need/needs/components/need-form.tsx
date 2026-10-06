import { router, useForm, usePage } from '@inertiajs/react';
import { RiCloseLine, RiHistoryLine } from '@remixicon/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import NeedController from '@/actions/App/Http/Controllers/Need/NeedController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';

import type {
  Need,
  PlanningActivityVersion,
  StrategicServicePlan,
  Tujuan,
} from '@/types';

import { FileSection } from './file-section';
import { GeneralInfoSection } from './general-info-section';
import { IkkAlignmentSection } from './ikk-alignment-section';
import { NeedDetailSection } from './need-detail-section';
import { PlanningAlignmentSection } from './planning-alignment-section';
import { PriorityStatusSection } from './priority-status-section';
import { RenstraAlignmentSection } from './renstra-alignment-section';
import { RlsAlignmentSection } from './rls-alignment-section';
import { UnapprovedNeedPickerDialog } from './unapproved-need-picker-dialog';

interface NeedFormProps {
  need?: Need | null;
  currentGroup?: { id: number; name: string; year: number } | null;
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
  const isEditing = !!need;

  const { auth } = usePage().props;
  const user = auth.user;
  const { hasRole, hasPermission } = usePermission();

  const isRestricted =
    !hasRole('super-admin') && !hasRole('admin') && !hasRole('planner');

  const isLocked = isEditing && need?.is_locked && !need?.can?.update;
  const tabs = [
    {
      value: 'usulan',
      label: 'Data Usulan',
      permission: 'update need tab general',
    },
    {
      value: 'urgency',
      label: 'Urgensi & Status',
      permission: 'update need tab urgency',
    },
    {
      value: 'renstra',
      label: 'Renstra',
      permission: 'update need tab strategic',
    },
    { value: 'ikk', label: 'IKK', permission: 'update need tab ikk' },
    { value: 'rls', label: 'RLS', permission: 'update need tab rls' },
    {
      value: 'perencanaan',
      label: 'Perencanaan',
      permission: 'update need tab planning',
    },
    {
      value: 'detail',
      label: 'Detail KAK',
      permission: 'update need tab detail',
    },
    {
      value: 'lampiran',
      label: 'Lampiran',
      permission: 'update need tab lampiran',
    },
  ];

  const visibleTabs = tabs.filter((tab) => hasPermission(tab.permission));
  const [activeTab, setActiveTab] = useState<string>(
    visibleTabs[0]?.value ?? 'usulan',
  );
  const filteredOrganizationalUnits =
    isRestricted && user?.organizational_unit_id
      ? organizationalUnits.filter(
          (unit) => unit.id === user.organizational_unit_id,
        )
      : organizationalUnits;

  const { data, setData, post, processing, errors, transform } = useForm({
    need_group_id:
      need?.need_group_id?.toString() ?? currentGroup?.id?.toString() ?? '',
    source_need_id: (need as any)?.source_need_id?.toString() ?? '',
    organizational_unit_id:
      need?.organizational_unit_id?.toString() ??
      (isRestricted ? user?.organizational_unit_id?.toString() : '') ??
      '',
    need_type_id: need?.need_type_id?.toString() ?? '',
    year:
      need?.year?.toString() ??
      currentGroup?.year?.toString() ??
      new Date().getFullYear().toString(),
    title: need?.title ?? '',
    description: need?.description ?? '',
    current_condition: need?.current_condition ?? '',
    required_condition: need?.required_condition ?? '',
    unit: need?.unit ?? '',
    volume: need?.volume ?? '',
    unit_price: need?.unit_price ?? '',
    total_price: need?.total_price ?? '',
    urgency: need?.urgency ?? 'medium',
    impact: need?.impact ?? 'medium',
    is_priority: need?.is_priority ?? false,
    status: need?.status ?? 'draft',
    sasaran_ids:
      need?.sasarans?.map((s) => s.id.toString()) ?? ([] as string[]),
    indicator_ids:
      need?.indicators?.map((i) => i.id.toString()) ?? ([] as string[]),
    kpi_indicator_ids:
      need?.kpi_indicators?.map((i) => i.id.toString()) ?? ([] as string[]),
    strategic_service_plan_ids:
      need?.strategic_service_plans?.map((i) => i.id.toString()) ??
      ([] as string[]),
    planning_activity_version_ids:
      need?.planning_activity_versions?.map((i) => i.id.toString()) ??
      ([] as string[]),
    planning_activity_indicator_ids:
      need?.planning_activity_indicators?.map((i) => i.id.toString()) ??
      ([] as string[]),
    detail: {
      background: need?.detail?.background ?? '',
      purpose_and_objectives: need?.detail?.purpose_and_objectives ?? '',
      target_objective: need?.detail?.target_objective ?? '',
      kldi: need?.detail?.kldi ?? '',
      satker_skpd: need?.detail?.satker_skpd ?? '',
      kpa_id: need?.detail?.kpa_id?.toString() ?? '',
      funding_source_ids:
        need?.detail?.funding_sources?.map((s) => s.id.toString()) ??
        ([] as string[]),
      estimated_cost: need?.detail?.estimated_cost ?? '',
      implementation_period: need?.detail?.implementation_period ?? '',
      expert_or_skilled_personnel:
        need?.detail?.expert_or_skilled_personnel ?? '',
      technical_specifications: need?.detail?.technical_specifications ?? '',
      training: need?.detail?.training ?? '',
    },
    attachments: [] as File[],
    attachment_names: [] as string[],
    technical_specification_attachments: [] as File[],
    technical_specification_attachment_names: [] as string[],
    deleted_attachment_ids: [] as number[],
  });

  const detailValuesRef = useRef(data.detail);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [sourceTitle, setSourceTitle] = useState<string | null>(null);

  const handleSelectSource = (source: any) => {
    setSourceTitle(source.title);
    const newDetail = {
      background: source.detail?.background ?? '',
      purpose_and_objectives: source.detail?.purpose_and_objectives ?? '',
      target_objective: source.detail?.target_objective ?? '',
      kldi: source.detail?.kldi ?? '',
      satker_skpd: source.detail?.satker_skpd ?? '',
      kpa_id: source.detail?.kpa_id?.toString() ?? '',
      funding_source_ids:
        source.detail?.funding_sources?.map((s: any) => s.id.toString()) ?? [],
      estimated_cost: source.detail?.estimated_cost ?? '',
      implementation_period: source.detail?.implementation_period ?? '',
      expert_or_skilled_personnel:
        source.detail?.expert_or_skilled_personnel ?? '',
      technical_specifications: source.detail?.technical_specifications ?? '',
      training: source.detail?.training ?? '',
    };
    detailValuesRef.current = newDetail;

    setData((prev: typeof data) => ({
      ...prev,
      source_need_id: source.id?.toString() ?? '',
      title: source.title ?? '',
      description: source.description ?? '',
      current_condition: source.current_condition ?? '',
      required_condition: source.required_condition ?? '',
      unit: source.unit ?? '',
      volume: source.volume?.toString() ?? '',
      unit_price: source.unit_price?.toString() ?? '',
      total_price: source.total_price?.toString() ?? '',
      urgency: source.urgency ?? 'medium',
      impact: source.impact ?? 'medium',
      is_priority: source.is_priority ?? false,
      need_type_id:
        source.need_type?.id?.toString() ??
        source.need_type_id?.toString() ??
        prev.need_type_id,
      organizational_unit_id:
        !isRestricted && source.organizational_unit_id
          ? source.organizational_unit_id.toString()
          : prev.organizational_unit_id,
      sasaran_ids: source.sasarans?.map((s: any) => s.id.toString()) ?? [],
      indicator_ids: source.indicators?.map((i: any) => i.id.toString()) ?? [],
      kpi_indicator_ids:
        source.kpi_indicators?.map((i: any) => i.id.toString()) ?? [],
      strategic_service_plan_ids:
        source.strategic_service_plans?.map((i: any) => i.id.toString()) ?? [],
      planning_activity_version_ids:
        source.planning_activity_versions?.map((i: any) => i.id.toString()) ??
        [],
      planning_activity_indicator_ids:
        source.planning_activity_indicators?.map((i: any) => i.id.toString()) ??
        [],
      detail: newDetail,
    }));
  };

  const handleResetSource = () => {
    setSourceTitle(null);
    setData('source_need_id', '');
  };

  const fieldMapping: Record<string, string[]> = {
    usulan: [
      'need_group_id',
      'organizational_unit_id',
      'need_type_id',
      'year',
      'title',
      'description',
      'current_condition',
      'required_condition',
      'unit',
      'volume',
      'unit_price',
      'total_price',
    ],
    urgency: ['urgency', 'impact', 'is_priority', 'status'],
    renstra: ['sasaran_ids', 'indicator_ids'],
    ikk: ['kpi_indicator_ids'],
    rls: ['strategic_service_plan_ids'],
    perencanaan: [
      'planning_activity_version_ids',
      'planning_activity_indicator_ids',
    ],
    detail: [
      'detail.background',
      'detail.purpose_and_objectives',
      'detail.target_objective',
      'detail.kldi',
      'detail.satker_skpd',
      'detail.kpa_id',
      'detail.funding_source_ids',
      'detail.estimated_cost',
      'detail.implementation_period',
      'detail.expert_or_skilled_personnel',
      'detail.technical_specifications',
      'detail.training',
      'technical_specification_attachments',
      'technical_specification_attachment_names',
    ],
    lampiran: ['attachments', 'attachment_names', 'deleted_attachment_ids'],
  };

  const getTabForField = (fieldKey: string) => {
    for (const tab of tabs) {
      const tabFields = fieldMapping[tab.value] || [];

      if (
        tabFields.some(
          (field) =>
            fieldKey === field ||
            fieldKey.startsWith(`${field}.`) ||
            fieldKey.startsWith(`${field}[`),
        )
      ) {
        return tab;
      }
    }

    return null;
  };

  const getTabErrors = (tabValue: string) => {
    const tabFields = fieldMapping[tabValue] || [];

    return Object.keys(errors).filter((key) =>
      tabFields.some((field) => key === field || key.startsWith(`${field}.`)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const options = {
      onSuccess: () => {
        toast.success(
          isEditing
            ? 'Usulan kebutuhan berhasil diperbarui.'
            : 'Usulan kebutuhan berhasil dibuat.',
        );
      },
      onError: (errs: Record<string, string>) => {
        const errorEntries = Object.entries(errs || {});

        if (errorEntries.length === 0) {
          toast.error('Terjadi kesalahan validasi.');

          return;
        }

        const tabErrorMessages: Record<string, string[]> = {};
        const unmappedErrors: string[] = [];

        errorEntries.forEach(([key, message]) => {
          const tab = getTabForField(key);

          if (tab) {
            if (!tabErrorMessages[tab.value]) {
              tabErrorMessages[tab.value] = [];
            }

            tabErrorMessages[tab.value].push(message);
          } else {
            unmappedErrors.push(message);
          }
        });

        const errorVisibleTabs = visibleTabs.filter(
          (tab) => (tabErrorMessages[tab.value]?.length || 0) > 0,
        );

        if (errorVisibleTabs.length > 0) {
          setActiveTab(errorVisibleTabs[0].value);

          errorVisibleTabs.forEach((tab) => {
            const messages = tabErrorMessages[tab.value];
            toast.error(`Ada kesalahan pada tab ${tab.label}`, {
              description: messages.join(' • '),
            });
          });
        }

        const hiddenTabsWithErrors = tabs.filter(
          (tab) =>
            !visibleTabs.some((vt) => vt.value === tab.value) &&
            (tabErrorMessages[tab.value]?.length || 0) > 0,
        );

        hiddenTabsWithErrors.forEach((tab) => {
          const messages = tabErrorMessages[tab.value];
          toast.error(
            `Validasi gagal pada tab ${tab.label} (tidak dapat diakses)`,
            {
              description: messages.join(' • '),
            },
          );
        });

        if (unmappedErrors.length > 0) {
          toast.error('Terjadi kesalahan validasi', {
            description: unmappedErrors.join(' • '),
          });
        }
      },
    };

    transform((data) => ({
      ...data,
      detail: detailValuesRef.current,
      ...(isEditing ? { _method: 'PATCH' } : {}),
    }));

    if (isEditing) {
      post(NeedController.update.url({ need: need.id }), options);
    } else {
      post(NeedController.store.url(), options);
    }
  };

  const handleVolumeChange = (value: string) => {
    const vol = parseFloat(value) || 0;
    const price = parseFloat(data.unit_price) || 0;
    setData((d: typeof data) => ({
      ...d,
      volume: value,
      total_price: (vol * price).toFixed(2),
    }));
  };

  const handleUnitPriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    const vol = parseFloat(data.volume) || 0;
    setData((d: typeof data) => ({
      ...d,
      unit_price: value,
      total_price: (vol * price).toFixed(2),
    }));
  };

  return (
    <Card className={cn('w-full max-w-3xl overflow-hidden', className)}>
      <form onSubmit={handleSubmit}>
        <CardContent className="">
          {!isEditing && (
            <div className="mb-4 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  Isi formulir secara manual atau salin dari usulan sebelumnya
                  yang belum disetujui:
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPickerOpen(true)}
                  className="gap-1.5"
                >
                  <RiHistoryLine className="h-4 w-4" />
                  Pilih dari Usulan Sebelumnya
                </Button>
              </div>

              {sourceTitle && (
                <div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                  <div className="flex items-center gap-2">
                    <RiHistoryLine className="h-4 w-4 shrink-0" />
                    <span>
                      Memuat draf dari usulan sebelumnya:{' '}
                      <strong>{sourceTitle}</strong>. Anda dapat mengubah data
                      sebelum menyimpannya.
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleResetSource}
                  >
                    <RiCloseLine className="mr-1 h-3 w-3" />
                    Batal Salin
                  </Button>
                </div>
              )}
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="">
              {visibleTabs.map((tab) => {
                const tabErrors = getTabErrors(tab.value);
                const hasError = tabErrors.length > 0;

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      hasError &&
                        'text-destructive data-[state=active]:text-destructive',
                    )}
                  >
                    {tab.label}
                    {hasError && (
                      <span className="ml-1.5 flex h-2 w-2 rounded-full bg-destructive" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <fieldset
              disabled={isLocked}
              className="contents disabled:pointer-events-none disabled:opacity-80"
            >
              {hasPermission('update need tab general') && (
                <TabsContent
                  value="usulan"
                  className="mt-0 focus-visible:outline-none"
                >
                  <GeneralInfoSection
                    data={data}
                    setData={setData}
                    errors={errors}
                    organizationalUnits={filteredOrganizationalUnits}
                    needTypes={needTypes}
                    handleVolumeChange={handleVolumeChange}
                    handleUnitPriceChange={handleUnitPriceChange}
                  />
                </TabsContent>
              )}

              {hasPermission('update need tab urgency') && (
                <TabsContent
                  value="urgency"
                  className="mt-0 focus-visible:outline-none"
                >
                  <PriorityStatusSection
                    data={data}
                    setData={setData}
                    errors={errors}
                  />
                </TabsContent>
              )}

              {hasPermission('update need tab strategic') && (
                <TabsContent
                  value="renstra"
                  className="mt-0 focus-visible:outline-none"
                >
                  <RenstraAlignmentSection
                    data={data}
                    setData={setData}
                    errors={errors}
                    tujuans={tujuans}
                    year={parseInt(data.year)}
                  />
                </TabsContent>
              )}

              {hasPermission('update need tab ikk') && (
                <TabsContent
                  value="ikk"
                  className="mt-0 focus-visible:outline-none"
                >
                  <IkkAlignmentSection
                    data={data}
                    setData={setData}
                    errors={errors}
                    kpiGroups={kpiGroups}
                    year={parseInt(data.year)}
                  />
                </TabsContent>
              )}

              {hasPermission('update need tab rls') && (
                <TabsContent
                  value="rls"
                  className="mt-0 focus-visible:outline-none"
                >
                  <RlsAlignmentSection
                    data={data}
                    setData={setData}
                    errors={errors}
                    strategicServicePlans={strategicServicePlans}
                  />
                </TabsContent>
              )}

              {hasPermission('update need tab planning') && (
                <TabsContent
                  value="perencanaan"
                  className="mt-0 focus-visible:outline-none"
                >
                  <PlanningAlignmentSection
                    data={data}
                    setData={setData}
                    errors={errors}
                    planningActivities={planningActivities}
                    year={parseInt(data.year)}
                  />
                </TabsContent>
              )}

              {hasPermission('update need tab detail') && (
                <TabsContent
                  value="detail"
                  className="mt-0 focus-visible:outline-none data-hidden:hidden"
                  keepMounted
                >
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
                      setData('technical_specification_attachment_names', names)
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
                </TabsContent>
              )}

              {hasPermission('update need tab lampiran') && (
                <TabsContent
                  value="lampiran"
                  className="mt-0 focus-visible:outline-none"
                >
                  <FileSection
                    files={data.attachments}
                    fileNames={data.attachment_names}
                    setFiles={(files) => setData('attachments', files)}
                    setFileNames={(names) => setData('attachment_names', names)}
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
                </TabsContent>
              )}
            </fieldset>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const targetGroupId = need?.need_group_id ?? currentGroup?.id;
              router.visit(
                targetGroupId
                  ? needRoutes.index.url({
                      query: { need_group_id: targetGroupId },
                    })
                  : needRoutes.index.url(),
              );
            }}
          >
            {isLocked ? 'Kembali' : 'Batal'}
          </Button>
          {!isLocked && (
            <Button type="submit" disabled={processing}>
              {isEditing ? 'Simpan Perubahan' : 'Tambah Usulan'}
            </Button>
          )}
        </CardFooter>
      </form>

      {!isEditing && currentGroup && (
        <UnapprovedNeedPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          targetGroupId={currentGroup.id}
          onSelect={handleSelectSource}
        />
      )}
    </Card>
  );
}
