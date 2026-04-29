import { Label } from '@/components/ui/label';

export function SectionWrapper({
  label,
  children,
  extra,
  footer,
}: {
  label: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between border-t border-b bg-muted/40 px-4 py-3">
        <Label className="mb-0">{label}</Label>
        {extra}
      </div>
      <div className="px-4 py-3">{children}</div>
      {footer && (
        <Label className="mb-0 border-t border-b bg-muted/40 px-4 py-3 text-xs text-muted-foreground italic">
          {footer}
        </Label>
      )}
    </div>
  );
}
