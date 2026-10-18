import { cn } from '@/lib/utils';

import type { NeedSection } from './use-need-show';

export interface NeedShowStreamHudProps {
  sections: NeedSection[];
  activeSection: string;
  onScrollToSection: (sectionValue: string) => void;
  className?: string;
}

export function NeedShowStreamHud({
  sections,
  activeSection,
  onScrollToSection,
  className,
}: NeedShowStreamHudProps) {
  return (
    <div
      aria-label="Mini-Map Dokumen Mengalir"
      className={cn(
        'sticky top-6 z-20 flex max-h-[calc(100vh-3rem)] flex-col gap-2.5 overflow-y-auto',
        className,
      )}
    >
      {/* Nav List */}
      <div className="flex flex-col gap-1">
        {sections.map((section, idx) => {
          const isActive = activeSection === section.value;
          const seq = String(idx + 1).padStart(2, '0');

          return (
            <button
              key={section.value}
              type="button"
              onClick={() => onScrollToSection(section.value)}
              className={cn(
                'group flex items-start gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors',
                isActive
                  ? 'border-primary bg-primary/10 font-semibold text-foreground ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 font-mono text-base',
                  isActive
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground group-hover:text-foreground',
                )}
              >
                {seq}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {section.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {section.count || section.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
