import { RiExchangeLine } from '@remixicon/react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatIDR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Need } from '@/types';
import { resolveNeedFinancialFigures } from '../utils/need-financial-utils';
import type { NeedFinancialFigures } from '../utils/need-financial-utils';

export interface NeedFinancialAdjustmentIndicatorProps {
  need?: Need | null;
  figures?: NeedFinancialFigures;
  unit?: string | null;
  showLabel?: boolean;
  className?: string;
}

export function NeedFinancialAdjustmentIndicator({
  need,
  figures,
  unit,
  showLabel = false,
  className,
}: NeedFinancialAdjustmentIndicatorProps) {
  const resolvedFigures =
    figures ?? (need ? resolveNeedFinancialFigures(need) : null);

  if (!resolvedFigures || !resolvedFigures.hasChanges) {
    return null;
  }

  const unitName = unit ?? need?.unit ?? '';

  const trigger = (
    <span
      className={cn(
        'inline-flex shrink-0 cursor-help items-center justify-center text-xs font-medium transition-colors select-none',
        showLabel
          ? 'h-5 gap-1 rounded-full border px-2 text-xss'
          : 'size-5 rounded-full border',
        className,
      )}
      aria-label="Nilai usulan disesuaikan oleh Direktur"
    >
      <RiExchangeLine className="size-3.5" />
      {showLabel && <span>Disesuaikan</span>}
    </span>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={trigger} />
        <TooltipContent
          side="top"
          align="start"
          className="max-w-xs p-2.5 text-xs"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 border-b border-background/20 pb-1.5 font-semibold text-background">
              <RiExchangeLine className="size-3.5 shrink-0" />
              <span>Penyesuaian oleh Direktur</span>
            </div>

            <div className="flex flex-col gap-1 text-xss text-background/90">
              <span className="font-semibold text-background/70">
                Usulan Awal:
              </span>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono tabular-nums">
                <span className="text-background/80">Volume:</span>
                <span className="text-right font-medium">
                  {Number(resolvedFigures.requestedVolume).toLocaleString(
                    'id-ID',
                  )}{' '}
                  {unitName}
                </span>
                <span className="text-background/80">Harga Satuan:</span>
                <span className="text-right font-medium">
                  {formatIDR(resolvedFigures.requestedUnitPrice)}
                </span>
                <span className="text-background/80">Total Usulan:</span>
                <span className="text-right font-semibold">
                  {formatIDR(resolvedFigures.requestedTotalPrice)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 border-t border-background/20 pt-1.5 text-xss text-background/90">
              <span className="font-semibold text-background/70">
                Ketetapan Direktur (Final):
              </span>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono tabular-nums">
                <span className="text-background/80">Volume:</span>
                <span className="text-right font-medium">
                  {Number(resolvedFigures.displayVolume).toLocaleString(
                    'id-ID',
                  )}{' '}
                  {unitName}
                </span>
                <span className="text-background/80">Harga Satuan:</span>
                <span className="text-right font-medium">
                  {formatIDR(resolvedFigures.displayUnitPrice)}
                </span>
                <span className="text-background/80">Total Disetujui:</span>
                <span className="text-right font-semibold">
                  {formatIDR(resolvedFigures.displayTotalPrice)}
                </span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
