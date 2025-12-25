<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
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
        return $user->hasPermission('users.view');
    }

    public function view(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return true;
        }
        return $user->hasPermission('users.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('users.create');
    }

    public function update(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return true;
        }
        if ($model->hasRole('super-admin') && !$user->hasRole('super-admin')) {
            return false;
        }
        return $user->hasPermission('users.edit');
    }

    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }
        if ($model->hasRole('super-admin')) {
            return false;
        }
        return $user->hasPermission('users.delete');
    }

    public function restore(User $user, User $model): bool
    {
        return $user->hasPermission('users.delete');
    }

    public function forceDelete(User $user, User $model): bool
    {
        return false;
    }

    public function assignRole(User $user, User $model): bool
    {
        if ($model->hasRole('super-admin') && !$user->hasRole('super-admin')) {
            return false;
        }
        return $user->hasPermission('users.roles');
    }

    public function updatePermissions(User $user, User $model): bool
    {
        if ($model->hasRole('super-admin') && !$user->hasRole('super-admin')) {
            return false;
        }
        return $user->hasPermission('users.permissions');
    }

    public function toggleStatus(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }
        if ($model->hasRole('super-admin')) {
            return false;
        }
        return $user->hasPermission('users.status');
    }

    public function resetPassword(User $user, User $model): bool
    {
        return $user->hasPermission('users.password');
    }
}
