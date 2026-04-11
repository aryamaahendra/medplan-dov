import type {
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from '@dnd-kit/core';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AlertCircle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import type { AssignedQuestion } from '../types';
import { EmptyState } from './empty-state';
import { SortableItem } from './sortable-item';

interface Props {
  questions: AssignedQuestion[];
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragEnd: (event: DragEndEvent) => void;
  removeQuestion: (id: number) => void;
  toggleActive: (id: number) => void;
  toggleRequired: (id: number) => void;
}

export function QuestionList({
  questions,
  sensors,
  handleDragEnd,
  removeQuestion,
  toggleActive,
  toggleRequired,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-none py-0 ring-0">
        <CardContent className="p-0">
          {questions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={questions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {questions.map((q) => (
                    <SortableItem
                      key={q.id}
                      question={q}
                      onRemove={removeQuestion}
                      onToggleActive={toggleActive}
                      onToggleRequired={toggleRequired}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground italic">
        <AlertCircle className="size-4" />
        <span>
          Tarik dan lepas (drag & drop) untuk mengatur urutan pertanyaan.
        </span>
      </div>
    </div>
  );
}
