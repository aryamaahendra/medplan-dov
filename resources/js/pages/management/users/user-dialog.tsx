import { Form } from '@inertiajs/react';
import { toast } from 'sonner';

import UserController from '@/actions/App/Http/Controllers/Management/UserController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { User } from './columns';

interface UserDialogProps {
  user?: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
  const isEditing = !!user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pb-0 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update details for ${user.name}.`
              : 'Register a new user in the system.'}
          </DialogDescription>
        </DialogHeader>

        <Form
          key={user?.id ?? 'new-user'}
          {...(isEditing
            ? UserController.update.form({ user: user.id })
            : UserController.store.form())}
          onSuccess={() => {
            onOpenChange(false);
            toast.success(
              isEditing
                ? 'User updated successfully.'
                : 'User created successfully.',
            );
          }}
          className="space-y-4"
        >
          {({ processing, errors }) => (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user?.name ?? ''}
                  required
                  autoFocus
                  placeholder="Full name"
                />
                <InputError message={errors.name} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  defaultValue={user?.email ?? ''}
                  required
                  placeholder="email@example.com"
                />
                <InputError message={errors.email} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">
                  {isEditing ? 'New Password (optional)' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required={!isEditing}
                  placeholder={
                    isEditing
                      ? 'Leave blank to keep current'
                      : 'Min 12 characters'
                  }
                />
                <InputError message={errors.password} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  name="password_confirmation"
                  required={!isEditing}
                  placeholder="Repeat password"
                />
                <InputError message={errors.password_confirmation} />
              </div>

              <DialogFooter className="mb-0!">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {isEditing ? 'Update User' : 'Create User'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
