import type { ComponentProps } from 'react';
import { FieldWrapper } from '@/components/form/field-wrapper';
import type {
  BaseFieldProps,
  FieldOption,
} from '@/components/form/field-wrapper';
import type { GridCols, GridDensity } from '@/components/form/form-grid';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export type RadioVariant = 'default' | 'description' | 'choice-card';

const gridColsMap: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6',
  7: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-7',
  8: 'grid-cols-2 sm:grid-cols-4 md:grid-cols-8',
  9: 'grid-cols-3 sm:grid-cols-5 md:grid-cols-9',
  10: 'grid-cols-2 sm:grid-cols-5 md:grid-cols-10',
  11: 'grid-cols-2 sm:grid-cols-6 md:grid-cols-11',
  12: 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12',
};

const gridGapMap: Record<GridDensity, string> = {
  compact: 'gap-2',
  default: 'gap-3',
  comfortable: 'gap-4',
  dense: 'gap-1.5',
};

export interface RadioFieldProps
  extends
    Omit<
      ComponentProps<typeof RadioGroup>,
      'id' | 'disabled' | 'required' | 'aria-invalid' | 'className'
    >,
    BaseFieldProps {
  options: FieldOption[];
  variant?: RadioVariant;
  optionOrientation?: 'vertical' | 'horizontal';
  cols?: GridCols;
  density?: GridDensity;
  card?: boolean; // legacy alias for variant="choice-card"
  className?: string;
}

export function RadioField({
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
  variant = 'default',
  optionOrientation = 'vertical',
  cols,
  density = 'default',
  card = false,
  value,
  defaultValue,
  onValueChange,
  className,
  ...radioGroupProps
}: RadioFieldProps) {
  // Respect card alias if passed
  const effectiveVariant: RadioVariant = card ? 'choice-card' : variant;

  const getContainerClassName = () => {
    if (cols) {
      return cn(
        'grid w-full',
        gridColsMap[cols],
        gridGapMap[density],
        className,
      );
    }

    if (optionOrientation === 'horizontal') {
      return cn(
        'flex flex-wrap',
        density === 'dense'
          ? 'gap-2'
          : density === 'compact'
            ? 'gap-3'
            : 'gap-4',
        className,
      );
    }

    return cn(
      'grid',
      density === 'dense'
        ? 'gap-1.5'
        : density === 'compact'
          ? 'gap-2'
          : 'gap-2.5',
      className,
    );
  };

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
        <RadioGroup
          id={id}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={
            [descriptionId, errorId].filter(Boolean).join(' ') || undefined
          }
          className={getContainerClassName()}
          {...radioGroupProps}
        >
          {options.map((option) => {
            const itemKey = `${id}-${option.value}`;
            const isOptionDisabled = disabled || option.disabled;

            // 1. Choice Card Variant (shadcn Choice Card)
            if (effectiveVariant === 'choice-card') {
              return (
                <FieldLabel
                  key={option.value}
                  htmlFor={itemKey}
                  className={cn(
                    'block cursor-pointer rounded-lg border transition-colors',
                    isOptionDisabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <Field
                    orientation="horizontal"
                    className="items-center justify-between gap-3 p-3"
                  >
                    <FieldContent>
                      <FieldTitle>{option.label}</FieldTitle>
                      {option.description && (
                        <FieldDescription className="text-xs">
                          {option.description}
                        </FieldDescription>
                      )}
                    </FieldContent>
                    <RadioGroupItem
                      id={itemKey}
                      value={option.value}
                      disabled={isOptionDisabled}
                    />
                  </Field>
                </FieldLabel>
              );
            }

            // 2. Description Variant (shadcn with FieldContent & FieldDescription)
            if (effectiveVariant === 'description' || option.description) {
              return (
                <Field
                  key={option.value}
                  orientation="horizontal"
                  className={cn(
                    'items-start gap-2.5',
                    isOptionDisabled && 'opacity-50',
                  )}
                >
                  <RadioGroupItem
                    id={itemKey}
                    value={option.value}
                    disabled={isOptionDisabled}
                    className="mt-0.5"
                  />
                  <FieldContent>
                    <FieldLabel
                      htmlFor={itemKey}
                      className="cursor-pointer text-sm leading-snug font-medium"
                    >
                      {option.label}
                    </FieldLabel>
                    {option.description && (
                      <FieldDescription className="text-xs leading-normal">
                        {option.description}
                      </FieldDescription>
                    )}
                  </FieldContent>
                </Field>
              );
            }

            // 3. Default standard compact radio
            return (
              <Field
                key={option.value}
                orientation="horizontal"
                className={cn(
                  'items-center gap-2',
                  isOptionDisabled && 'opacity-50',
                )}
              >
                <RadioGroupItem
                  id={itemKey}
                  value={option.value}
                  disabled={isOptionDisabled}
                />
                <FieldLabel
                  htmlFor={itemKey}
                  className="cursor-pointer text-sm font-normal"
                >
                  {option.label}
                </FieldLabel>
              </Field>
            );
          })}
        </RadioGroup>
      )}
    </FieldWrapper>
  );
}
