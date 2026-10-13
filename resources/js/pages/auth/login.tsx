import { Form, Head } from '@inertiajs/react';
import {
  InputField,
  PasswordField,
  SingleCheckboxField,
} from '@/components/form';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
  status?: string;
  canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
  return (
    <>
      <Head title="Log in" />

      <Form
        {...store.form()}
        resetOnSuccess={['password']}
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <>
            <div className="grid gap-6">
              <InputField
                id="email"
                type="email"
                name="email"
                label="Email address"
                required
                autoFocus
                tabIndex={1}
                autoComplete="email"
                placeholder="email@example.com"
                error={errors.email}
              />

              <PasswordField
                id="password"
                name="password"
                label={
                  <div className="flex w-full items-center justify-between">
                    <span>Password</span>
                    {canResetPassword && (
                      <TextLink
                        href={request()}
                        className="text-sm font-normal"
                        tabIndex={5}
                      >
                        Forgot password?
                      </TextLink>
                    )}
                  </div>
                }
                required
                tabIndex={2}
                autoComplete="current-password"
                placeholder="Password"
                error={errors.password}
              />

              <SingleCheckboxField
                id="remember"
                name="remember"
                label="Remember me"
                tabIndex={3}
              />

              <Button
                type="submit"
                className="mt-4 w-full"
                tabIndex={4}
                disabled={processing}
                data-test="login-button"
              >
                {processing && <Spinner />}
                Log in
              </Button>
            </div>
          </>
        )}
      </Form>

      {status && (
        <div className="mb-4 text-center text-sm font-medium text-success">
          {status}
        </div>
      )}
    </>
  );
}

Login.layout = {
  title: 'Log in to your account',
  description: 'Enter your email and password below to log in',
};
