import { router, useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';
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

interface NeedFormProps {
  need?: Need | null;
  currentGroup?: { id: number; name: string; year: number } | null;
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  needTypes: { id: number; name: string }[];
  tujuans: Tujuan[];
  kpiGroups: any[];
  strategicServicePlans: StrategicServicePlan[];
  planningActivities: PlanningActivityVersion[];
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
  className,
}: NeedFormProps) {
  const isEditing = !!need;

  const { auth } = usePage().props;
  const user = auth.user;
  const { hasRole, hasPermission } = usePermission();

  const isRestricted =
    !hasRole('super-admin') && !hasRole('admin') && !hasRole('planner');

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

  const { data, setData, post, processing, errors, transform } = useForm({
    need_group_id:
      need?.need_group_id?.toString() ?? currentGroup?.id?.toString() ?? '',
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
      procurement_organization_name:
        need?.detail?.procurement_organization_name ?? '',
      funding_source_and_estimated_cost:
        need?.detail?.funding_source_and_estimated_cost ?? '',
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
          <Tabs
            defaultValue={visibleTabs[0]?.value ?? 'usulan'}
            className="w-full"
          >
            <TabsList className="">
              {visibleTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

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
                className="mt-0 focus-visible:outline-none data-[state=inactive]:hidden"
                forceMount
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
          </Tabs>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.visit(needRoutes.index.url())}
          >
            Batal
          </Button>
          <Button type="submit" disabled={processing}>
            {isEditing ? 'Simpan Perubahan' : 'Tambah Usulan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
