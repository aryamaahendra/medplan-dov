import type { ComponentProps, ReactNode } from 'react';
import { FieldWrapper } from '@/components/form/field-wrapper';
import type {
  BaseFieldProps,
  FieldOption,
} from '@/components/form/field-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface SelectFieldProps
  extends
    Omit<
      ComponentProps<typeof Select>,
      | 'children'
      | 'disabled'
      | 'required'
      | 'defaultValue'
      | 'onValueChange'
      | 'value'
    >,
    BaseFieldProps {
  options: FieldOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  triggerClassName?: string;
  triggerSize?: 'sm' | 'default';
  contentProps?: ComponentProps<typeof SelectContent>;
  renderOption?: (option: FieldOption) => ReactNode;
  formatSelectedValue?: (value: string, defaultLabel: string) => ReactNode;
}

export function SelectField({
  id: explicitId,
  label,
  description,
  info,
  error,
  required,
  disabled,
  orientation,
  wrapperClassName,
  contentClassName,
  labelProps,
  hideLabel,
  options,
  placeholder = 'Pilih salah satu...',
  triggerClassName,
  triggerSize,
  contentProps,
  renderOption,
  formatSelectedValue,
  value,
  defaultValue,
  onValueChange,
  ...selectProps
}: SelectFieldProps) {
  return (
    <FieldWrapper
      id={explicitId}
      label={label}
      description={description}
      info={info}
      error={error}
      required={required}
      disabled={disabled}
      orientation={orientation}
      wrapperClassName={wrapperClassName}
      contentClassName={contentClassName}
      labelProps={labelProps}
      hideLabel={hideLabel}
    >
      {({ id, descriptionId, errorId, isInvalid }) => (
        <Select
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onValueChange={
            onValueChange
              ? (val) => onValueChange(String(val ?? ''))
              : undefined
          }
          {...selectProps}
        >
          <SelectTrigger
            id={id}
            size={triggerSize}
            className={cn(
              'w-full max-w-full min-w-0 justify-between',
              triggerClassName,
            )}
            aria-invalid={isInvalid}
            aria-describedby={
              [descriptionId, errorId].filter(Boolean).join(' ') || undefined
            }
          >
            <SelectValue
              className="min-w-0 truncate text-left"
              placeholder={placeholder}
            >
              {(val) => {
                if (!val) {
                  return placeholder;
                }

                const strVal = String(val);
                const match = options.find((opt) => opt.value === strVal);
                const defaultLabel = match ? match.label : strVal;

                const formatted = formatSelectedValue
                  ? formatSelectedValue(strVal, defaultLabel)
                  : defaultLabel;

                if (typeof formatted === 'string') {
                  return (
                    <span className="block min-w-0 flex-1 truncate text-left">
                      {formatted}
                    </span>
                  );
                }

                return formatted;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            {...contentProps}
            className={cn(
              'w-(--anchor-width) max-w-[var(--anchor-width)] min-w-[var(--anchor-width)]',
              contentProps?.className,
            )}
          >
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="py-1.5"
              >
                {renderOption ? (
                  renderOption(option)
                ) : (
                  <div className="flex min-w-0 flex-1 flex-col text-left">
                    <span className="leading-snug break-words whitespace-normal">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="mt-0.5 text-xs leading-normal break-words whitespace-normal text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </div>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldWrapper>
  );
}
