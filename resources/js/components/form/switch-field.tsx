import type { ComponentProps } from 'react';
import { FieldWrapper } from '@/components/form/field-wrapper';
import type { BaseFieldProps } from '@/components/form/field-wrapper';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export type SwitchVariant = 'default' | 'description' | 'choice-card';

export interface SwitchFieldProps
  extends
    Omit<
      ComponentProps<typeof Switch>,
      'id' | 'disabled' | 'required' | 'aria-invalid' | 'className'
    >,
    BaseFieldProps {
  variant?: SwitchVariant;
  card?: boolean; // legacy alias for variant="choice-card"
  className?: string;
}

export function SwitchField({
  id: explicitId,
  label,
  description,
  info,
  error,
  required,
  disabled,
  variant = 'default',
  card = false,
  wrapperClassName,
  contentClassName,
  labelProps,
  hideLabel,
  checked,
  defaultChecked,
  onCheckedChange,
  className,
  ...switchProps
}: SwitchFieldProps) {
  const effectiveVariant: SwitchVariant = card ? 'choice-card' : variant;

  // 1. Choice Card Variant (shadcn Switch Choice Card)
  if (effectiveVariant === 'choice-card') {
    return (
      <FieldWrapper
        id={explicitId}
        error={error}
        wrapperClassName={wrapperClassName}
        contentClassName={contentClassName}
      >
        {({ id, descriptionId, errorId, isInvalid }) => (
          <FieldLabel
            htmlFor={id}
            {...labelProps}
            className={cn(
              'block cursor-pointer rounded-lg border transition-colors',
              disabled && 'cursor-not-allowed opacity-50',
              labelProps?.className,
            )}
          >
            <Field
              orientation="horizontal"
              className="items-center justify-between gap-3 p-3"
            >
              <FieldContent>
                <FieldTitle>{label}</FieldTitle>
                {description && (
                  <FieldDescription id={descriptionId} className="text-xs">
                    {description}
                  </FieldDescription>
                )}
              </FieldContent>
              <Switch
                id={id}
                checked={checked}
                defaultChecked={defaultChecked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                required={required}
                aria-invalid={isInvalid}
                aria-describedby={
                  [descriptionId, errorId].filter(Boolean).join(' ') ||
                  undefined
                }
                className={className}
                {...switchProps}
              />
            </Field>
          </FieldLabel>
        )}
      </FieldWrapper>
    );
  }

  // 2. Description or Default Variant
  return (
    <FieldWrapper
      id={explicitId}
      label={label}
      description={description}
      info={info}
      error={error}
      required={required}
      disabled={disabled}
      orientation="horizontal"
      wrapperClassName={wrapperClassName}
      contentClassName={contentClassName}
      labelProps={labelProps}
      hideLabel={hideLabel}
    >
      {({ id, descriptionId, errorId, isInvalid }) => (
        <Switch
          id={id}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          required={required}
          aria-invalid={isInvalid}
          aria-describedby={
            [descriptionId, errorId].filter(Boolean).join(' ') || undefined
          }
          className={cn(className)}
          {...switchProps}
        />
      )}
    </FieldWrapper>
  );
}
