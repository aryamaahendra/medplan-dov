import { router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { KpiIndicator } from '@/types';
import { IndicatorTable } from './indicator-table';
import KpiIndicatorController from '@/actions/App/Http/Controllers/KpiIndicatorController';

interface IndicatorCardProps {
  indicator: KpiIndicator;
  yearStart?: number;
  yearEnd?: number;
  onEdit?: (indicator: KpiIndicator) => void;
  onDelete?: (indicator: KpiIndicator) => void;
  onCreateChild?: (parent: KpiIndicator) => void;
  depth?: number;
}

export function IndicatorCard({
  indicator,
  yearStart,
  yearEnd,
  onEdit,
  onDelete,
  onCreateChild,
  depth = 0,
}: IndicatorCardProps) {
  const { leafIndicators, childCategories } = useMemo(() => {
    const leafIndicators: KpiIndicator[] = [];
    const childCategories: KpiIndicator[] = [];

    (indicator.indicators || []).forEach((child) => {
      if (child.is_category) {
        childCategories.push(child);
      } else {
        leafIndicators.push(child);
      }
    });

    return { leafIndicators, childCategories };
  }, [indicator.indicators]);

  const [deletingIndicator, setDeletingIndicator] =
    useState<KpiIndicator | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (!deletingIndicator) {
      return;
    }

    if (onDelete) {
      onDelete(deletingIndicator);
      setDeletingIndicator(null);

      return;
    }

    setIsDeleting(true);
    router.delete(
      KpiIndicatorController.destroy.url({ indicator: deletingIndicator.id }),
      {
        onSuccess: () => {
          toast.success('Berhasil dihapus.');
          setDeletingIndicator(null);
        },
        onFinish: () => setIsDeleting(false),
      },
    );
  };

  const showActions = !!onEdit || !!onCreateChild || !!onDelete;

  if (indicator.is_category) {
    return (
      <Card className={cn('overflow-hidden', depth > 0 && 'rounded-none')}>
        <CardHeader>
          <CardTitle>{indicator.name}</CardTitle>
          <CardDescription>Kategori Level {depth + 1}</CardDescription>
          {showActions && (
            <CardAction>
              {onCreateChild && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreateChild(indicator)}
                >
                  <Plus /> Tambah Sub
                </Button>
              )}
              {onEdit && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => onEdit(indicator)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setDeletingIndicator(indicator)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardAction>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {indicator.indicators && indicator.indicators.length > 0 ? (
            <div className="flex flex-col gap-0 bg-background">
              {leafIndicators.length > 0 && (
                <div className="border-y">
                  <IndicatorTable
                    indicators={leafIndicators}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    yearStart={yearStart}
                    yearEnd={yearEnd}
                  />
                </div>
              )}

              {childCategories.length > 0 && (
                <div className="mt-3 flex flex-col gap-4 bg-muted/5">
                  {childCategories.map((child) => (
                    <IndicatorCard
                      key={child.id}
                      indicator={child}
                      yearStart={yearStart}
                      yearEnd={yearEnd}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onCreateChild={onCreateChild}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground italic">
              Kategori ini belum memiliki indikator.
            </div>
          )}
        </CardContent>

        <ConfirmDialog
          open={!!deletingIndicator}
          onOpenChange={(open) => !open && setDeletingIndicator(null)}
          onConfirm={handleDelete}
          title="Hapus Kategori"
          description={`Apakah Anda yakin ingin menghapus kategori "${deletingIndicator?.name}" beserta seluruh isinya?`}
          confirmText="Hapus"
          variant="destructive"
          loading={isDeleting}
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-l-2 shadow-sm">
      <div className="flex items-center justify-between border-b bg-muted/10 p-3">
        <div>
          <h4 className="font-medium text-primary/90">{indicator.name}</h4>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Indikator
          </span>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => onEdit(indicator)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => setDeletingIndicator(indicator)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      <IndicatorTable
        indicators={[indicator]}
        onEdit={onEdit}
        onDelete={onDelete}
        yearStart={yearStart}
        yearEnd={yearEnd}
        hideHeader={true}
      />

      <ConfirmDialog
        open={!!deletingIndicator}
        onOpenChange={(open) => !open && setDeletingIndicator(null)}
        onConfirm={handleDelete}
        title="Hapus Indikator"
        description={`Apakah Anda yakin ingin menghapus indikator "${deletingIndicator?.name}"?`}
        confirmText="Hapus"
        variant="destructive"
        loading={isDeleting}
      />
    </Card>
  );
}
