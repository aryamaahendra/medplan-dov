import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import type { AssignedQuestion } from '../types';

interface SortableItemProps {
  question: AssignedQuestion;
  onRemove: (id: number) => void;
  onToggleActive: (id: number) => void;
  onToggleRequired: (id: number) => void;
}

export function SortableItem({
  question,
  onRemove,
  onToggleActive,
  onToggleRequired,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border bg-card transition-colors hover:bg-accent/50 ${isDragging ? 'border-dashed border-foreground/60 shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-4 px-4 py-3">
        <div className="flex shrink grow flex-col gap-1">
          <p className="truncate text-base font-medium">{question.question}</p>

          {question.description && (
            <p className="truncate text-sm text-muted-foreground">
              {question.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between gap-6 border-t px-4 py-2">
        <button
          type="button"
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Label
              htmlFor={`required-${question.id}`}
              className="cursor-pointer text-xs font-medium uppercase"
            >
              Wajib
            </Label>
            <Switch
              id={`required-${question.id}`}
              checked={question.is_required}
              onCheckedChange={() => onToggleRequired(question.id)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label
              htmlFor={`active-${question.id}`}
              className="cursor-pointer text-xs font-medium uppercase"
            >
              Aktif
            </Label>
            <Switch
              id={`active-${question.id}`}
              checked={question.is_active}
              onCheckedChange={() => onToggleActive(question.id)}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(question.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
