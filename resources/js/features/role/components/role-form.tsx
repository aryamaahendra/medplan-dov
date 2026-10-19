import { useForm, Link } from '@inertiajs/react';
import { FieldWrapper, InputField, SwitchField } from '@/components/form';
import { Button } from '@/components/ui/button';
import type { Permission } from '@/features/role/components/role-columns';
import type { Role } from '@/features/role/components/role-columns';
import rolesRoutes from '@/routes/roles';

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
      } else if (name.includes('need-group')) {
        group = 'Need Configuration (Groups)';
      } else if (name.includes('need-type')) {
        group = 'Need Configuration (Types)';
      } else if (name.includes('checklist')) {
        group = 'Need Configuration (Checklists)';
      } else if (name.includes('view need tab')) {
        group = 'Need Tab Visibility';
      } else if (name.includes('update need tab')) {
        group = 'Need Tab Management';
      } else if (name.includes('any need')) {
        group = 'Need Management (Global Access)';
      } else if (name.includes('descendant need')) {
        group = 'Need Management (Parent/Descendant Access)';
      } else if (name.includes('need')) {
        group = 'Need Management (Basic Access)';
      } else if (name.includes('kpi-group')) {
        group = 'KPI (Groups)';
      } else if (name.includes('kpi-indicator')) {
        group = 'KPI (Indicators)';
      } else if (name.includes('kpi-target')) {
        group = 'KPI (Targets)';
      } else if (name.includes('renstra')) {
        group = 'Renstra';
      } else if (name.includes('tujuan') || name.includes('sasaran')) {
        group = 'Renstra (Tujuan & Sasaran)';
      } else if (name.includes('indicator')) {
        group = 'Renstra (Indicators)';
      } else if (name.includes('planning-version')) {
        group = 'Planning (Versions)';
      } else if (name.includes('planning-activity')) {
        group = 'Planning (Activities)';
      } else if (name.includes('ssp')) {
        group = 'SSP';
      }

      if (!acc[group]) {
        acc[group] = [];
      }

      acc[group].push(permission);

      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  const groupOrder = [
    'User Management',
    'Role Management',
    'Permission Management',
    'Organizational Units',
    'Need Management (Basic Access)',
    'Need Management (Parent/Descendant Access)',
    'Need Management (Global Access)',
    'Need Tab Visibility',
    'Need Tab Management',
    'Need Configuration (Groups)',
    'Need Configuration (Types)',
    'Need Configuration (Checklists)',
    'Renstra',
    'Renstra (Tujuan & Sasaran)',
    'Renstra (Indicators)',
    'KPI (Groups)',
    'KPI (Indicators)',
    'KPI (Targets)',
    'Planning (Versions)',
    'Planning (Activities)',
    'SSP',
    'Other',
  ];

  const sortedGroups = Object.entries(groupedPermissions).sort(([a], [b]) => {
    const indexA = groupOrder.indexOf(a);
    const indexB = groupOrder.indexOf(b);

    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <InputField
            id="name"
            label="Role Name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            disabled={processing}
            placeholder="e.g. Admin Unit"
            className="max-w-md"
            error={errors.name}
          />

          <FieldWrapper label="Permissions" error={errors.permissions}>
            <div className="space-y-6">
              {sortedGroups.map(([group, groupPermissions]) => (
                <div key={group} className="space-y-4">
                  <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    {group}
                  </h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {groupPermissions
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((permission) => (
                        <SwitchField
                          key={permission.id}
                          id={`permission-${permission.id}`}
                          label={permission.name}
                          description={permission.description}
                          variant="choice-card"
                          checked={data.permissions.includes(permission.id)}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(permission.id, checked)
                          }
                          disabled={processing}
                          size="sm"
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </FieldWrapper>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          render={<Link href={rolesRoutes.index.url()}>Cancel</Link>}
        />
        <Button type="submit" disabled={processing}>
          {processing ? 'Saving...' : 'Save Role'}
        </Button>
      </div>
    </form>
  );
}
