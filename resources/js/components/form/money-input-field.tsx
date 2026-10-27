import type { ComponentProps, Ref } from 'react';
import { FieldWrapper } from '@/components/form/field-wrapper';
import type { BaseFieldProps } from '@/components/form/field-wrapper';
import MoneyInput from '@/components/money-input';

export interface MoneyInputFieldProps
  extends
    Omit<
      ComponentProps<typeof MoneyInput>,
      'id' | 'disabled' | 'required' | 'aria-invalid'
    >,
    BaseFieldProps {
  inputRef?: Ref<HTMLInputElement>;
}

export function MoneyInputField({
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
  inputRef,
  className,
  ...moneyInputProps
}: MoneyInputFieldProps) {
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
        <MoneyInput
          id={id}
          ref={inputRef}
          disabled={disabled}
          required={required}
          aria-invalid={isInvalid}
          aria-describedby={
            [descriptionId, errorId].filter(Boolean).join(' ') || undefined
          }
          className={className}
          {...moneyInputProps}
        />
      )}
    </FieldWrapper>
  );
}
