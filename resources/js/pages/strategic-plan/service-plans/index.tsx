import { Head } from '@inertiajs/react';
import { RiAddLine } from '@remixicon/react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { StrategicServicePlanDialog } from '@/features/strategic-service-plan/components/strategic-service-plan-dialog';
import { useStrategicServicePlansIndex } from '@/features/strategic-service-plan/hooks/use-strategic-service-plans-index';
import type { DataTableFilters } from '@/hooks/use-data-table';
import strategicServicePlansRoutes from '@/routes/strategic-service-plans';
import type { StrategicServicePlan } from '@/types';

interface PaginatedStrategicServicePlans {
  data: StrategicServicePlan[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface StrategicServicePlansIndexProps {
  plans: PaginatedStrategicServicePlans;
  filters: DataTableFilters;
}

export default function StrategicServicePlansIndex({
  plans,
  filters,
}: StrategicServicePlansIndexProps) {
  const {
    hasPermission,
    dialogOpen,
    setDialogOpen,
    editingPlan,
    deletingPlan,
    setDeletingPlan,
    isDeleting,
    onCreate,
    handleConfirmDelete,
    columns,
    dataTable,
  } = useStrategicServicePlansIndex();

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
            <Button onClick={onCreate}>
              <RiAddLine data-icon="inline-start" />
              Tambah Rencana
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={plans.data}
          meta={plans}
          filters={filters}
          {...dataTable}
          searchPlaceholder="Cari program, rencana, sasaran..."
        />
      </div>

      <StrategicServicePlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={editingPlan}
      />

      <ConfirmDialog
        open={!!deletingPlan}
        onOpenChange={(open) => !open && setDeletingPlan(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Rencana Pengembangan Layanan"
        description="Apakah Anda yakin ingin menghapus rencana pengembangan layanan ini? Tindakan ini dapat dibatalkan melalui fitur restorasi jika diperlukan."
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
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
