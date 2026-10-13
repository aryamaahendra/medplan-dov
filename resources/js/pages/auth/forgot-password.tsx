// Components
import { Form, Head } from '@inertiajs/react';
import { RiLoader4Line } from '@remixicon/react';
import { InputField } from '@/components/form';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
  return (
    <>
      <Head title="Forgot password" />

      {status && (
        <div className="mb-4 text-center text-sm font-medium text-success">
          {status}
        </div>
      )}

      <div className="space-y-6">
        <Form {...email.form()}>
          {({ processing, errors }) => (
            <>
              <InputField
                id="email"
                type="email"
                name="email"
                label="Email address"
                autoComplete="off"
                autoFocus
                placeholder="email@example.com"
                error={errors.email}
              />

              <div className="my-6 flex items-center justify-start">
                <Button
                  className="w-full"
                  disabled={processing}
                  data-test="email-password-reset-link-button"
                >
                  {processing && (
                    <RiLoader4Line
                      className="animate-spin"
                      data-icon="inline-start"
                    />
                  )}
                  Email password reset link
                </Button>
              </div>
            </>
          )}
        </Form>

        <div className="space-x-1 text-center text-sm text-muted-foreground">
          <span>Or, return to</span>
          <TextLink href={login()}>log in</TextLink>
        </div>
      </div>
    </>
  );
}

ForgotPassword.layout = {
  title: 'Forgot password',
  description: 'Enter your email to receive a password reset link',
};
