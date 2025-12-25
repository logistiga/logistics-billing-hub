<?php

namespace App\Services;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Eloquent\Collection;

class RoleService
{
    public function getAllRoles(): Collection
    {
        return Role::with('permissions')->withCount('users')->get();
    }

    public function getRoleById(int $id): ?Role
    {
        return Role::with('permissions')->withCount('users')->find($id);
    }

    public function createRole(array $data): Role
    {
        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => $data['guard_name'] ?? 'web',
            'description' => $data['description'] ?? null,
        ]);

        if (!empty($data['permissions'])) {
            $role->permissions()->sync($data['permissions']);
        }

        return $role->load('permissions');
    }

    public function updateRole(Role $role, array $data): Role
    {
        $role->update($data);

        if (isset($data['permissions'])) {
            $role->permissions()->sync($data['permissions']);
        }

        return $role->load('permissions');
    }

    public function deleteRole(Role $role): bool
    {
        return $role->delete();
    }

    public function getAllPermissions(): Collection
    {
        return Permission::orderBy('group')->orderBy('name')->get();
    }

    public function getPermissionsByGroup(): array
    {
        return Permission::orderBy('name')
            ->get()
            ->groupBy('group')
            ->toArray();
    }

    public function createPermission(array $data): Permission
    {
        return Permission::create([
            'name' => $data['name'],
            'guard_name' => $data['guard_name'] ?? 'web',
            'group' => $data['group'] ?? null,
            'description' => $data['description'] ?? null,
        ]);
    }

    public function syncRolePermissions(Role $role, array $permissionIds): Role
    {
        $role->permissions()->sync($permissionIds);
        return $role->load('permissions');
    }
}
