import { useSyncExternalStore } from 'react';

const viewModeStore = {
  subscribe(callback: () => void) {
    window.addEventListener('storage', callback);
    window.addEventListener('view-mode-change', callback);

    return () => {
      window.removeEventListener('storage', callback);
      window.removeEventListener('view-mode-change', callback);
    };
  },
  getSnapshot() {
    return (
      (localStorage.getItem('needs-view-mode') as 'table' | 'grid') || 'table'
    );
  },
  getServerSnapshot() {
    return 'loading' as const;
  },
  set(mode: 'table' | 'grid') {
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
