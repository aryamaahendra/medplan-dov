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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{label}</h3>
          {footer && <p className="text-xs text-muted-foreground">{footer}</p>}
        </div>
        {extra}
      </div>
      <div>{children}</div>
    </div>
  );
}
