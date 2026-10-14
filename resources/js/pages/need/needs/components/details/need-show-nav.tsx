import type { RemixiconComponentType } from '@remixicon/react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface NeedNavSection {
  value: string;
  label: string;
  subtitle: string;
  icon: RemixiconComponentType;
  permission: string;
  count: string;
}

interface NeedShowNavProps {
  sections: NeedNavSection[];
  activeSection: string;
  onSelectSection: (section: string) => void;
  currentIndex: number;
}

export function NeedShowNav({
  sections,
  activeSection,
  onSelectSection,
  currentIndex,
}: NeedShowNavProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Navigasi Rincian Usulan
        </span>
        <Badge variant="outline" className="font-mono text-xs">
          {currentIndex + 1} / {sections.length}
        </Badge>
      </div>

      <nav className="flex flex-col gap-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.value;

          return (
            <button
              key={section.value}
              type="button"
              onClick={() => onSelectSection(section.value)}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-xs transition-colors',
                isActive
                  ? 'bg-primary font-medium text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground',
                  )}
                />
                <div className="truncate">
                  <div className="truncate font-medium">{section.label}</div>
                  <div
                    className={cn(
                      'truncate text-[11px]',
                      isActive
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground/70',
                    )}
                  >
                    {section.subtitle}
                  </div>
                </div>
              </div>

              <span
                className={cn(
                  'ml-2 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px]',
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {section.count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
