import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { MoreHorizontal, AlertCircle } from 'lucide-react';
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
  indicator?: boolean;
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
  modal?: boolean;
}

export function ActionDropdown({
  label = 'Aksi',
  trigger,
  triggerVariant = 'ghost',
  actions,
  align = 'end',
  className,
  modal = false,
}: ActionDropdownProps) {
  return (
    <DropdownMenu modal={modal}>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            size={'icon-sm'}
            variant={triggerVariant}
            className={cn('', className)}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
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
            indicator,
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
                <Link href={href} className="flex-1">
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {label}
                  {indicator && (
                    <span className="ml-auto flex h-3.5 w-3.5 items-center justify-center rounded-full bg-foreground text-background ring-2 ring-foreground">
                      <AlertCircle />
                    </span>
                  )}
                </Link>
              ) : (
                <>
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span className="flex-1">{label}</span>
                  {indicator && (
                    <span className="ml-auto flex h-3.5 w-3.5 items-center justify-center rounded-full bg-foreground text-background ring-2 ring-foreground">
                      <AlertCircle />
                    </span>
                  )}
                </>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
