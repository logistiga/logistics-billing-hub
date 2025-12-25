<?php

namespace App\Policies;

use App\Models\Avoir;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AvoirPolicy
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
        return $user->hasPermission('avoirs.view');
    }

    public function view(User $user, Avoir $avoir): bool
    {
        return $user->hasPermission('avoirs.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('avoirs.create');
    }

    public function update(User $user, Avoir $avoir): bool
    {
        if ($avoir->status === 'compensated') {
            return false;
        }
        return $user->hasPermission('avoirs.edit');
    }

    public function delete(User $user, Avoir $avoir): bool
    {
        if ($avoir->status === 'compensated') {
            return false;
        }
        return $user->hasPermission('avoirs.delete');
    }

    public function restore(User $user, Avoir $avoir): bool
    {
        return $user->hasPermission('avoirs.delete');
    }

    public function forceDelete(User $user, Avoir $avoir): bool
    {
        return $user->hasRole('admin');
    }

    public function validate(User $user, Avoir $avoir): bool
    {
        return $user->hasPermission('avoirs.validate');
    }

    public function compensate(User $user, Avoir $avoir): bool
    {
        if ($avoir->remaining <= 0) {
            return false;
        }
        return $user->hasPermission('avoirs.compensate');
    }

    public function export(User $user): bool
    {
        return $user->hasPermission('avoirs.export');
    }
}
