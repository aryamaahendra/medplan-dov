import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import UserController from '@/actions/App/Http/Controllers/Management/UserController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
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
import { TreeSelect } from '@/components/ui/tree-select';

import type { User } from './columns';

interface UserDialogProps {
  user?: User | null;
  roles: { id: number; name: string }[];
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDialog(props: UserDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="pb-0 sm:max-w-[425px]">
        <UserFormContent key={props.user?.id ?? 'new'} {...props} />
      </DialogContent>
    </Dialog>
  );
}

function UserFormContent({
  user,
  roles,
  organizationalUnits,
  onOpenChange,
}: UserDialogProps) {
  const isEditing = !!user;

  const { data, setData, post, patch, processing, errors, reset } = useForm({
    name: user?.name ?? '',
    nip: user?.nip ?? '',
    email: user?.email ?? '',
    password: '',
    password_confirmation: '',
    roles: user?.roles?.map((r: any) => r.id) ?? [],
    organizational_unit_id: user?.organizational_unit_id?.toString() ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const options = {
      onSuccess: () => {
        onOpenChange(false);
        reset();
        toast.success(
          isEditing
            ? 'User updated successfully.'
            : 'User created successfully.',
        );
      },
    };

    if (isEditing) {
      patch(UserController.update.url({ user: user.id }), options);
    } else {
      post(UserController.store.url(), options);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    const newRoles = data.roles.includes(roleId)
      ? data.roles.filter((id) => id !== roleId)
      : [...data.roles, roleId];
    setData('roles', newRoles);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? `Update details for ${user.name}.`
            : 'Register a new user in the system.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            required
            autoFocus
            placeholder="Full name"
          />
          <InputError message={errors.name} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="nip">NIP (Optional)</Label>
          <Input
            id="nip"
            name="nip"
            value={data.nip}
            onChange={(e) => setData('nip', e.target.value)}
            placeholder="Employee Identification Number"
          />
          <InputError message={errors.nip} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            required
            placeholder="email@example.com"
          />
          <InputError message={errors.email} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">
            {isEditing ? 'New Password (optional)' : 'Password'}
          </Label>
          <PasswordInput
            id="password"
            name="password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            required={!isEditing}
            placeholder={
              isEditing ? 'Leave blank to keep current' : 'Min 8 characters'
            }
          />
          <InputError message={errors.password} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password_confirmation">Confirm Password</Label>
          <PasswordInput
            id="password_confirmation"
            name="password_confirmation"
            value={data.password_confirmation}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            required={!isEditing}
            placeholder="Repeat password"
          />
          <InputError message={errors.password_confirmation} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="organizational_unit_id">Unit Kerja</Label>
          <TreeSelect
            items={organizationalUnits}
            value={data.organizational_unit_id}
            onValueChange={(v) => setData('organizational_unit_id', v)}
            placeholder="Pilih unit kerja"
            className="bg-muted/20 transition-colors hover:bg-muted/40"
          />
          <InputError message={errors.organizational_unit_id} />
        </div>

        <div className="grid gap-2">
          <Label>Roles</Label>
          <div className="mt-2 grid max-h-[150px] grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`role-${role.id}`}
                  checked={data.roles.includes(role.id)}
                  onChange={() => handleRoleToggle(role.id)}
                  className="rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                />
                <Label
                  htmlFor={`role-${role.id}`}
                  className="cursor-pointer text-sm leading-none font-normal"
                >
                  {role.name}
                </Label>
              </div>
            ))}
          </div>
          <InputError message={errors.roles} />
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
      </form>
    </>
  );
}
