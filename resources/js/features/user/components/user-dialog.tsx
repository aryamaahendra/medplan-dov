import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import UserController from '@/actions/App/Http/Controllers/Management/UserController';
import {
  FieldWrapper,
  InputField,
  PasswordField,
  SingleCheckboxField,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TreeSelect } from '@/components/ui/tree-select';
import type { User } from './user-columns';

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
        <InputField
          id="name"
          name="name"
          label="Name"
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
          required
          autoFocus
          placeholder="Full name"
          error={errors.name}
        />

        <InputField
          id="nip"
          name="nip"
          label="NIP (Optional)"
          value={data.nip}
          onChange={(e) => setData('nip', e.target.value)}
          placeholder="Employee Identification Number"
          error={errors.nip}
        />

        <InputField
          id="email"
          type="email"
          name="email"
          label="Email address"
          value={data.email}
          onChange={(e) => setData('email', e.target.value)}
          required
          placeholder="email@example.com"
          error={errors.email}
        />

        <PasswordField
          id="password"
          name="password"
          label={isEditing ? 'New Password (optional)' : 'Password'}
          value={data.password}
          onChange={(e) => setData('password', e.target.value)}
          required={!isEditing}
          placeholder={
            isEditing ? 'Leave blank to keep current' : 'Min 8 characters'
          }
          error={errors.password}
        />

        <PasswordField
          id="password_confirmation"
          name="password_confirmation"
          label="Confirm Password"
          value={data.password_confirmation}
          onChange={(e) => setData('password_confirmation', e.target.value)}
          required={!isEditing}
          placeholder="Repeat password"
          error={errors.password_confirmation}
        />

        <FieldWrapper
          id="organizational_unit_id"
          label="Unit Kerja"
          error={errors.organizational_unit_id}
        >
          {() => (
            <TreeSelect
              items={organizationalUnits}
              value={data.organizational_unit_id}
              onValueChange={(v) => setData('organizational_unit_id', v)}
              placeholder="Pilih unit kerja"
              className="bg-muted/20 transition-colors hover:bg-muted/40"
            />
          )}
        </FieldWrapper>

        <FieldWrapper label="Roles" error={errors.roles}>
          <div className="grid max-h-[150px] grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3">
            {roles.map((role) => (
              <SingleCheckboxField
                key={role.id}
                id={`role-${role.id}`}
                label={role.name}
                checked={data.roles.includes(role.id)}
                onCheckedChange={() => handleRoleToggle(role.id)}
              />
            ))}
          </div>
        </FieldWrapper>

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
