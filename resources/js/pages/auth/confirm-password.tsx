import { Form, Head } from '@inertiajs/react';
import { PasswordField } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
  return (
    <>
      <Head title="Confirm password" />

      <Form {...store.form()} resetOnSuccess={['password']}>
        {({ processing, errors }) => (
          <div className="space-y-6">
            <PasswordField
              id="password"
              name="password"
              label="Password"
              placeholder="Password"
              autoComplete="current-password"
              autoFocus
              error={errors.password}
            />

            <div className="flex items-center">
              <Button
                className="w-full"
                disabled={processing}
                data-test="confirm-password-button"
              >
                {processing && <Spinner />}
                Confirm password
              </Button>
            </div>
          </div>
        )}
      </Form>
    </>
  );
}

ConfirmPassword.layout = {
  title: 'Confirm your password',
  description:
    'This is a secure area of the application. Please confirm your password before continuing.',
};
