import { useNeedForm } from '@/features/need/hooks/use-need-form';
import type {
  KpiGroup,
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
  const {
    isEditing,
    isLocked,
    isOrphaned,
    initialIsOrphaned,
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

  const variantProps = {
    data,
    setData,
    errors,
    processing,
    isEditing,
    isLocked,
    currentGroup,
    need,
    isOrphaned,
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
