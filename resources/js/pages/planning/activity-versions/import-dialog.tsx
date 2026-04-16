import { useForm } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import PlanningActivityVersionController from '@/actions/App/Http/Controllers/Planning/PlanningActivityVersionController';
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
import { Label } from '@/components/ui/label';
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
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
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
            <div className="grid gap-2">
              <Label htmlFor="file">File Excel</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx, .xls, .ods"
                onChange={(e) =>
                  setData('file', e.target.files ? e.target.files[0] : null)
                }
              />
              {errors.file && (
                <p className="text-sm font-medium text-destructive">
                  {errors.file}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_cell">Start Cell</Label>
                <Input
                  id="start_cell"
                  value={data.start_cell}
                  onChange={(e) => setData('start_cell', e.target.value)}
                  placeholder="A9"
                />
                {errors.start_cell && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.start_cell}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_cell">End Cell</Label>
                <Input
                  id="end_cell"
                  value={data.end_cell}
                  onChange={(e) => setData('end_cell', e.target.value)}
                  placeholder="O24"
                />
                {errors.end_cell && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.end_cell}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div className="text-[10px] text-muted-foreground italic">
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
