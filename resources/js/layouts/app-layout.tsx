import { useMemo } from 'react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
  breadcrumbs: explicitBreadcrumbs,
  children,
}: {
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}) {
  const page = children as React.ReactElement;
  const layoutMeta = (page?.type as any)?.layout;
  const pageProps = page?.props;

  const breadcrumbs = useMemo(() => {
    if (explicitBreadcrumbs) {
      return explicitBreadcrumbs;
    }

    if (!layoutMeta) {
      return [];
    }

    if (typeof layoutMeta === 'function') {
      try {
        return layoutMeta(pageProps)?.breadcrumbs || [];
      } catch {
        return [];
      }
    }

    if (typeof layoutMeta === 'object') {
      return layoutMeta.breadcrumbs || [];
    }

    return [];
  }, [explicitBreadcrumbs, layoutMeta, pageProps]);

  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs}>{children}</AppLayoutTemplate>
  );
}
