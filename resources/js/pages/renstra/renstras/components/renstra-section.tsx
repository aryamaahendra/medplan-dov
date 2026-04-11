import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface RenstraSectionProps {
  title: string;
  description: string;
  action?:
    | ReactNode
    | {
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
  const renderAction = () => {
    if (!action) {
      return null;
    }

    if (typeof action === 'object' && action !== null && 'label' in action) {
      const a = action as {
        label: string;
        icon: ReactNode;
        onClick: () => void;
      };

      return (
        <Button onClick={a.onClick} className="w-fit">
          {a.icon}
          {a.label}
        </Button>
      );
    }

    return action as ReactNode;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {renderAction()}
      </div>
      {children}
    </div>
  );
}
