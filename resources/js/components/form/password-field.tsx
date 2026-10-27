import type { ComponentProps, Ref } from 'react';
import { FieldWrapper } from '@/components/form/field-wrapper';
import type { BaseFieldProps } from '@/components/form/field-wrapper';
import PasswordInput from '@/components/password-input';

export interface PasswordFieldProps
  extends
    Omit<
      ComponentProps<typeof PasswordInput>,
      'id' | 'disabled' | 'required' | 'aria-invalid'
    >,
    BaseFieldProps {
  inputRef?: Ref<HTMLInputElement>;
}

export function PasswordField({
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
  ...passwordProps
}: PasswordFieldProps) {
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
        <PasswordInput
          id={id}
          ref={inputRef}
          disabled={disabled}
          required={required}
          aria-invalid={isInvalid}
          aria-describedby={
            [descriptionId, errorId].filter(Boolean).join(' ') || undefined
          }
          className={className}
          {...passwordProps}
        />
      )}
    </FieldWrapper>
  );
}
