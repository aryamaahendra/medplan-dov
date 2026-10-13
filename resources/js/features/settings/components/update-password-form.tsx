import { Transition } from '@headlessui/react';
import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import { PasswordField } from '@/components/form';
import { Button } from '@/components/ui/button';

export function UpdatePasswordForm() {
  const passwordInput = useRef<HTMLInputElement>(null);
  const currentPasswordInput = useRef<HTMLInputElement>(null);

  return (
    <Form
      {...SecurityController.update.form()}
      options={{
        preserveScroll: true,
      }}
      resetOnError={['password', 'password_confirmation', 'current_password']}
      resetOnSuccess
      onError={(errors) => {
        if (errors.password) {
          passwordInput.current?.focus();
        }

        if (errors.current_password) {
          currentPasswordInput.current?.focus();
        }
      }}
      className="space-y-6"
    >
      {({ errors, processing, recentlySuccessful }) => (
        <>
          <div className="space-y-6">
            <PasswordField
              id="current_password"
              inputRef={currentPasswordInput}
              name="current_password"
              label="Current password"
              autoComplete="current-password"
              placeholder="Current password"
              error={errors.current_password}
            />

            <PasswordField
              id="password"
              inputRef={passwordInput}
              name="password"
              label="New password"
              autoComplete="new-password"
              placeholder="New password"
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
          </div>

          <div className="flex items-center gap-4">
            <Button disabled={processing} data-test="update-password-button">
              Save password
            </Button>

            <Transition
              show={recentlySuccessful}
              enter="transition ease-in-out"
              enterFrom="opacity-0"
              leave="transition ease-in-out"
              leaveTo="opacity-0"
            >
              <p className="text-sm text-muted-foreground">Saved</p>
            </Transition>
          </div>
        </>
      )}
    </Form>
  );
}
