import { RiAlertLine, RiCheckLine, RiCloseLine } from '@remixicon/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RoleMatrixSaveBarProps {
  isDirty: boolean;
  dirtyCount: number;
  isSaving: boolean;
  hasSelfLockoutRisk: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function RoleMatrixSaveBar({
  isDirty,
  dirtyCount,
  isSaving,
  hasSelfLockoutRisk,
  onSave,
  onDiscard,
}: RoleMatrixSaveBarProps) {
  if (!isDirty) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-full max-w-3xl -translate-x-1/2 animate-in px-4 duration-200 fade-in slide-in-from-bottom-4">
      <div className="flex flex-col items-center justify-between gap-3 rounded-xl border bg-background/95 p-4 shadow-xl backdrop-blur-md sm:flex-row">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="px-2.5 py-1 text-sm font-semibold"
          >
            {dirtyCount} Perubahan
          </Badge>
          <span className="text-sm font-medium text-foreground">
            Ada hak akses yang belum disimpan.
          </span>
          {hasSelfLockoutRisk && (
            <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
              <RiAlertLine className="size-4 shrink-0" />
              <span>Akses role Anda sendiri akan terhapus!</span>
            </div>
          )}
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
          >
            <RiCloseLine className="mr-1 size-4" />
            Batalkan
          </Button>
          <Button type="button" size="sm" onClick={onSave} disabled={isSaving}>
            <RiCheckLine className="mr-1 size-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
