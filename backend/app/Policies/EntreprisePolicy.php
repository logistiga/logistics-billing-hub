<?php

namespace App\Policies;

use App\Models\Entreprise;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class EntreprisePolicy
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
        return $user->hasPermission('entreprise.view');
    }

    public function view(User $user, Entreprise $entreprise): bool
    {
        return $user->hasPermission('entreprise.view');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, Entreprise $entreprise): bool
    {
        return $user->hasPermission('entreprise.edit');
    }

    public function delete(User $user, Entreprise $entreprise): bool
    {
        return $user->hasRole('admin');
    }

    public function restore(User $user, Entreprise $entreprise): bool
    {
        return $user->hasRole('admin');
    }

    public function forceDelete(User $user, Entreprise $entreprise): bool
    {
        return false;
    }

    public function updateSettings(User $user, Entreprise $entreprise): bool
    {
        return $user->hasPermission('entreprise.settings');
    }
}
