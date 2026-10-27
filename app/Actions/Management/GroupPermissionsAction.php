<?php

declare(strict_types=1);

namespace App\Actions\Management;

use Illuminate\Support\Collection;
use Spatie\Permission\Models\Permission;

class GroupPermissionsAction
{
    /**
     * @param  Collection<int, Permission>  $permissions
     * @return array<int, array{
     *     key: string,
     *     title: string,
     *     description: string,
     *     permissions: array<int, array{
     *         id: int,
     *         name: string,
     *         description: ?string
     *     }>
     * }>
     */
    public function handle(Collection $permissions): array
    {
        $groupDefinitions = [
            'users' => [
                'title' => 'User Management',
                'description' => 'Manage user accounts, roles, and profiles',
                'match' => static fn (string $name): bool => str_contains($name, 'user'),
            ],
            'roles' => [
                'title' => 'Role Management',
                'description' => 'Manage user roles and permissions',
                'match' => static fn (string $name): bool => str_contains($name, 'role'),
            ],
            'permissions' => [
                'title' => 'Permission Management',
                'description' => 'View and manage system permissions',
                'match' => static fn (string $name): bool => str_contains($name, 'permission'),
            ],
            'org_units' => [
                'title' => 'Organizational Units',
                'description' => 'Manage department and organizational hierarchy',
                'match' => static fn (string $name): bool => str_contains($name, 'org-unit'),
            ],
            'need_tabs_view' => [
                'title' => 'Need Tabs (View)',
                'description' => 'Visibility access for individual proposal tabs',
                'match' => static fn (string $name): bool => str_contains($name, 'view need tab'),
            ],
            'need_tabs_update' => [
                'title' => 'Need Tabs (Edit)',
                'description' => 'Edit access for individual proposal tabs',
                'match' => static fn (string $name): bool => str_contains($name, 'update need tab'),
            ],
            'need_attachments' => [
                'title' => 'Need Attachments',
                'description' => 'Upload, view, and delete proposal attachments',
                'match' => static fn (string $name): bool => str_contains($name, 'need-attachment'),
            ],
            'need_groups' => [
                'title' => 'Need Groups',
                'description' => 'Manage proposal submission windows and cycles',
                'match' => static fn (string $name): bool => str_contains($name, 'need-group'),
            ],
            'need_types' => [
                'title' => 'Need Types',
                'description' => 'Manage proposal classification categories',
                'match' => static fn (string $name): bool => str_contains($name, 'need-type'),
            ],
            'checklist_questions' => [
                'title' => 'Checklist Questions',
                'description' => 'Configure readiness checklist criteria',
                'match' => static fn (string $name): bool => str_contains($name, 'checklist-question'),
            ],
            'needs_global' => [
                'title' => 'Need Proposals (Global Access)',
                'description' => 'Access and modify proposals across all organizational units',
                'match' => static fn (string $name): bool => str_contains($name, 'any need'),
            ],
            'needs_descendant' => [
                'title' => 'Need Proposals (Descendant Units)',
                'description' => 'Access and modify proposals for own unit and child units',
                'match' => static fn (string $name): bool => str_contains($name, 'descendant need'),
            ],
            'needs_own' => [
                'title' => 'Need Proposals (Unit Level)',
                'description' => 'Create, edit, lock, and manage unit-level proposals and checklists',
                'match' => static fn (string $name): bool => str_contains($name, 'need')
                    || str_contains($name, 'checklist'),
            ],
            'kpi_groups' => [
                'title' => 'KPI Groups',
                'description' => 'Manage Key Performance Indicator periods and groups',
                'match' => static fn (string $name): bool => str_contains($name, 'kpi-group'),
            ],
            'kpi_indicators' => [
                'title' => 'KPI Indicators',
                'description' => 'Manage Key Performance Indicators',
                'match' => static fn (string $name): bool => str_contains($name, 'kpi-indicator'),
            ],
            'kpi_targets' => [
                'title' => 'KPI Annual Targets',
                'description' => 'Set and manage annual targets for KPI indicators',
                'match' => static fn (string $name): bool => str_contains($name, 'kpi-target'),
            ],
            'renstras' => [
                'title' => 'Renstra (Master)',
                'description' => 'Manage Strategic Plan master periods',
                'match' => static fn (string $name): bool => str_contains($name, 'renstra'),
            ],
            'tujuans' => [
                'title' => 'Renstra (Tujuan)',
                'description' => 'Manage Strategic Goals (Tujuan)',
                'match' => static fn (string $name): bool => str_contains($name, 'tujuan'),
            ],
            'sasarans' => [
                'title' => 'Renstra (Sasaran)',
                'description' => 'Manage Strategic Targets (Sasaran)',
                'match' => static fn (string $name): bool => str_contains($name, 'sasaran'),
            ],
            'indicators' => [
                'title' => 'Renstra (Indicators)',
                'description' => 'Manage Strategic Plan Indicators',
                'match' => static fn (string $name): bool => str_contains($name, 'indicator'),
            ],
            'ssps' => [
                'title' => 'Strategic Service Plans (SSP)',
                'description' => 'Manage Strategic Service Plan programs and directions',
                'match' => static fn (string $name): bool => str_contains($name, 'ssp'),
            ],
            'planning_versions' => [
                'title' => 'Planning Versions',
                'description' => 'Manage activity planning version lifecycles',
                'match' => static fn (string $name): bool => str_contains($name, 'planning-version'),
            ],
            'planning_activities' => [
                'title' => 'Planning Activities',
                'description' => 'Manage detailed planning activity items and budgets',
                'match' => static fn (string $name): bool => str_contains($name, 'planning-activity'),
            ],
        ];

        $buckets = [];
        foreach ($groupDefinitions as $key => $def) {
            $buckets[$key] = [
                'key' => $key,
                'title' => $def['title'],
                'description' => $def['description'],
                'permissions' => [],
            ];
        }

        $otherBucket = [
            'key' => 'other',
            'title' => 'Other Permissions',
            'description' => 'General system permissions',
            'permissions' => [],
        ];

        /** @var Permission $permission */
        foreach ($permissions as $permission) {
            $assigned = false;
            $name = strtolower($permission->name);

            $payload = [
                'id' => (int) $permission->id,
                'name' => $permission->name,
                'description' => $permission->description ?? null,
            ];

            foreach ($groupDefinitions as $key => $def) {
                if ($def['match']($name)) {
                    $buckets[$key]['permissions'][] = $payload;
                    $assigned = true;
                    break;
                }
            }

            if (! $assigned) {
                $otherBucket['permissions'][] = $payload;
            }
        }

        $result = array_values(array_filter($buckets, static fn (array $group): bool => ! empty($group['permissions'])));

        if (! empty($otherBucket['permissions'])) {
            $result[] = $otherBucket;
        }

        return $result;
    }
}
