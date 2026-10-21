import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { getColumns } from '@/features/strategic-service-plan/components/strategic-service-plan-columns';
import { StrategicServicePlanDialog } from '@/features/strategic-service-plan/components/strategic-service-plan-dialog';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { usePermission } from '@/hooks/use-permission';
import { useResourceIndexController } from '@/hooks/use-resource-index-controller';
import type { PaginatedData } from '@/hooks/use-resource-index-controller';
import strategicServicePlansRoutes from '@/routes/strategic-service-plans';
import type { StrategicServicePlan } from '@/types';

interface StrategicServicePlansIndexProps {
  plans: PaginatedData<StrategicServicePlan>;
  filters: DataTableFilters;
}

export default function StrategicServicePlansIndex({
  plans,
  filters,
}: StrategicServicePlansIndexProps) {
  const { hasPermission } = usePermission();

  const controller = useResourceIndexController<StrategicServicePlan>({
    data: plans,
    filters,
    only: ['plans', 'filters'],
    resourceName: 'Rencana pengembangan layanan',
    deleteUrl: (plan) =>
      strategicServicePlansRoutes.destroy.url({
        strategic_service_plan: plan.id,
      }),
    getColumns: ({ onEdit, onDelete }) =>
      getColumns(onEdit, onDelete, hasPermission),
    searchPlaceholder: 'Cari program, rencana, sasaran...',
  });

  return (
    <>
      <Head title="Rencana Pengembangan Layanan Strategis" />

      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Rencana Pengembangan Layanan Strategis
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola data rencana pengembangan layanan strategis rumah sakit.
            </p>
          </div>
          {hasPermission('create ssps') && (
            <Button onClick={controller.dialog.openCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah Rencana
            </Button>
          )}
        </div>

        <DataTable {...controller.tableProps} />
      </div>

      <StrategicServicePlanDialog
        open={controller.dialog.isOpen}
        onOpenChange={controller.dialog.setIsOpen}
        plan={controller.dialog.editingItem}
      />

      <ConfirmDialog
        open={controller.deleteDialog.isOpen}
        onOpenChange={controller.deleteDialog.setIsOpen}
        onConfirm={controller.deleteDialog.confirmDelete}
        title="Hapus Rencana Pengembangan Layanan"
        description="Apakah Anda yakin ingin menghapus rencana pengembangan layanan ini? Tindakan ini dapat dibatalkan melalui fitur restorasi jika diperlukan."
        confirmText="Hapus"
        variant="destructive"
        loading={controller.deleteDialog.isDeleting}
      />
    </>
  );
}

StrategicServicePlansIndex.layout = {
  breadcrumbs: [
    {
      title: 'Rencana Pengembangan Layanan Strategis',
      href: strategicServicePlansRoutes.index.url(),
    },
  ],
};
