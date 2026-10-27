import { Form, Head } from '@inertiajs/react';
import { InputField, PasswordField } from '@/components/form';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
// import { store } from "@/routes/register";

export default function Register() {
  return (
    <>
      <Head title="Register" />
      <Form
        // {...store.form()}
        action="#"
        resetOnSuccess={['password', 'password_confirmation']}
        disableWhileProcessing
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <>
            <div className="grid gap-6">
              <InputField
                id="name"
                type="text"
                name="name"
                label="Name"
                required
                autoFocus
                tabIndex={1}
                autoComplete="name"
                placeholder="Full name"
                error={errors.name}
              />

              <InputField
                id="email"
                type="email"
                name="email"
                label="Email address"
                required
                tabIndex={2}
                autoComplete="email"
                placeholder="email@example.com"
                error={errors.email}
              />

              <PasswordField
                id="password"
                name="password"
                label="Password"
                required
                tabIndex={3}
                autoComplete="new-password"
                placeholder="Password"
                error={errors.password}
              />

              <PasswordField
                id="password_confirmation"
                name="password_confirmation"
                label="Confirm password"
                required
                tabIndex={4}
                autoComplete="new-password"
                placeholder="Confirm password"
                error={errors.password_confirmation}
              />

              <Button
                type="submit"
                className="mt-2 w-full"
                tabIndex={5}
                data-test="register-user-button"
              >
                {processing && <Spinner />}
                Create account
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <TextLink href={login()} tabIndex={6}>
                Log in
              </TextLink>
            </div>
          </>
        )}
      </Form>
    </>
  );
}

Register.layout = {
  title: 'Create an account',
  description: 'Enter your details below to create your account',
};
