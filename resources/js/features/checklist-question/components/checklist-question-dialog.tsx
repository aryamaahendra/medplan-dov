import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import ChecklistQuestionController from '@/actions/App/Http/Controllers/Need/ChecklistQuestionController';
import { InputField, SwitchField, TextareaField } from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ChecklistQuestion } from '../types/checklist-question.types';

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
      <DialogContent className="pb-0 sm:max-w-[425px]">
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
        <InputField
          id="question_text"
          label="Pertanyaan"
          value={data.question}
          onChange={(e) => setData('question', e.target.value)}
          placeholder="Contoh: Apakah usulan ini selaras dengan Renstra?"
          required
          error={errors.question}
        />

        <InputField
          id="order_column"
          type="number"
          label="Urutan"
          value={data.order_column}
          onChange={(e) =>
            setData('order_column', parseInt(e.target.value) || 0)
          }
          min={0}
          required
          error={errors.order_column}
        />

        <TextareaField
          id="description"
          label="Deskripsi"
          value={data.description}
          onChange={(e) => setData('description', e.target.value)}
          placeholder="Keterangan tambahan (opsional)..."
          rows={3}
          error={errors.description}
        />

        <SwitchField
          id="is_active"
          label="Aktif"
          checked={data.is_active}
          onCheckedChange={(checked) => setData('is_active', checked)}
          error={errors.is_active}
        />
      </div>

      <DialogFooter className="mb-0!">
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
