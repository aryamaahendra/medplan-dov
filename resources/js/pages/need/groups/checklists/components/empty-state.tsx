import { ClipboardList } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <ClipboardList className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">Belum ada Checklist</h3>
      <p className="mx-auto mb-6 max-w-xs text-sm text-muted-foreground">
        Kelompok usulan ini belum memiliki checklist pertanyaan. Klik tombol di
        atas untuk menambah dari bank pertanyaan.
      </p>
    </div>
  );
}
