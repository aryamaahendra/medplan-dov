import type { Need } from '../columns';

interface NeedHeaderProps {
  need: Need;
}

export function NeedHeader({ need }: NeedHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-4xl font-medium tracking-tight text-foreground">
          {need.title}
        </h1>
      </div>
    </div>
  );
}
