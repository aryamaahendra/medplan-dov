# Role-Based Access Control (RBAC) Implementation Checklist

> `spatie/laravel-permission` is installed. `HasRoles` trait is on `User`. Role CRUD (`RoleController`, `PermissionController`) exists. Existing policies (`NeedTypePolicy`, `OrganizationalUnitPolicy`, `SasaranPolicy`, `TujuanPolicy`) are stubs — every method returns `false`.

---

## Current Gap Analysis

| Area | Status | Gap |
|---|---|---|
| `HasRoles` on `User` model | ✅ Done | — |
| Role/Permission CRUD routes | ✅ Done | No authorization on these routes themselves |
| Existing policies | ⚠️ Stub | All return `false`, not wired to permissions |
| Roles/permissions in Inertia shared data | ❌ Missing | Frontend has no access to user caps |
| Route/controller middleware | ❌ Missing | All routes open to any `auth+verified` user |
| `super-admin` bypass in policies | ❌ Missing | No global `before()` hook |
| `RolesAndPermissionsSeeder` | ❌ Missing | No baseline roles/permissions defined |
| `NeedPolicy` | ❌ Missing | Most critical model, no policy at all |
| Data scoping (unit-level visibility) | ❌ Missing | All users see all needs |

---

## 1. Backend – Priority Order

### 1.1. `RolesAndPermissionsSeeder` (Do First)
Everything else depends on named permissions existing in the DB.

- [ ] Create `database/seeders/RolesAndPermissionsSeeder.php`
- [ ] Define roles: `super-admin`, `admin`, `planner`, `unit-head`, `staff`
- [ ] Define all permission strings (see Section 4 below for the full list)
- [ ] Assign permission sets to roles (e.g., `admin` gets all, `staff` gets only `create needs`)
- [ ] Register in `DatabaseSeeder::class`
- [ ] Run: `vendor/bin/sail artisan db:seed --class=RolesAndPermissionsSeeder`

### 1.2. Fill In Existing Policy Stubs
All four current policies return `false` and need Spatie wiring.

- [ ] Add a `before(User $user)` method to each policy (super-admin bypass):
  ```php
  public function before(User $user): ?bool
  {
      return $user->hasRole('super-admin') ? true : null;
  }
  ```
- [ ] Replace every `return false;` with `$user->hasPermissionTo('...')` calls using the permissions defined in the seeder.
- [ ] Files to update:
  - `app/Policies/NeedTypePolicy.php`
  - `app/Policies/OrganizationalUnitPolicy.php`
  - `app/Policies/SasaranPolicy.php`
  - `app/Policies/TujuanPolicy.php`

### 1.3. Create Missing Critical Policies
- [ ] `vendor/bin/sail artisan make:policy NeedPolicy --model=Need`
- [ ] `vendor/bin/sail artisan make:policy UserPolicy --model=User`
- [ ] `vendor/bin/sail artisan make:policy NeedGroupPolicy --model=NeedGroup`
- [ ] `vendor/bin/sail artisan make:policy RenstraPolicy --model=Renstra`
- [ ] `vendor/bin/sail artisan make:policy KpiGroupPolicy --model=KpiGroup`
- [ ] `vendor/bin/sail artisan make:policy PlanningVersionPolicy --model=PlanningVersion`

  > Sub-models (NeedDetail, NeedAttachment, NeedChecklistAnswer) can delegate to NeedPolicy via the `authorize('update', $need)` of their parent, keeping things simple.

### 1.4. Wire `authorize()` Into Controllers
- [ ] Add `$this->authorize('viewAny', Need::class)` etc. to controller methods.
  - `NeedController` — all 6 actions
  - `UserController` — all actions
  - `RoleController` — all actions (currently unguarded — anyone can manage roles!)
  - `OrganizationalUnitController`, `NeedTypeController`, `NeedGroupController`
  - `RenstraController`, `TujuanController`, `SasaranController`, `IndicatorController`
  - `KpiGroupController`, `KpiIndicatorController`
  - `PlanningVersionController`, `PlanningActivityVersionController`
  - `StrategicServicePlanController`, `ChecklistQuestionController`

### 1.5. Share Roles/Permissions with Frontend via Inertia
- [ ] Update `app/Http/Middleware/HandleInertiaRequests.php`:
  ```php
  'auth' => [
      'user'        => $request->user(),
      'roles'       => $request->user()?->getRoleNames() ?? [],
      'permissions' => $request->user()?->getAllPermissions()->pluck('name') ?? [],
  ],
  ```
- [ ] Update TypeScript `PageProps` type definition to include `roles: string[]` and `permissions: string[]`.

### 1.6. (Optional) Unit-Level Data Scoping for Needs
- [ ] In `NeedPolicy::viewAny` and `NeedController::index`, scope the query:
  - `staff` / `unit-head` → only sees needs from their `organizational_unit_id`
  - `planner` / `admin` → sees all
- [ ] This may require adding `organizational_unit_id` to the `users` table.

---

## 2. Frontend Integration (React/Inertia)

### 2.1. `usePermissions()` Hook
- [ ] Create `resources/js/hooks/use-permissions.ts`:
  ```typescript
  import { usePage } from '@inertiajs/react';
  import type { PageProps } from '@/types';

  export function usePermissions() {
      const { auth } = usePage<PageProps>().props;
      return {
          can: (permission: string) => auth.permissions.includes(permission),
          hasRole: (role: string) => auth.roles.includes(role),
      };
  }
  ```

### 2.2. Conditional UI Rendering
- [ ] Sidebar: hide management links (Users, Roles, Org Units) for non-admins
- [ ] Needs list: hide Create button if user lacks `create needs`
- [ ] Needs show: hide the director-review panel from non-directors/admins
- [ ] Roles page: accessible only to `admin` / `super-admin`

### 2.3. 403 Error Page
- [ ] Create `resources/js/pages/errors/forbidden.tsx` for graceful 403 handling

---

## 3. Data & Setup

### 3.1. Seeder (see 1.1 above - highest priority)
### 3.2. Assign Roles to Existing Users
- [ ] Run tinker or a one-off command to assign a role to the first/existing admin user so nobody is locked out after policies are activated.

---

## 4. Full Permission String Reference

Permissions to define in the seeder. Use kebab-case strings.

### Users & Roles (Admin only)
- `view any users`, `create users`, `update users`, `delete users`
- `view any roles`, `create roles`, `update roles`, `delete roles`

### Organizational Units
- `view any org-units`, `create org-units`, `update org-units`, `delete org-units`

### Needs (Core workflow)
- `view any needs`, `view needs`, `create needs`, `update needs`, `delete needs`
- `approve needs` *(custom — only for director-review action)*

### Need Configuration (Admin / Planner)
- `view any need-groups`, `create need-groups`, `update need-groups`, `delete need-groups`
- `view any need-types`, `create need-types`, `update need-types`, `delete need-types`
- `manage need-checklists` *(covers ChecklistQuestion + NeedGroupChecklist routes)*

### Strategic Planning (Planner / Admin)
- `manage renstras` *(covers Renstra + Tujuan + Sasaran + Indicator CRUD)*
- `manage kpis` *(covers KpiGroup + KpiIndicator)*
- `manage plannings` *(covers PlanningVersion + PlanningActivityVersion)*
- `manage ssp` *(StrategicServicePlan)*

---

## 5. Recommended Execution Order

```
1 → RolesAndPermissionsSeeder (permissions must exist first)
2 → Fill in existing 4 policy stubs (quick wins)
3 → Create NeedPolicy (highest risk model)
4 → Create UserPolicy (roles page is currently wide open)
5 → Wire authorize() into all controllers
6 → Share permissions in HandleInertiaRequests
7 → Create usePermissions() hook + hide UI elements
8 → Create remaining policies (KPI, Planning, etc.)
9 → (Optional) Unit-level data scoping
```
