import { useState } from 'react';

import type { KpiIndicator } from '@/types';

export function useKpiGroupShow() {
  const [view, setView] = useState<'card' | 'table'>('table');
  const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<KpiIndicator | null>(
    null,
  );
  const [parentIndicator, setParentIndicator] = useState<KpiIndicator | null>(
    null,
  );
  const onCreateIndicator = () => {
    setParentIndicator(null);
    setEditingIndicator(null);
    setIndicatorDialogOpen(true);
  };

  const onCreateChildIndicator = (parent: KpiIndicator) => {
    setParentIndicator(parent);
    setEditingIndicator(null);
    setIndicatorDialogOpen(true);
  };

  const onEditIndicator = (indicator: KpiIndicator) => {
    setParentIndicator(null);
    setEditingIndicator(indicator);
    setIndicatorDialogOpen(true);
  };

  return {
    state: {
      view,
      indicatorDialogOpen,
      editingIndicator,
      parentIndicator,
    },
    handlers: {
      setView,
      setIndicatorDialogOpen,
      onCreateIndicator,
      onCreateChildIndicator,
      onEditIndicator,
    },
  };
}
