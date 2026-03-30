import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface RenstraSectionProps {
  title: string;
  description: string;
  action?: {
    label: string;
    icon: ReactNode;
    onClick: () => void;
  };
  children: ReactNode;
}

export function RenstraSection({
  title,
  description,
  action,
  children,
}: RenstraSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onClick} className="w-fit">
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
