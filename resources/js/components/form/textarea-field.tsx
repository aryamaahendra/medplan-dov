import type { ComponentProps, Ref } from 'react';
import { FieldWrapper } from '@/components/form/field-wrapper';
import type { BaseFieldProps } from '@/components/form/field-wrapper';
import { Textarea } from '@/components/ui/textarea';

export interface TextareaFieldProps
  extends
    Omit<
      ComponentProps<typeof Textarea>,
      'id' | 'disabled' | 'required' | 'aria-invalid'
    >,
    BaseFieldProps {
  textareaRef?: Ref<HTMLTextAreaElement>;
}

export function TextareaField({
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
  textareaRef,
  className,
  ...textareaProps
}: TextareaFieldProps) {
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
        <Textarea
          id={id}
          ref={textareaRef}
          disabled={disabled}
          required={required}
          aria-invalid={isInvalid}
          aria-describedby={
            [descriptionId, errorId].filter(Boolean).join(' ') || undefined
          }
          className={className}
          {...textareaProps}
        />
      )}
    </FieldWrapper>
  );
}
