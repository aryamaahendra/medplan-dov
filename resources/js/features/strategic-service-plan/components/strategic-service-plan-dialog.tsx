import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import StrategicServicePlanController from '@/actions/App/Http/Controllers/StrategicPlan/StrategicServicePlanController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
              <div className="grid gap-2">
                <Label htmlFor="year">Tahun</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  defaultValue={plan?.year ?? new Date().getFullYear()}
                  required
                  autoFocus
                />
                <InputError message={errors.year} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="strategic_program">Program Strategis</Label>
                <Input
                  id="strategic_program"
                  name="strategic_program"
                  defaultValue={plan?.strategic_program ?? ''}
                  required
                  placeholder="Nama program strategis"
                />
                <InputError message={errors.strategic_program} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service_plan">
                  Rencana Pengembangan Layanan
                </Label>
                <Textarea
                  id="service_plan"
                  name="service_plan"
                  defaultValue={plan?.service_plan ?? ''}
                  required
                  placeholder="Detail rencana pengembangan layanan"
                  rows={3}
                />
                <InputError message={errors.service_plan} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="target">Sasaran</Label>
                <Textarea
                  id="target"
                  name="target"
                  defaultValue={plan?.target ?? ''}
                  required
                  placeholder="Sasaran yang ingin dicapai"
                  rows={3}
                />
                <InputError message={errors.target} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="policy_direction">Arah Kebijakan</Label>
                <Textarea
                  id="policy_direction"
                  name="policy_direction"
                  defaultValue={plan?.policy_direction ?? ''}
                  required
                  placeholder="Arah kebijakan terkait"
                  rows={3}
                />
                <InputError message={errors.policy_direction} />
              </div>

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
