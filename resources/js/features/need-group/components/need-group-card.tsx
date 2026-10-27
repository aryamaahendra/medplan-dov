import { Link } from '@inertiajs/react';
import {
  RiPulseLine,
  RiListCheck3,
  RiTimeLine,
  RiArrowRightLine,
  RiFireFill,
  RiVerifiedBadgeFill,
} from '@remixicon/react';

import { ActionDropdown } from '@/components/action-dropdown';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { formatCompactIDR, formatIDR } from '@/lib/formatters';
import groupRoutes from '@/routes/need-groups';
import needsRoutes from '@/routes/needs';
import type { NeedGroup } from '../types/need-group.types';
import {
  getGroupActions,
  getMetricsTelemetry,
  getSubmissionStatus,
  getTimelineTelemetry,
} from '../utils/need-group-helpers';

interface NeedGroupCardProps {
  group: NeedGroup;
  onEdit: (group: NeedGroup) => void;
  onDelete: (group: NeedGroup) => void;
  hasPermission: (permission: string) => boolean;
  onRollover?: (group: NeedGroup) => void;
}

export function NeedGroupCard({
  group,
  onEdit,
  onDelete,
  hasPermission,
  onRollover,
}: NeedGroupCardProps) {
  const windowStatus = getSubmissionStatus(group);
  const actions = getGroupActions(
    group,
    onEdit,
    onDelete,
    hasPermission,
    onRollover,
  );
  const metrics = getMetricsTelemetry(group);
  const timeline = getTimelineTelemetry(group);

  return (
    <article
      data-slot="need-group-card"
      className="relative w-full overflow-hidden rounded-2xl border bg-card p-4"
    >
      {/* Top Telemetry Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Monospace Year Code */}
          <Badge variant="outline" className="">
            <span className="text-muted-foreground">TA //</span>
            <span className="font-bold text-foreground">{group.year}</span>
          </Badge>

          {/* Status Pill */}
          <Badge
            variant={group.is_active ? 'default' : 'secondary'}
            className="font-mono text-xss"
          >
            <span
              className={`mr-1 size-1.5 rounded-full ${
                group.is_active ? 'bg-background' : 'bg-muted-foreground'
              }`}
            />
            {group.is_active ? 'SYS:AKTIF' : 'SYS:OFF'}
          </Badge>

          {/* Window Status Badge */}
          <Badge
            variant="outline"
            className={`font-mono text-xss ${windowStatus.badgeClass}`}
          >
            <span
              className={`mr-1.5 size-1.5 rounded-full ${windowStatus.dotClass}`}
            />
            {windowStatus.label.toUpperCase()}
          </Badge>

          {/* Days Remaining Pill */}
          <span className="rounded-md bg-muted/40 px-2 py-0.5 font-mono text-xss text-muted-foreground">
            {timeline.humanDiffText}
          </span>
        </div>

        {/* Top Right Budget Callout */}
        <div className="flex items-baseline gap-2 self-start lg:self-auto">
          <span className="font-mono text-xs text-muted-foreground uppercase">
            Total Pagu:
          </span>
          <span className="font-heading text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            {formatCompactIDR(metrics.totalBudget)}
          </span>
          <span className="hidden font-mono text-xss text-muted-foreground/80 xl:inline">
            ({formatIDR(metrics.totalBudget)})
          </span>
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="mt-3.5 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
            <Link
              href={needsRoutes.index.url({
                query: { need_group_id: group.id },
              })}
              className="transition-colors hover:text-foreground hover:underline"
            >
              {group.name}
            </Link>
          </h2>

          <div className="flex items-center gap-0.5">
            <Link
              href={groupRoutes.checklists.index.url({ need_group: group.id })}
              className={buttonVariants({ size: 'sm' })}
            >
              <RiListCheck3 />
              Checklist
            </Link>
            <ActionDropdown actions={actions} />
          </div>
        </div>

        {group.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {group.description}
          </p>
        )}
      </div>

      {/* Dual Telemetry Pipeline Visualization */}
      <div className="my-5 grid grid-cols-1 gap-3.5 lg:grid-cols-2 lg:gap-6">
        {/* Track A: Time Progression Track */}
        <div className="flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <RiTimeLine className="size-3.5 text-info" />
              PROGRES WAKTU
            </span>
            <span className="font-semibold text-foreground">
              {timeline.percentage}% ELAPSED
            </span>
          </div>

          <div className="relative h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                timeline.status === 'open'
                  ? 'bg-info'
                  : timeline.status === 'closed'
                    ? 'bg-muted-foreground/60'
                    : 'bg-primary'
              }`}
              style={{ width: `${timeline.percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between font-mono text-xss text-muted-foreground">
            <span>{timeline.startDateFormatted}</span>
            <RiArrowRightLine className="size-3 text-muted-foreground/40" />
            <span>{timeline.endDateFormatted}</span>
          </div>
        </div>

        {/* Track B: Approval Conversion Track */}
        <div className="flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <RiPulseLine className="size-3.5 text-success" />
              RASIO PERSETUJUAN
            </span>
            <span className="font-semibold text-success">
              {metrics.approvalRate}% VALID ({metrics.approvedCount}/
              {metrics.needCount})
            </span>
          </div>

          <div className="flex h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="bg-success transition-all duration-500"
              style={{ width: `${metrics.approvalRate}%` }}
              title={`Disetujui: ${metrics.approvedCount}`}
            />
            <div
              className="bg-warning transition-all duration-500"
              style={{ width: `${metrics.priorityRate}%` }}
              title={`Prioritas: ${metrics.priorityCount}`}
            />
          </div>

          <div className="flex items-center justify-between font-mono text-xss">
            <span className="text-success">
              {metrics.approvedCount} Disetujui
            </span>
            <span className="text-warning">
              {metrics.priorityCount} Prioritas
            </span>
            <span className="text-muted-foreground">
              {metrics.pendingCount} Menunggu
            </span>
          </div>
        </div>
      </div>

      {/* 4-Column Data HUD Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-4 sm:gap-3">
        {/* Metric 1 */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
          <div className="font-mono text-xss tracking-wider text-muted-foreground uppercase">
            Total Usulan
          </div>
          <div className="mt-1 font-heading text-lg font-bold text-foreground">
            {metrics.needCount}{' '}
            <span className="text-xs font-normal text-muted-foreground">
              Item
            </span>
          </div>
          <div className="text-xss text-muted-foreground">
            Terdaftar di grup
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
          <div className="font-mono text-xss tracking-wider text-muted-foreground uppercase">
            Rata-rata Pagu
          </div>
          <div className="mt-1 font-heading text-lg font-bold text-foreground">
            {metrics.avgBudgetFormatted}
          </div>
          <div className="text-xss text-muted-foreground">
            Per usulan kebutuhan
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
          <div className="flex items-center justify-between font-mono text-xss tracking-wider text-muted-foreground uppercase">
            <span>Urgensi</span>
            <RiFireFill className="size-3.5 text-warning" />
          </div>
          <div className="mt-1 font-heading text-lg font-bold text-warning">
            {metrics.priorityRate}%
          </div>
          <div className="text-xss text-muted-foreground">
            {metrics.priorityCount} Usulan prioritas
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
          <div className="flex items-center justify-between font-mono text-xss tracking-wider text-muted-foreground uppercase">
            <span>Validasi</span>
            <RiVerifiedBadgeFill className="size-3.5 text-success" />
          </div>
          <div className="mt-1 font-heading text-lg font-bold text-success">
            {metrics.approvalRate}%
          </div>
          <div className="text-xss text-muted-foreground">
            {metrics.approvedCount} Disahkan
          </div>
        </div>
      </div>
    </article>
  );
}
