import { router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import NeedController from '@/actions/App/Http/Controllers/Need/NeedController';
import { usePermission } from '@/hooks/use-permission';
import needRoutes from '@/routes/needs';
import type {
  Need,
  PlanningActivityVersion,
  StrategicServicePlan,
  Tujuan,
} from '@/types';

import { NeedFormVariant2 } from './forms/need-form-variant-2';
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

  const isLocked = !!(isEditing && need?.is_locked && !need?.can?.update);

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

  const filteredOrganizationalUnits =
    isRestricted && user?.organizational_unit_id
      ? organizationalUnits.filter(
          (unit) => unit.id === user.organizational_unit_id,
        )
      : organizationalUnits;
  const initialIsOrphaned = Boolean(
    isEditing && need?.organizational_unit_id && !need?.organizational_unit,
  );

  const { data, setData, post, processing, errors, transform } = useForm({
    need_group_id:
      need?.need_group_id?.toString() ?? currentGroup?.id?.toString() ?? '',
    source_need_id: (need as any)?.source_need_id?.toString() ?? '',
    organizational_unit_id: initialIsOrphaned
      ? ''
      : (need?.organizational_unit_id?.toString() ??
        (isRestricted ? user?.organizational_unit_id?.toString() : '') ??
        ''),
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

  const isOrphanedWithoutActiveSelection = Boolean(
    initialIsOrphaned &&
    (!data.organizational_unit_id ||
      !filteredOrganizationalUnits.some(
        (u) => u.id.toString() === data.organizational_unit_id?.toString(),
      )),
  );

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
      sasaran_ids:
        source.sasarans?.map((s: any) => s.id.toString()) ?? ([] as string[]),
      indicator_ids:
        source.indicators?.map((i: any) => i.id.toString()) ?? ([] as string[]),
      kpi_indicator_ids:
        source.kpi_indicators?.map((i: any) => i.id.toString()) ??
        ([] as string[]),
      strategic_service_plan_ids:
        source.strategic_service_plans?.map((i: any) => i.id.toString()) ??
        ([] as string[]),
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

    if (isOrphanedWithoutActiveSelection) {
      toast.error('Unit kerja aktif wajib dipilih sebelum menyimpan usulan.');

      return;
    }

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

  const onCancel = () => {
    const targetGroupId = need?.need_group_id ?? currentGroup?.id;
    router.visit(
      targetGroupId
        ? needRoutes.index.url({
            query: { need_group_id: targetGroupId },
          })
        : needRoutes.index.url(),
    );
  };

  const variantProps = {
    data,
    setData,
    errors,
    processing,
    isEditing,
    isLocked,
    currentGroup,
    need,
    isOrphaned: isOrphanedWithoutActiveSelection,
    initialIsOrphaned,
    organizationalUnits: filteredOrganizationalUnits,
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
  };

  return (
    <>
      <NeedFormVariant2 {...variantProps} />

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
