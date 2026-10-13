import type { ComponentProps, Ref } from 'react';
import { FieldWrapper } from '@/components/form/field-wrapper';
import type { BaseFieldProps } from '@/components/form/field-wrapper';
import { Input } from '@/components/ui/input';

export interface InputFieldProps
  extends
    Omit<
      ComponentProps<typeof Input>,
      'id' | 'disabled' | 'required' | 'aria-invalid'
    >,
    BaseFieldProps {
  inputRef?: Ref<HTMLInputElement>;
}

export function InputField({
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
  ...inputProps
}: InputFieldProps) {
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
        <Input
          id={id}
          ref={inputRef}
          disabled={disabled}
          required={required}
          aria-invalid={isInvalid}
          aria-describedby={
            [descriptionId, errorId].filter(Boolean).join(' ') || undefined
          }
          className={className}
          {...inputProps}
        />
      )}
    </FieldWrapper>
  );
}
