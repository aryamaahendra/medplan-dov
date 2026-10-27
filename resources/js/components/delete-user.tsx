import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { PasswordField } from '@/components/form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
export default function DeleteUser() {
  const passwordInput = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <Heading
        variant="small"
        title="Delete account"
        description="Delete your account and all of its resources"
      />
      <div className="space-y-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
        <div className="relative space-y-0.5 text-destructive">
          <p className="font-medium">Warning</p>
          <p className="text-sm">
            Please proceed with caution, this cannot be undone.
          </p>
        </div>

        <Dialog>
          <DialogTrigger
            render={
              <Button variant="destructive" data-test="delete-user-button" />
            }
          >
            Delete account
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              Are you sure you want to delete your account?
            </DialogTitle>
            <DialogDescription>
              Once your account is deleted, all of its resources and data will
              also be permanently deleted. Please enter your password to confirm
              you would like to permanently delete your account.
            </DialogDescription>

            <Form
              {...ProfileController.destroy.form()}
              options={{
                preserveScroll: true,
              }}
              onError={() => passwordInput.current?.focus()}
              resetOnSuccess
              className="space-y-6"
            >
              {({ resetAndClearErrors, processing, errors }) => (
                <>
                  <PasswordField
                    id="password"
                    name="password"
                    label="Password"
                    hideLabel
                    inputRef={passwordInput}
                    placeholder="Password"
                    autoComplete="current-password"
                    error={errors.password}
                  />

                  <DialogFooter className="gap-2">
                    <DialogClose
                      render={
                        <Button
                          variant="secondary"
                          onClick={() => resetAndClearErrors()}
                        />
                      }
                    >
                      Cancel
                    </DialogClose>

                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={processing}
                      data-test="confirm-delete-user-button"
                    >
                      Delete account
                    </Button>
                  </DialogFooter>
                </>
              )}
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
