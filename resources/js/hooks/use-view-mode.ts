import { useSyncExternalStore } from 'react';

export type ViewMode = 'table' | 'grid' | 'list';

const viewModeStore = {
  subscribe(callback: () => void) {
    window.addEventListener('storage', callback);
    window.addEventListener('view-mode-change', callback);

    return () => {
      window.removeEventListener('storage', callback);
      window.removeEventListener('view-mode-change', callback);
    };
  },
  getSnapshot(): ViewMode {
    const stored = localStorage.getItem('needs-view-mode');

    if (stored === 'table' || stored === 'grid' || stored === 'list') {
      return stored;
    }

    return 'table';
  },
  getServerSnapshot() {
    return 'loading' as const;
  },
  set(mode: ViewMode) {
    localStorage.setItem('needs-view-mode', mode);
    window.dispatchEvent(new Event('view-mode-change'));
  },
};

export function useViewMode() {
  const viewMode = useSyncExternalStore(
    viewModeStore.subscribe,
    viewModeStore.getSnapshot,
    viewModeStore.getServerSnapshot,
  );

  return [viewMode, viewModeStore.set] as const;
}
