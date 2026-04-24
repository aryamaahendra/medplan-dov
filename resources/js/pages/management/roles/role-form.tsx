import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import rolesRoutes from '@/routes/roles';
import type { Permission } from '../permissions/columns';
import type { Role } from './columns';

interface RoleFormProps {
  role?: Role | null;
  permissions: Permission[];
}

export function RoleForm({ role, permissions }: RoleFormProps) {
  const isEditing = !!role;

  const { data, setData, post, put, processing, errors } = useForm({
    name: role?.name ?? '',
    permissions: role?.permissions?.map((p) => p.id) || ([] as number[]),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      put(rolesRoutes.update.url({ role: role.id }));
    } else {
      post(rolesRoutes.store.url());
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

  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      let group = 'Other';
      const name = permission.name.toLowerCase();

      if (name.includes('user')) {
        group = 'User Management';
      } else if (name.includes('role')) {
        group = 'Role Management';
      } else if (name.includes('permission')) {
        group = 'Permission Management';
      } else if (name.includes('org-unit')) {
        group = 'Organizational Units';
      } else if (
        name.includes('need-group') ||
        name.includes('need-type') ||
        name.includes('need-checklist')
      ) {
        group = 'Need Configuration';
      } else if (name.includes('need')) {
        group = 'Need Management';
      } else if (
        name.includes('renstra') ||
        name.includes('kpi') ||
        name.includes('planning') ||
        name.includes('ssp')
      ) {
        group = 'Strategic Planning';
      }

      if (!acc[group]) {
        acc[group] = [];
      }

      acc[group].push(permission);

      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Role Name
            </Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              disabled={processing}
              placeholder="e.g. Admin Unit"
              className="max-w-md"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-semibold">Permissions</Label>
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(
                ([group, groupPermissions]) => (
                  <div key={group} className="space-y-4">
                    <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      {group}
                    </h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {groupPermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start justify-between space-x-2 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex flex-1 flex-col gap-1">
                            <Label
                              htmlFor={`permission-${permission.id}`}
                              className="cursor-pointer text-xs leading-none font-semibold capitalize"
                            >
                              {permission.name}
                            </Label>
                            {permission.description && (
                              <p className="text-[10px] leading-tight text-muted-foreground">
                                {permission.description}
                              </p>
                            )}
                          </div>
                          <Switch
                            id={`permission-${permission.id}`}
                            checked={data.permissions.includes(permission.id)}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(permission.id, checked)
                            }
                            disabled={processing}
                            size="sm"
                            className="mr-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
            {errors.permissions && (
              <p className="text-sm text-destructive">{errors.permissions}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href={rolesRoutes.index.url()}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={processing}>
          {processing ? 'Saving...' : 'Save Role'}
        </Button>
      </div>
    </form>
  );
}
