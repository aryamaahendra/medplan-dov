import { RiArrowUpLine, RiCompass3Line } from '@remixicon/react';

import { Button } from '@/components/ui/button';
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
  const activeIndex = Math.max(
    0,
    sections.findIndex((s) => s.value === activeSection),
  );

  const progressPercent =
    sections.length > 0 ? ((activeIndex + 1) / sections.length) * 100 : 0;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      aria-label="Mini-Map Dokumen Mengalir"
      className={cn(
        'sticky top-6 z-20 flex max-h-[calc(100vh-3rem)] flex-col gap-2.5 overflow-y-auto rounded-xl border border-border/80 bg-background/95 p-3 shadow-md backdrop-blur-md',
        className,
      )}
    >
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-foreground uppercase">
          <RiCompass3Line className="size-3.5 text-foreground" />
          <span>Mini-Map Berkas</span>
        </div>

        <span className="font-mono text-[10px] text-muted-foreground">
          {sections.length} Bab
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>
            Bab {activeIndex + 1} dari {sections.length}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

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
                  ? 'border-l-2 border-primary bg-primary/10 font-semibold text-foreground ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 font-mono text-[10px]',
                  isActive
                    ? 'font-bold text-foreground'
                    : 'text-muted-foreground group-hover:text-foreground',
                )}
              >
                {seq}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">
                  {section.label}
                </span>
                <span className="block truncate text-[10px] text-muted-foreground">
                  {section.count || section.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scroll to Top Trigger */}
      <div className="border-t border-border/50 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={scrollToTop}
          className="w-full justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <RiArrowUpLine data-icon="inline-start" />
          <span>Kembali ke Atas</span>
        </Button>
      </div>
    </div>
  );
}
