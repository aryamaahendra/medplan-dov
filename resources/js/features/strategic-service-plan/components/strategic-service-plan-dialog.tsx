import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import StrategicServicePlanController from '@/actions/App/Http/Controllers/StrategicPlan/StrategicServicePlanController';
import { InputField, TextareaField } from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { StrategicServicePlan } from '@/types';

interface StrategicServicePlanDialogProps {
  plan?: StrategicServicePlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StrategicServicePlanDialog({
  plan,
  open,
  onOpenChange,
}: StrategicServicePlanDialogProps) {
  const isEditing = !!plan;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="no-scrollbar max-h-[90vh] overflow-y-auto pb-0 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? 'Edit Rencana Pengembangan Layanan'
              : 'Tambah Rencana Pengembangan Layanan'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Perbarui detail rencana pengembangan layanan strategis.'
              : 'Tambah rencana pengembangan layanan strategis baru ke dalam sistem.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          key={plan?.id ?? 'new-plan'}
          {...(isEditing
            ? StrategicServicePlanController.update.form({
                strategic_service_plan: plan.id,
              })
            : StrategicServicePlanController.store.form())}
          onSuccess={() => {
            onOpenChange(false);
            toast.success(
              isEditing
                ? 'Rencana pengembangan layanan diperbarui.'
                : 'Rencana pengembangan layanan dibuat.',
            );
          }}
          className="space-y-4"
        >
          {({ processing, errors }) => (
            <>
              <InputField
                id="year"
                name="year"
                type="number"
                label="Tahun"
                defaultValue={plan?.year ?? new Date().getFullYear()}
                required
                autoFocus
                error={errors.year}
              />

              <InputField
                id="strategic_program"
                name="strategic_program"
                label="Program Strategis"
                defaultValue={plan?.strategic_program ?? ''}
                required
                placeholder="Nama program strategis"
                error={errors.strategic_program}
              />

              <TextareaField
                id="service_plan"
                name="service_plan"
                label="Rencana Pengembangan Layanan"
                defaultValue={plan?.service_plan ?? ''}
                required
                placeholder="Detail rencana pengembangan layanan"
                rows={3}
                error={errors.service_plan}
              />

              <TextareaField
                id="target"
                name="target"
                label="Sasaran"
                defaultValue={plan?.target ?? ''}
                required
                placeholder="Sasaran yang ingin dicapai"
                rows={3}
                error={errors.target}
              />

              <TextareaField
                id="policy_direction"
                name="policy_direction"
                label="Arah Kebijakan"
                defaultValue={plan?.policy_direction ?? ''}
                required
                placeholder="Arah kebijakan terkait"
                rows={3}
                error={errors.policy_direction}
              />
              <DialogFooter className="mb-0!">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  {isEditing
                    ? 'Simpan Perubahan'
                    : 'Tambah Rencana Pengembangan Layanan'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
