import { RiInformationLine } from '@remixicon/react';
import type { ComponentProps, ReactNode } from 'react';
import { useId } from 'react';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface FieldOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface BaseFieldProps {
  id?: string;
  label?: ReactNode;
  description?: ReactNode;
  info?: ReactNode;
  error?: string | Array<{ message?: string } | undefined>;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal' | 'responsive';
  wrapperClassName?: string;
  contentClassName?: string;
  labelProps?: Omit<ComponentProps<typeof FieldLabel>, 'children' | 'htmlFor'>;
  hideLabel?: boolean;
}

export interface FieldWrapperProps extends BaseFieldProps {
  children:
    | ReactNode
    | ((props: {
        id: string;
        errorId?: string;
        descriptionId?: string;
        isInvalid: boolean;
      }) => ReactNode);
}

export function FieldWrapper({
  id: explicitId,
  label,
  description,
  info,
  error,
  required,
  disabled,
  orientation = 'vertical',
  wrapperClassName,
  contentClassName,
  labelProps,
  hideLabel = false,
  children,
}: FieldWrapperProps) {
  const generatedId = useId();
  const id = explicitId || generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const isInvalid = Boolean(
    typeof error === 'string'
      ? error.trim().length > 0
      : Array.isArray(error) && error.some((e) => Boolean(e?.message)),
  );

  const errorList = typeof error === 'string' ? [{ message: error }] : error;

  const renderLabel = () => {
    if (!label) {
      return null;
    }

    return (
      <FieldLabel
        htmlFor={id}
        {...labelProps}
        className={cn(
          'flex items-center gap-1.5 font-medium',
          hideLabel && 'sr-only',
          labelProps?.className,
        )}
      >
        <span>{label}</span>
        {required && (
          <span className="font-semibold text-destructive" aria-hidden="true">
            *
          </span>
        )}
        {info && (
          <Tooltip>
            <TooltipTrigger
              type="button"
              className="inline-flex cursor-help items-center rounded-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none"
              aria-label="Informasi tambahan"
              tabIndex={-1}
            >
              <RiInformationLine className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              className="max-w-xs text-xs"
            >
              {info}
            </TooltipContent>
          </Tooltip>
        )}
      </FieldLabel>
    );
  };

  const renderDescription = () => {
    if (!description) {
      return null;
    }

    return (
      <FieldDescription id={descriptionId}>{description}</FieldDescription>
    );
  };

  const renderError = () => {
    if (!error) {
      return null;
    }

    return <FieldError id={errorId} errors={errorList} />;
  };

  const childNode =
    typeof children === 'function'
      ? children({
          id,
          errorId,
          descriptionId,
          isInvalid,
        })
      : children;

  // Horizontal layout (e.g. single checkbox or switch row)
  if (orientation === 'horizontal') {
    return (
      <Field
        orientation="horizontal"
        data-disabled={disabled ? 'true' : undefined}
        data-invalid={isInvalid ? 'true' : undefined}
        className={cn('items-start gap-3', wrapperClassName)}
      >
        {childNode}
        <FieldContent className={cn('min-w-0', contentClassName)}>
          {renderLabel()}
          {renderDescription()}
          {renderError()}
        </FieldContent>
      </Field>
    );
  }

  // Vertical layout (standard)
  return (
    <Field
      orientation="vertical"
      data-disabled={disabled ? 'true' : undefined}
      data-invalid={isInvalid ? 'true' : undefined}
      className={cn('gap-1.5', wrapperClassName)}
    >
      {renderLabel()}
      <FieldContent className={cn('gap-1.5', contentClassName)}>
        {childNode}
        {renderDescription()}
        {renderError()}
      </FieldContent>
    </Field>
  );
}
