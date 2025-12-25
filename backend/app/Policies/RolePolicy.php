<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class RolePolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('super-admin')) {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('roles.view');
    }

    public function view(User $user, Role $role): bool
    {
        return $user->hasPermission('roles.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('roles.create');
    }

    public function update(User $user, Role $role): bool
    {
        if (in_array($role->name, ['super-admin', 'admin'])) {
            return false;
        }
        return $user->hasPermission('roles.edit');
    }

    public function delete(User $user, Role $role): bool
    {
        if (in_array($role->name, ['super-admin', 'admin'])) {
            return false;
        }
        if ($role->users()->exists()) {
            return false;
        }
        return $user->hasPermission('roles.delete');
    }

    public function restore(User $user, Role $role): bool
    {
        return $user->hasPermission('roles.delete');
    }

    public function forceDelete(User $user, Role $role): bool
    {
        return false;
    }

    public function assignPermissions(User $user, Role $role): bool
    {
        if (in_array($role->name, ['super-admin'])) {
            return false;
        }
        return $user->hasPermission('roles.permissions');
    }
}
