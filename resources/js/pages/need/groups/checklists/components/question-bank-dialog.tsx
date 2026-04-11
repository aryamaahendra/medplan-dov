import { AlertCircle, CheckCircle2, Plus, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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

import type { AssignedQuestion, ChecklistQuestion } from '../types';

interface QuestionBankDialogProps {
  availableQuestions: ChecklistQuestion[];
  assignedQuestions: AssignedQuestion[];
  onAdd: (question: ChecklistQuestion) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionBankDialog({
  availableQuestions,
  assignedQuestions,
  onAdd,
  open,
  onOpenChange,
}: QuestionBankDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus />
          Tambah dari Bank
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bank Pertanyaan Checklist</DialogTitle>
          <DialogDescription>
            Pilih pertanyaan dari bank untuk ditambahkan ke kelompok usulan ini.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto py-4 pr-2">
          {availableQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
              <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Belum ada pertanyaan di bank.
              </p>
            </div>
          ) : (
            availableQuestions.map((q) => {
              const isAssigned = assignedQuestions.some((aq) => aq.id === q.id);

              return (
                <div
                  key={q.id}
                  className={`flex items-start justify-between rounded-md border p-3 text-sm transition-colors ${
                    isAssigned ? 'bg-muted/50 opacity-60' : 'hover:bg-accent'
                  } ${!q.is_active ? 'border-dashed border-destructive/30' : ''}`}
                >
                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{q.question}</span>
                      {!q.is_active && (
                        <Badge
                          variant="destructive"
                          className="h-4 px-1 text-[10px] leading-none"
                        >
                          Non-aktif Global
                        </Badge>
                      )}
                    </div>
                    {q.description && (
                      <span className="text-xs text-muted-foreground">
                        {q.description}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={isAssigned ? 'ghost' : 'outline'}
                    className="ml-4 h-8 shrink-0"
                    disabled={isAssigned || !q.is_active}
                    onClick={() => onAdd(q)}
                  >
                    {isAssigned ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : !q.is_active ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      'Pilih'
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Selesai</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
