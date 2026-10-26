import type { ComponentProps, Ref } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const formatMoneyInput = (
  value: string | number | null | undefined,
): string => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const strValue = value.toString().replace(',', '.');
  const [intPart, decPart] = strValue.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt;
};

export const parseMoneyInput = (value: string): string => {
  return value.replace(/\./g, '').replace(',', '.');
};

export interface MoneyInputProps extends Omit<
  ComponentProps<'input'>,
  'value' | 'onChange' | 'type'
> {
  value?: string | number | null;
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currencyPrefix?: string;
  prefixClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

export function MoneyInput({
  value,
  onValueChange,
  onChange,
  currencyPrefix = 'Rp',
  prefixClassName,
  className,
  placeholder = '0',
  ref,
  ...props
}: MoneyInputProps) {
  const displayValue = formatMoneyInput(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const parsed = parseMoneyInput(rawVal);
    onValueChange?.(parsed);
    onChange?.(e);
  };

  return (
    <div className="relative">
      {currencyPrefix ? (
        <span
          className={cn(
            'pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-muted-foreground select-none',
            prefixClassName,
          )}
        >
          {currencyPrefix}
        </span>
      ) : null}
      <Input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        className={cn('font-mono', currencyPrefix && 'pl-9', className)}
        {...props}
      />
    </div>
  );
}

export default MoneyInput;
