import { CheckboxField } from '@/components/form/checkbox-field';
import type { CheckboxFieldProps } from '@/components/form/checkbox-field';
import { InputField } from '@/components/form/input-field';
import type { InputFieldProps } from '@/components/form/input-field';
import { PasswordField } from '@/components/form/password-field';
import type { PasswordFieldProps } from '@/components/form/password-field';
import { RadioField } from '@/components/form/radio-field';
import type { RadioFieldProps } from '@/components/form/radio-field';
import { SelectField } from '@/components/form/select-field';
import type { SelectFieldProps } from '@/components/form/select-field';
import { SwitchField } from '@/components/form/switch-field';
import type { SwitchFieldProps } from '@/components/form/switch-field';
import { TextareaField } from '@/components/form/textarea-field';
import type { TextareaFieldProps } from '@/components/form/textarea-field';

export type FormFieldProps =
  | ({
      type:
        | 'text'
        | 'email'
        | 'number'
        | 'tel'
        | 'url'
        | 'date'
        | 'time'
        | 'datetime-local'
        | 'file'
        | 'search';
    } & InputFieldProps)
  | ({ type: 'textarea' } & TextareaFieldProps)
  | ({ type: 'select' } & SelectFieldProps)
  | ({ type: 'radio' } & RadioFieldProps)
  | ({ type: 'checkbox' } & CheckboxFieldProps)
  | ({ type: 'switch' } & SwitchFieldProps)
  | ({ type: 'password' } & PasswordFieldProps);

export function FormField(props: FormFieldProps) {
  switch (props.type) {
    case 'textarea': {
      const { type: _, ...rest } = props;
      void _;

      return <TextareaField {...rest} />;
    }
    case 'select': {
      const { type: _, ...rest } = props;
      void _;

      return <SelectField {...rest} />;
    }
    case 'radio': {
      const { type: _, ...rest } = props;
      void _;

      return <RadioField {...rest} />;
    }
    case 'checkbox': {
      const { type: _, ...rest } = props;
      void _;

      return <CheckboxField {...rest} />;
    }
    case 'switch': {
      const { type: _, ...rest } = props;
      void _;

      return <SwitchField {...rest} />;
    }
    case 'password': {
      const { type: _, ...rest } = props;
      void _;

      return <PasswordField {...rest} />;
    }
    default: {
      const { type, ...rest } = props;

      return <InputField type={type} {...rest} />;
    }
  }
}
