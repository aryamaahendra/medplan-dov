import { Form, Head } from '@inertiajs/react';
import { InputField, PasswordField } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
  token: string;
  email: string;
};

export default function ResetPassword({ token, email }: Props) {
  return (
    <>
      <Head title="Reset password" />

      <Form
        {...update.form()}
        transform={(data) => ({ ...data, token, email })}
        resetOnSuccess={['password', 'password_confirmation']}
      >
        {({ processing, errors }) => (
          <div className="grid gap-6">
            <InputField
              id="email"
              type="email"
              name="email"
              label="Email"
              autoComplete="email"
              value={email}
              readOnly
              error={errors.email}
            />

            <PasswordField
              id="password"
              name="password"
              label="Password"
              autoComplete="new-password"
              autoFocus
              placeholder="Password"
              error={errors.password}
            />

            <PasswordField
              id="password_confirmation"
              name="password_confirmation"
              label="Confirm password"
              autoComplete="new-password"
              placeholder="Confirm password"
              error={errors.password_confirmation}
            />

            <Button
              type="submit"
              className="mt-4 w-full"
              disabled={processing}
              data-test="reset-password-button"
            >
              {processing && <Spinner />}
              Reset password
            </Button>
          </div>
        )}
      </Form>
    </>
  );
}

ResetPassword.layout = {
  title: 'Reset password',
  description: 'Please enter your new password below',
};
