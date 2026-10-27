import {
  RiAddLine,
  RiArrowDownDoubleLine,
  RiArrowUpDoubleLine,
  RiCloseLine,
  RiSearchLine,
} from '@remixicon/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RoleMatrixToolbarProps {
  canCreate: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onCreateRole: () => void;
}

export function RoleMatrixToolbar({
  canCreate,
  searchQuery,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
  onCreateRole,
}: RoleMatrixToolbarProps) {
  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Role & Hak Akses
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Kelola role dan konfigurasi matriks hak akses pengguna dalam satu
            halaman.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <Button onClick={onCreateRole}>
              <RiAddLine className="mr-1.5 size-4" />
              Tambah Role
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <RiSearchLine className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari hak akses atau modul..."
            className="pr-8 pl-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Bersihkan pencarian"
            >
              <RiCloseLine className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExpandAll}
            title="Buka semua modul"
          >
            <RiArrowDownDoubleLine className="mr-1 size-3.5" />
            Buka Semua
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCollapseAll}
            title="Tutup semua modul"
          >
            <RiArrowUpDoubleLine className="mr-1 size-3.5" />
            Tutup Semua
          </Button>
        </div>
      </div>
    </>
  );
}
