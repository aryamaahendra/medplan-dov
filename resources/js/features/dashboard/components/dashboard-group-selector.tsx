import { router } from '@inertiajs/react';
import {
  RiArrowDownSLine,
  RiCalendarLine,
  RiCheckLine,
  RiLockFill,
  RiTimeFill,
} from '@remixicon/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { DashboardGroupOption } from '@/types/needs-dashboard';

interface DashboardGroupSelectorProps {
  currentGroup: DashboardGroupOption | null;
  availableGroups: DashboardGroupOption[];
  onGroupSelect?: (group: DashboardGroupOption) => void;
  className?: string;
}

interface RemainingTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateRemaining(targetIso: string | null): RemainingTime | null {
  if (!targetIso) {
    return null;
  }

  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: false };
}

export function DashboardGroupSelector({
  currentGroup,
  availableGroups,
  onGroupSelect,
  className,
}: DashboardGroupSelectorProps) {
  const [prevGroupId, setPrevGroupId] = useState(currentGroup?.id);
  const [remaining, setRemaining] = useState<RemainingTime | null>(() => {
    if (
      !currentGroup?.submission_end_at ||
      currentGroup.window_status === 'closed' ||
      !currentGroup.is_active
    ) {
      return null;
    }

    return calculateRemaining(currentGroup.submission_end_at);
  });

  const notifiedExpiredRef = useRef(false);

  if (currentGroup?.id !== prevGroupId) {
    setPrevGroupId(currentGroup?.id);
    setRemaining(
      !currentGroup?.submission_end_at ||
        currentGroup.window_status === 'closed' ||
        !currentGroup.is_active
        ? null
        : calculateRemaining(currentGroup.submission_end_at),
    );
  }

  useEffect(() => {
    if (
      !currentGroup?.submission_end_at ||
      currentGroup.window_status === 'closed' ||
      !currentGroup.is_active
    ) {
      return;
    }

    const timer = setInterval(() => {
      const updated = calculateRemaining(currentGroup.submission_end_at);

      setRemaining(updated);

      if (updated?.isExpired && !notifiedExpiredRef.current) {
        notifiedExpiredRef.current = true;
        toast.warning('Batas waktu pengusulan siklus telah ditutup.');
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [currentGroup]);

  const isLocked = useMemo(() => {
    if (!currentGroup) {
      return true;
    }

    if (!currentGroup.is_active) {
      return true;
    }

    if (currentGroup.window_status === 'closed') {
      return true;
    }

    if (remaining?.isExpired) {
      return true;
    }

    return false;
  }, [currentGroup, remaining]);

  const handleSelect = (group: DashboardGroupOption) => {
    if (group.id === currentGroup?.id) {
      return;
    }

    if (onGroupSelect) {
      onGroupSelect(group);

      return;
    }

    router.visit(`/dashboard?need_group_id=${group.id}`, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  const timerText = useMemo(() => {
    if (!remaining || remaining.isExpired) {
      return null;
    }

    const { days, hours, minutes, seconds } = remaining;
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');

    if (days > 0) {
      return `${days}h ${h}:${m}:${s}`;
    }

    return `${h}:${m}:${s}`;
  }, [remaining]);

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2 border-border/80 px-3 font-medium transition-colors hover:bg-muted/60"
            />
          }
        >
          <RiCalendarLine className="size-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">
            {currentGroup
              ? `${currentGroup.name} (${currentGroup.year})`
              : 'Pilih Siklus Kebutuhan'}
          </span>
          <RiArrowDownSLine className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Daftar Siklus Pengusulan</span>
            <span>Status</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {availableGroups.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">
              Tidak ada siklus kebutuhan yang tersedia.
            </div>
          ) : (
            availableGroups.map((group) => {
              const isSelected = group.id === currentGroup?.id;
              const groupLocked =
                !group.is_active || group.window_status === 'closed';

              return (
                <DropdownMenuItem
                  key={group.id}
                  onClick={() => handleSelect(group)}
                  className={cn(
                    'flex items-center justify-between gap-2 py-2',
                    isSelected && 'bg-accent/60 font-medium',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <RiCheckLine className="size-4 text-primary" />
                    ) : (
                      <span className="size-4" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground">
                        {group.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Tahun Anggaran {group.year}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={groupLocked ? 'outline' : 'secondary'}
                    className={cn(
                      'text-[10px]',
                      groupLocked
                        ? 'border-muted text-muted-foreground'
                        : 'bg-success/15 text-success dark:bg-success/20',
                    )}
                  >
                    {groupLocked ? 'Terkunci' : 'Aktif'}
                  </Badge>
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Lock or Countdown Status Badge */}
      <div className="flex items-center gap-2">
        {isLocked ? (
          <Badge
            variant="outline"
            className="h-8 gap-1.5 rounded-lg! border-border/80 bg-muted/30 px-3 text-xs text-muted-foreground"
          >
            <RiLockFill className="size-3.5" />
            <span>Terkunci / Selesai</span>
          </Badge>
        ) : timerText ? (
          <Badge
            variant="secondary"
            className="h-8 gap-1.5 rounded-lg! bg-success/15 px-3 font-mono text-xs font-semibold text-success-foreground dark:bg-success/20"
          >
            <RiTimeFill className="size-3.5" />
            <p className="mt-px">Sisa Waktu: {timerText}</p>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="h-8 gap-1.5 rounded-lg! border-dashed border-border/80 px-3 text-xs text-muted-foreground"
          >
            <RiTimeFill className="size-3.5" />
            <span>Bebas Waktu (Tanpa Batas)</span>
          </Badge>
        )}
      </div>
    </div>
  );
}
