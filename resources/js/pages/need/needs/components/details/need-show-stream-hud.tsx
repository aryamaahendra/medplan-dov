import { RiArrowUpLine, RiCompass3Line } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NeedSection } from './use-need-show';

interface NeedShowStreamHudProps {
  sections: NeedSection[];
  activeSection: string;
  onScrollToSection: (sectionValue: string) => void;
}

export function NeedShowStreamHud({
  sections,
  activeSection,
  onScrollToSection,
}: NeedShowStreamHudProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      aria-label="Mini-Map Dokumen Mengalir"
      className="sticky top-20 z-20 flex flex-col gap-2 rounded-xl border border-border/80 bg-background/90 p-3 shadow-md backdrop-blur-md"
    >
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-foreground uppercase">
          <RiCompass3Line className="h-3.5 w-3.5 text-primary" />
          <span>Mini-Map Berkas</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {sections.length} Bab
        </span>
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
                'group flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors',
                isActive
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'font-mono text-[10px]',
                  isActive
                    ? 'font-bold text-primary'
                    : 'text-muted-foreground group-hover:text-foreground',
                )}
              >
                {seq}
              </span>
              <span className="truncate">{section.label}</span>
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
          <RiArrowUpLine className="h-3 w-3" />
          <span>Kembali ke Atas</span>
        </Button>
      </div>
    </div>
  );
}
