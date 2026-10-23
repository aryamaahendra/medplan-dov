import { Link } from '@inertiajs/react';
import {
  RiArrowDownSLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiBuildingLine,
  RiCollapseDiagonalLine,
  RiExpandDiagonalLine,
  RiSearchLine,
} from '@remixicon/react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePermission } from '@/hooks/use-permission';
import { formatCompactIDR, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';
import type { UnitProgressItem } from '@/types/needs-dashboard';

interface OrganizationTreeVisualizerProps {
  groupId?: number;
  allUnitProgress: UnitProgressItem[];
  userUnitId?: number | null;
  className?: string;
}

export interface AggregatedMetrics {
  total_budget: number;
  total_needs: number;
  approved_count: number;
  under_review_count: number;
  draft_count: number;
  rejected_count: number;
  subunits_count: number;
}

export interface TreeNode {
  item: UnitProgressItem;
  children: TreeNode[];
  aggregate: AggregatedMetrics;
}

function calculateAggregate(
  item: UnitProgressItem,
  children: TreeNode[],
): AggregatedMetrics {
  const selfBudget = Number(item.total_budget || 0);
  const selfNeeds = Number(item.total_needs || 0);
  const selfApproved = Number(item.approved_count || 0);
  const selfUnderReview = Number(item.under_review_count || 0);
  const selfDraft = Number(item.draft_count || 0);
  const selfRejected = Number(item.rejected_count || 0);

  let childrenBudget = 0;
  let childrenNeeds = 0;
  let childrenApproved = 0;
  let childrenUnderReview = 0;
  let childrenDraft = 0;
  let childrenRejected = 0;
  let totalSubunits = children.length;

  for (const child of children) {
    childrenBudget += child.aggregate.total_budget;
    childrenNeeds += child.aggregate.total_needs;
    childrenApproved += child.aggregate.approved_count;
    childrenUnderReview += child.aggregate.under_review_count;
    childrenDraft += child.aggregate.draft_count;
    childrenRejected += child.aggregate.rejected_count;
    totalSubunits += child.aggregate.subunits_count;
  }

  return {
    total_budget: selfBudget + childrenBudget,
    total_needs: selfNeeds + childrenNeeds,
    approved_count: selfApproved + childrenApproved,
    under_review_count: selfUnderReview + childrenUnderReview,
    draft_count: selfDraft + childrenDraft,
    rejected_count: selfRejected + childrenRejected,
    subunits_count: totalSubunits,
  };
}

function buildTreeNodes(
  items: UnitProgressItem[],
  userUnitId?: number | null,
  isRestrictedRole = false,
): TreeNode[] {
  const itemMap = new Map<number, TreeNode>();
  const childrenMap = new Map<number, TreeNode[]>();

  for (const item of items) {
    const emptyAggregate: AggregatedMetrics = {
      total_budget: 0,
      total_needs: 0,
      approved_count: 0,
      under_review_count: 0,
      draft_count: 0,
      rejected_count: 0,
      subunits_count: 0,
    };

    const node: TreeNode = {
      item,
      children: [],
      aggregate: emptyAggregate,
    };

    itemMap.set(item.unit_id, node);
    childrenMap.set(item.unit_id, []);
  }

  const roots: TreeNode[] = [];

  for (const item of items) {
    const node = itemMap.get(item.unit_id);

    if (!node) {
      continue;
    }

    if (
      item.parent_id !== null &&
      item.parent_id !== undefined &&
      itemMap.has(item.parent_id)
    ) {
      childrenMap.get(item.parent_id)!.push(node);
    } else {
      roots.push(node);
    }
  }

  function assembleAndAggregate(node: TreeNode): void {
    const children = childrenMap.get(node.item.unit_id) || [];

    for (const child of children) {
      assembleAndAggregate(child);
    }

    node.children = children;
    node.aggregate = calculateAggregate(node.item, children);
  }

  for (const root of roots) {
    assembleAndAggregate(root);
  }

  if (
    isRestrictedRole &&
    typeof userUnitId === 'number' &&
    itemMap.has(userUnitId)
  ) {
    return [itemMap.get(userUnitId)!];
  }

  return roots;
}

function collectAllUnitIds(nodes: TreeNode[]): number[] {
  const ids: number[] = [];

  function recurse(list: TreeNode[]) {
    for (const node of list) {
      ids.push(node.item.unit_id);

      if (node.children.length > 0) {
        recurse(node.children);
      }
    }
  }

  recurse(nodes);

  return ids;
}

function filterTree(
  nodes: TreeNode[],
  searchTerm: string,
): {
  filtered: TreeNode[];
  matchingIds: Set<number>;
  expandedIds: Set<number>;
} {
  const matchingIds = new Set<number>();
  const expandedIds = new Set<number>();
  const lowerSearch = searchTerm.toLowerCase().trim();

  if (!lowerSearch) {
    return { filtered: nodes, matchingIds, expandedIds };
  }

  function checkMatch(node: TreeNode): boolean {
    const nameMatch = node.item.name.toLowerCase().includes(lowerSearch);

    if (nameMatch) {
      matchingIds.add(node.item.unit_id);
    }

    let anyChildMatched = false;

    for (const child of node.children) {
      if (checkMatch(child)) {
        anyChildMatched = true;
      }
    }

    if (nameMatch || anyChildMatched) {
      expandedIds.add(node.item.unit_id);

      return true;
    }

    return false;
  }

  for (const root of nodes) {
    checkMatch(root);
  }

  function prune(list: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];

    for (const node of list) {
      const isMatched = matchingIds.has(node.item.unit_id);
      const filteredChildren = prune(node.children);

      if (isMatched || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren,
        });
      }
    }

    return result;
  }

  return {
    filtered: prune(nodes),
    matchingIds,
    expandedIds,
  };
}

/* -------------------------------------------------------------------------- */
/* Compact Tree View Component                                                */
/* -------------------------------------------------------------------------- */

interface TreeNodeRowProps {
  node: TreeNode;
  groupId?: number;
  expandedMap: Record<number, boolean>;
  onToggleExpand: (unitId: number) => void;
  isMatch?: boolean;
}

function TreeNodeRow({
  node,
  groupId,
  expandedMap,
  onToggleExpand,
  isMatch,
}: TreeNodeRowProps) {
  const { item, children, aggregate } = node;
  const hasChildren = children.length > 0;
  const isExpanded = expandedMap[item.unit_id] ?? true;

  const total = aggregate.total_needs;
  const approvedPct =
    total > 0 ? Math.round((aggregate.approved_count / total) * 100) : 0;
  const reviewPct =
    total > 0 ? Math.round((aggregate.under_review_count / total) * 100) : 0;
  const draftPct =
    total > 0 ? Math.round((aggregate.draft_count / total) * 100) : 0;
  const rejectedPct =
    total > 0 ? Math.round((aggregate.rejected_count / total) * 100) : 0;

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'group flex items-center justify-between gap-3 rounded-md border border-border/70 bg-card px-2.5 py-1.5 transition-all hover:border-primary/40 hover:bg-accent/30',
          isMatch && 'border-primary/60 bg-primary/5 ring-1 ring-primary/30',
        )}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleExpand(item.unit_id)}
              className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={isExpanded ? 'Tutup sub-unit' : 'Buka sub-unit'}
            >
              {isExpanded ? (
                <RiArrowDownSLine className="size-3.5" />
              ) : (
                <RiArrowRightSLine className="size-3.5" />
              )}
            </button>
          ) : (
            <span className="size-5 shrink-0" />
          )}

          <div className="flex min-w-0 items-center gap-2">
            <RiBuildingLine className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-xs font-semibold text-foreground">
                {item.name}
              </span>

              {hasChildren && (
                <Badge
                  variant="outline"
                  className="h-4 px-1 text-[9px] font-normal text-muted-foreground"
                >
                  +{aggregate.subunits_count} sub
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-foreground">
              {formatCompactIDR(aggregate.total_budget)}
            </span>
            <Badge
              variant="secondary"
              className="h-4.5 px-1.5 font-mono text-[10px]"
            >
              {formatNumber(aggregate.total_needs)} usulan
            </Badge>

            {total > 0 ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="flex h-1.5 w-20 cursor-pointer overflow-hidden rounded-full bg-muted" />
                  }
                >
                  {approvedPct > 0 && (
                    <div
                      style={{ width: `${approvedPct}%` }}
                      className="bg-success"
                    />
                  )}
                  {reviewPct > 0 && (
                    <div
                      style={{ width: `${reviewPct}%` }}
                      className="bg-warning"
                    />
                  )}
                  {draftPct > 0 && (
                    <div
                      style={{ width: `${draftPct}%` }}
                      className="bg-muted-foreground/40"
                    />
                  )}
                  {rejectedPct > 0 && (
                    <div
                      style={{ width: `${rejectedPct}%` }}
                      className="bg-destructive"
                    />
                  )}
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span>Agregat (Induk & Cabang):</span>
                    <span>
                      Disetujui: {aggregate.approved_count} ({approvedPct}%)
                    </span>
                    <span>
                      Menunggu Review: {aggregate.under_review_count} (
                      {reviewPct}%)
                    </span>
                    <span>
                      Draft: {aggregate.draft_count} ({draftPct}%)
                    </span>
                    <span>
                      Revisi: {aggregate.rejected_count} ({rejectedPct}%)
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>

          <Link
            href={needRoutes.index.url({
              query: {
                need_group_id: groupId,
                organizational_unit_id: [item.unit_id.toString()],
                include_descendants: 1,
              },
            })}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
              'size-5 text-muted-foreground hover:text-primary',
            )}
            title={`Buka usulan ${item.name}`}
          >
            <RiArrowRightLine className="size-3" />
          </Link>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="relative mt-1.5 ml-3 flex flex-col gap-1.5 border-l border-border/70 pl-2.5">
          {children.map((childNode) => (
            <TreeNodeRow
              key={childNode.item.unit_id}
              node={childNode}
              groupId={groupId}
              expandedMap={expandedMap}
              onToggleExpand={onToggleExpand}
              isMatch={isMatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component (Borderless Section Container)                             */
/* -------------------------------------------------------------------------- */

export function OrganizationTreeVisualizer({
  groupId,
  allUnitProgress,
  userUnitId,
  className,
}: OrganizationTreeVisualizerProps) {
  const { hasRole } = usePermission();
  const isRestrictedRole = hasRole('unit-head') || hasRole('staff');

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({});

  const rootTree = useMemo(() => {
    return buildTreeNodes(allUnitProgress, userUnitId, isRestrictedRole);
  }, [allUnitProgress, userUnitId, isRestrictedRole]);

  const { filtered, matchingIds, expandedIds } = useMemo(() => {
    return filterTree(rootTree, searchTerm);
  }, [rootTree, searchTerm]);

  const activeExpandedMap = useMemo(() => {
    const combined = { ...expandedMap };

    for (const id of expandedIds) {
      combined[id] = true;
    }

    return combined;
  }, [expandedMap, expandedIds]);

  const handleToggleExpand = (unitId: number) => {
    setExpandedMap((prev) => ({
      ...prev,
      [unitId]: !(prev[unitId] ?? true),
    }));
  };

  const handleExpandAll = () => {
    const allIds = collectAllUnitIds(rootTree);
    const nextMap: Record<number, boolean> = {};

    for (const id of allIds) {
      nextMap[id] = true;
    }

    setExpandedMap(nextMap);
  };

  const handleCollapseAll = () => {
    const allIds = collectAllUnitIds(rootTree);
    const nextMap: Record<number, boolean> = {};

    for (const id of allIds) {
      nextMap[id] = false;
    }

    setExpandedMap(nextMap);
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Section Header without Card Wrapper */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <RiBuildingLine className="size-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Hierarki Struktur Organisasi & Pengusulan
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Struktur pohon unit kerja, total beban anggaran agregat (termasuk
            sub-unit), dan progres usulan
          </p>
        </div>

        {/* Tree Controls: Expand All / Collapse All */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="xs"
            onClick={handleExpandAll}
            className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RiExpandDiagonalLine className="size-3" />
            <span>Buka Semua</span>
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={handleCollapseAll}
            className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RiCollapseDiagonalLine className="size-3" />
            <span>Tutup Semua</span>
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <RiSearchLine className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nama unit kerja..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8 pl-8 text-xs"
        />
      </div>

      {/* Tree View Rendering */}
      {filtered.length === 0 ? (
        <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
          {searchTerm
            ? `Tidak ditemukan unit kerja yang cocok dengan "${searchTerm}".`
            : 'Tidak ada data struktur unit kerja.'}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.map((node) => (
            <TreeNodeRow
              key={node.item.unit_id}
              node={node}
              groupId={groupId}
              expandedMap={activeExpandedMap}
              onToggleExpand={handleToggleExpand}
              isMatch={matchingIds.has(node.item.unit_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
