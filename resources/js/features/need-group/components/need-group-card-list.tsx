import { RiAddLine, RiFolderChartLine } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import type { NeedGroup } from '../types/need-group.types';
import { NeedGroupCard } from './need-group-card';

interface NeedGroupCardListProps {
  needGroups: NeedGroup[];
  hasPermission: (permission: string) => boolean;
  onEdit: (group: NeedGroup) => void;
  onDelete: (group: NeedGroup) => void;
  onRollover: (group: NeedGroup) => void;
  onCreate: () => void;
  search?: string;
  onReset: () => void;
}

export function NeedGroupCardList({
  needGroups,
  hasPermission,
  onEdit,
  onDelete,
  onRollover,
  onCreate,
  search,
  onReset,
}: NeedGroupCardListProps) {
  if (needGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <RiFolderChartLine className="size-7" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
          Tidak Ada Kelompok Usulan
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {search
            ? `Tidak ditemukan kelompok usulan yang cocok dengan kata kunci "${search}". Silakan coba kata kunci lain.`
            : 'Belum ada kelompok usulan yang terdaftar. Tambahkan kelompok usulan pertama untuk memulai.'}
        </p>
        <div className="mt-6 flex items-center gap-3">
          {search ? (
            <Button variant="outline" size="sm" onClick={onReset}>
              Reset Pencarian
            </Button>
          ) : (
            hasPermission('create need-groups') && (
              <Button size="sm" onClick={onCreate}>
                <RiAddLine data-icon="inline-start" />
                Tambah Kelompok
              </Button>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {needGroups.map((group) => (
        <NeedGroupCard
          key={group.id}
          group={group}
          onEdit={onEdit}
          onDelete={onDelete}
          hasPermission={hasPermission}
          onRollover={onRollover}
        />
      ))}
    </div>
  );
}
