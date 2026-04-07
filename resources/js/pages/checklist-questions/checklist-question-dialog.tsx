import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import ChecklistQuestionController from '@/actions/App/Http/Controllers/ChecklistQuestionController';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import type { ChecklistQuestion } from './columns';

interface ChecklistQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: ChecklistQuestion | null;
}

export function ChecklistQuestionDialog({
  open,
  onOpenChange,
  question,
}: ChecklistQuestionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <ChecklistQuestionForm
          key={question?.id ?? 'new-question'}
          question={question}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ChecklistQuestionForm({
  question,
  onClose,
}: {
  question?: ChecklistQuestion | null;
  onClose: () => void;
}) {
  const isEditing = !!question;

  const { data, setData, submit, processing, errors } = useForm({
    question: question?.question ?? '',
    description: question?.description ?? '',
    order_column: question?.order_column ?? 0,
    is_active: question?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submit(
      isEditing
        ? ChecklistQuestionController.update({
            checklist_question: question.id,
          })
        : ChecklistQuestionController.store(),
      {
        onSuccess: () => {
          toast.success(
            isEditing
              ? 'Pertanyaan checklist berhasil diperbarui.'
              : 'Pertanyaan checklist berhasil dibuat.',
          );
          onClose();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {isEditing
            ? 'Ubah Pertanyaan Checklist'
            : 'Tambah Pertanyaan Checklist'}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Perbarui informasi pertanyaan checklist di sini.'
            : 'Masukan detail pertanyaan checklist baru di sini.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="question_text">Pertanyaan</Label>
          <Input
            id="question_text"
            value={data.question}
            onChange={(e) => setData('question', e.target.value)}
            placeholder="Contoh: Apakah usulan ini selaras dengan Renstra?"
            required
          />
          <InputError message={errors.question} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="order_column">Urutan</Label>
          <Input
            id="order_column"
            type="number"
            value={data.order_column}
            onChange={(e) => setData('order_column', parseInt(e.target.value))}
            min={0}
            required
          />
          <InputError message={errors.order_column} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            placeholder="Keterangan tambahan (opsional)..."
            rows={3}
          />
          <InputError message={errors.description} />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={data.is_active}
            onCheckedChange={(checked) => setData('is_active', checked)}
          />
          <Label htmlFor="is_active">Aktif</Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit" disabled={processing}>
          {isEditing ? 'Simpan Perubahan' : 'Tambah Pertanyaan'}
        </Button>
      </DialogFooter>
    </form>
  );
}
