import { router } from '@inertiajs/react';
import {
  RiBriefcaseLine,
  RiDashboardLine,
  RiCalendarLine,
  RiTimeLine,
  RiExchangeLine,
  RiCheckLine,
  RiArrowDownSLine,
  RiLineChartLine,
} from '@remixicon/react';
import { useMemo, useState } from 'react';

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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type {
  DashboardGroupOption,
  DashboardVariant,
} from '@/types/needs-dashboard';

interface GlobalDashboardControlsProps {
  currentGroup: DashboardGroupOption | null;
  availableGroups: DashboardGroupOption[];
  variant: DashboardVariant;
  onVariantChange?: (variant: DashboardVariant) => void;
  onGroupSelect?: (group: DashboardGroupOption) => void;
  compareGroupId: number | null;
  onCompareGroupChange: (groupId: number | null) => void;
}

export function GlobalDashboardControls({
  currentGroup,
  availableGroups,
  variant,
  onVariantChange,
  onGroupSelect,
  compareGroupId,
  onCompareGroupChange,
}: GlobalDashboardControlsProps) {
  const [mountTime] = useState(() => Date.now());
  const windowStatusMeta = useMemo(() => {
    if (!currentGroup) {
      return { label: 'Tidak Aktif', variant: 'secondary' as const };
    }

    switch (currentGroup.window_status) {
      case 'open':
        return {
          label: 'Buka Pengajuan',
          color: 'bg-success',
        };
      case 'closed':
        return {
          label: 'Tutup',
          color: 'bg-destructive',
        };
      case 'upcoming':
        return {
          label: 'Mendatang',
          color: 'bg-warning',
        };
      default:
        return {
          label: 'Terbuka',
          color: 'bg-info',
        };
    }
  }, [currentGroup]);

  const daysRemainingText = useMemo(() => {
    if (!currentGroup?.submission_end_at) {
      return null;
    }

    const end = new Date(currentGroup.submission_end_at).getTime();
    const diffDays = Math.ceil((end - mountTime) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'Batas waktu berakhir';
    }

    return `Sisa ${diffDays} hari`;
  }, [currentGroup, mountTime]);

  const compareGroup = useMemo(
    () => availableGroups.find((g) => g.id === compareGroupId) || null,
    [availableGroups, compareGroupId],
  );

  const handleGroupSelect = (group: DashboardGroupOption) => {
    if (group.id === currentGroup?.id) {
      return;
    }

    if (onGroupSelect) {
      onGroupSelect(group);

      return;
    }

    router.visit(
      needRoutes.index.url({
        query: {
          need_group_id: group.id,
          ...(compareGroupId ? { compare_group_id: compareGroupId } : {}),
        },
      }),
      { preserveState: true },
    );
  };

  return (
    <div className="space-y-2">
      {/* Left: Need Group Selector and Window Status Badge */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="font-medium">
                  <RiCalendarLine
                    data-icon="inline-start"
                    className="text-muted-foreground"
                  />
                  <span>
                    {currentGroup
                      ? `${currentGroup.name} (${currentGroup.year})`
                      : 'Pilih Kelompok'}
                  </span>
                  <RiArrowDownSLine
                    data-icon="inline-end"
                    className="opacity-60"
                  />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-xs">
                Kelompok Usulan
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableGroups.map((group) => {
                const isSelected = group.id === currentGroup?.id;

                return (
                  <DropdownMenuItem
                    key={group.id}
                    onClick={() => handleGroupSelect(group)}
                    className="flex items-center justify-between text-xs"
                  >
                    <span
                      className={cn(
                        'truncate',
                        isSelected && 'font-semibold text-foreground',
                      )}
                    >
                      {group.name} ({group.year})
                    </span>
                    {isSelected && (
                      <RiCheckLine className="size-3.5 text-foreground" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Compare to previous group toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'text-muted-foreground hover:text-foreground',
                    compareGroupId &&
                      'bg-accent/60 font-medium text-foreground',
                  )}
                >
                  <RiExchangeLine data-icon="inline-start" />
                  <span>
                    {compareGroup
                      ? `vs ${compareGroup.year}`
                      : 'Bandingkan Periode'}
                  </span>
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel className="text-xs">
                Bandingkan dengan
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onCompareGroupChange(null)}
                className="text-xs text-muted-foreground"
              >
                Tanpa Pembanding
                {!compareGroupId && (
                  <RiCheckLine className="ml-auto size-3.5" />
                )}
              </DropdownMenuItem>
              {availableGroups
                .filter((g) => g.id !== currentGroup?.id)
                .map((group) => (
                  <DropdownMenuItem
                    key={group.id}
                    onClick={() => onCompareGroupChange(group.id)}
                    className="text-xs"
                  >
                    <span className="truncate">
                      {group.name} ({group.year})
                    </span>
                    {compareGroupId === group.id && (
                      <RiCheckLine className="ml-auto size-3.5 text-foreground" />
                    )}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Window status badge with countdown */}
        {currentGroup && (
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary">
              <span
                className={cn('size-2 rounded-full', windowStatusMeta.color)}
              />
              {windowStatusMeta.label}
            </Badge>

            {daysRemainingText && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <RiTimeLine className="size-3.5" />
                {daysRemainingText}
              </span>
            )}
          </div>
        )}

        {/* Right: 3-Variant Mode Switcher */}
        <Tabs
          value={variant}
          onValueChange={(val) => {
            const nextVariant = val as DashboardVariant;

            if (onVariantChange) {
              onVariantChange(nextVariant);
            } else {
              const path =
                nextVariant === 'executive'
                  ? '/dashboard/executive'
                  : nextVariant === 'operations'
                    ? '/dashboard/operations'
                    : '/dashboard/workspace';
              router.visit(
                `${path}?need_group_id=${currentGroup?.id ?? ''}${compareGroupId ? `&compare_group_id=${compareGroupId}` : ''}`,
              );
            }
          }}
        >
          <TabsList>
            <TabsTrigger value="executive">
              <RiBriefcaseLine data-icon="inline-start" />
              <span>Kebijakan & Anggaran</span>
            </TabsTrigger>
            <TabsTrigger value="operations">
              <RiDashboardLine data-icon="inline-start" />
              <span>Progres & Kepatuhan</span>
            </TabsTrigger>
            <TabsTrigger value="analytical">
              <RiLineChartLine data-icon="inline-start" />
              <span>Analisis & Renstra</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
