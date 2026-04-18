import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import rolesRoutes from '@/routes/roles';
import type { Permission } from '../permissions/columns';
import type { Role } from './columns';

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  permissions: Permission[];
}

export function RoleDialog({
  open,
  onOpenChange,
  role,
  permissions,
}: RoleDialogProps) {
  const isEditing = !!role;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: role?.name ?? '',
    permissions: role?.permissions?.map((p) => p.id) || ([] as number[]),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      put(rolesRoutes.update.url({ role: role.id }), {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      post(rolesRoutes.store.url(), {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    if (checked) {
      setData('permissions', [...data.permissions, permissionId]);
    } else {
      setData(
        'permissions',
        data.permissions.filter((id) => id !== permissionId),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Role' : 'Create Role'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Make changes to the role here. Click save when you are done.'
              : 'Add a new role and assign permissions.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              disabled={processing}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="mt-2 grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3">
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={data.permissions.includes(permission.id)}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permission.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`permission-${permission.id}`}
                    className="cursor-pointer text-sm leading-none font-normal text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {permission.name}
                  </Label>
                </div>
              ))}
            </div>
            {errors.permissions && (
              <p className="text-sm text-destructive">{errors.permissions}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
