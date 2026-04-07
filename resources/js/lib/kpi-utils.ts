import type { KpiIndicator } from '@/types';

export function buildIndicatorTree(indicators: KpiIndicator[]): KpiIndicator[] {
  const map = new Map<number, KpiIndicator>();
  const roots: KpiIndicator[] = [];

  // First pass: map all indicators and ensure indicators array exists
  indicators.forEach((indicator) => {
    map.set(indicator.id, { ...indicator, indicators: [] });
  });

  // Second pass: build tree
  indicators.forEach((indicator) => {
    const node = map.get(indicator.id)!;

    if (
      indicator.parent_indicator_id &&
      map.has(indicator.parent_indicator_id)
    ) {
      const parent = map.get(indicator.parent_indicator_id)!;
      parent.indicators = parent.indicators || [];
      parent.indicators.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function classifyIndicators(indicatorTree: KpiIndicator[]) {
  const categories: KpiIndicator[] = [];
  const standaloneIndicators: KpiIndicator[] = [];

  indicatorTree.forEach((node) => {
    if (node.is_category) {
      categories.push(node);
    } else {
      standaloneIndicators.push(node);
    }
  });

  return { categories, standaloneIndicators };
}
