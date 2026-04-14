import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';

import { useDataTable } from '@/hooks/use-data-table';
import type { DataTableFilters } from '@/hooks/use-data-table';
import strategicServicePlansRoutes from '@/routes/strategic-service-plans';
import type { StrategicServicePlan } from '@/types';
import { getColumns } from './columns';
import { StrategicServicePlanDialog } from './strategic-service-plan-dialog';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StrategicServicePlan | null>(
    null,
  );
  const [deletingPlan, setDeletingPlan] = useState<StrategicServicePlan | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { onSearch, onSort, onPageChange, onPerPageChange, onReset } =
    useDataTable({
      only: ['plans', 'filters'],
    });

  const onEdit = (plan: StrategicServicePlan) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const onCreate = () => {
    setEditingPlan(null);
    setDialogOpen(true);
  };

  const onDelete = (plan: StrategicServicePlan) => {
    setDeletingPlan(plan);
  };

  const handleConfirmDelete = () => {
    if (!deletingPlan) {
      return;
    }

    setIsDeleting(true);

    router.delete(
      strategicServicePlansRoutes.destroy.url({
        strategic_service_plan: deletingPlan.id,
      }),
      {
        onSuccess: () => {
          toast.success('Rencana pengembangan layanan berhasil dihapus.');
          setDeletingPlan(null);
        },
        onFinish: () => setIsDeleting(false),
      },
    );
  };

  const stableColumns = useMemo(
    () => getColumns(onEdit, onDelete),

    [],
  );

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
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Rencana
          </Button>
        </div>

        <DataTable
          columns={stableColumns}
          data={plans.data}
          meta={plans}
          filters={filters}
          onSearch={onSearch}
          onSort={onSort}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          onReset={onReset}
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
