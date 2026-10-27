import { useForm } from '@inertiajs/react';
import { RiUploadLine } from '@remixicon/react';
import { useState } from 'react';
import { toast } from 'sonner';

import PlanningActivityVersionController from '@/actions/App/Http/Controllers/Planning/PlanningActivityVersionController';
import { FieldWrapper, FormGrid, InputField } from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { PlanningVersion } from '@/types/planning-version';

export function ActivityImportDialog({
  version,
}: {
  version: PlanningVersion;
}) {
  const [open, setOpen] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm<{
    file: File | null;
    start_cell: string;
    end_cell: string;
  }>({
    file: null,
    start_cell: 'A9',
    end_cell: 'O24',
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(PlanningActivityVersionController.import.url(version.id), {
      forceFormData: true,
      onSuccess: () => {
        toast.success('Data aktivitas berhasil diimpor!');
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);

        if (!val) {
          reset();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline">
            <RiUploadLine data-icon="inline-start" />
            Import
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Import Data Aktivitas</DialogTitle>
            <DialogDescription>
              Unggah file Excel (.xlsx, .ods) untuk mengimpor data aktivitas
              perencanaan beserta hierarki dan pagunya.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FieldWrapper id="file" label="File Excel" error={errors.file}>
              {({ id }) => (
                <Input
                  id={id}
                  type="file"
                  accept=".xlsx, .xls, .ods"
                  onChange={(e) =>
                    setData('file', e.target.files ? e.target.files[0] : null)
                  }
                />
              )}
            </FieldWrapper>
            <FormGrid cols={2}>
              <InputField
                id="start_cell"
                label="Start Cell"
                value={data.start_cell}
                onChange={(e) => setData('start_cell', e.target.value)}
                placeholder="A9"
                error={errors.start_cell}
              />
              <InputField
                id="end_cell"
                label="End Cell"
                value={data.end_cell}
                onChange={(e) => setData('end_cell', e.target.value)}
                placeholder="O24"
                error={errors.end_cell}
              />
            </FormGrid>
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div className="text-xss text-muted-foreground italic">
              * Anggaran akan dihitung ulang secara otomatis setelah impor
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={processing || !data.file}>
                {processing ? 'Mengimpor...' : 'Import Data'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
