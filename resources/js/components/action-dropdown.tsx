import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface ActionItem {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface ActionDropdownProps {
  label?: string;
  trigger?: React.ReactNode;
  triggerVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  actions: (ActionItem | 'separator')[];
  align?: 'start' | 'end' | 'center';
  className?: string;
}

export function ActionDropdown({
  label = 'Aksi',
  trigger,
  triggerVariant = 'ghost',
  actions,
  align = 'end',
  className,
}: ActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            variant={triggerVariant}
            className={cn('h-8 w-8 p-0', className)}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-auto">
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {actions.map((action, index) => {
          if (action === 'separator') {
            return <DropdownMenuSeparator key={index} />;
          }

          const {
            label,
            icon: Icon,
            onClick,
            href,
            variant,
            disabled,
          } = action;

          return (
            <DropdownMenuItem
              key={index}
              className="text-sm/relaxed"
              onClick={onClick}
              variant={variant}
              disabled={disabled}
              asChild={!!href}
            >
              {href ? (
                <Link href={href}>
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                </Link>
              ) : (
                <>
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                </>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
