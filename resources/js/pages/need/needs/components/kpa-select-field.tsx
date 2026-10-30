import React from 'react';
import { SelectField } from '@/components/form';
import type { SelectFieldProps } from '@/components/form/select-field';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDicebearClayAvatar } from '@/lib/avatar';
import { cn } from '@/lib/utils';

export interface KpaUserOption {
  id: number | string;
  name: string;
  nip?: string | null;
}

export interface KpaSelectFieldProps extends Omit<
  SelectFieldProps,
  'options' | 'renderOption' | 'formatSelectedValue'
> {
  users: KpaUserOption[];
}

export function KpaSelectField({
  users = [],
  placeholder = 'Pilih KPA',
  triggerClassName,
  contentProps,
  ...props
}: KpaSelectFieldProps) {
  const userMap = React.useMemo(() => {
    const map = new Map<string, KpaUserOption>();

    for (const u of users) {
      map.set(u.id.toString(), u);
    }

    return map;
  }, [users]);

  const options = React.useMemo(() => {
    return users.map((u) => ({
      value: u.id.toString(),
      label: u.name,
      description: u.nip ? `NIP. ${u.nip}` : undefined,
    }));
  }, [users]);

  return (
    <SelectField
      placeholder={placeholder}
      options={options}
      triggerClassName={cn('w-full max-w-full min-w-0', triggerClassName)}
      contentProps={{
        ...contentProps,
        className: cn(
          'w-(--anchor-width) max-w-[var(--anchor-width)] min-w-[var(--anchor-width)]',
          contentProps?.className,
        ),
      }}
      formatSelectedValue={(value, defaultLabel) => {
        const user = userMap.get(value);

        return user ? user.name : defaultLabel;
      }}
      renderOption={(opt) => {
        const user = userMap.get(opt.value);
        const name = user?.name || opt.label;
        const nip = user?.nip || opt.description;
        const avatarSrc = getDicebearClayAvatar(user?.name || opt.value);
        const fallbackInitials = name
          .split(' ')
          .map((n) => n[0])
          .filter(Boolean)
          .slice(0, 2)
          .join('')
          .toUpperCase();

        return (
          <div className="flex min-w-0 flex-1 items-center gap-2.5 py-0.5 text-left">
            <Avatar className="size-8 shrink-0 overflow-hidden rounded-full ring-1 ring-border/50">
              <AvatarImage src={avatarSrc} alt={name} />
              <AvatarFallback className="rounded-full bg-muted text-[10px] font-medium text-foreground">
                {fallbackInitials || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm leading-tight font-medium text-foreground">
                {name}
              </span>
              {nip && (
                <span className="mt-0.5 truncate text-xs text-muted-foreground">
                  {nip.startsWith('NIP') ? nip : `NIP. ${nip}`}
                </span>
              )}
            </div>
          </div>
        );
      }}
      {...props}
    />
  );
}
