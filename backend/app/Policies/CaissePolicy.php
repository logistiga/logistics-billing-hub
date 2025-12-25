<?php

namespace App\Policies;

use App\Models\Caisse;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CaissePolicy
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
        return $user->hasPermission('caisse.view');
    }

    public function view(User $user, Caisse $caisse): bool
    {
        return $user->hasPermission('caisse.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('caisse.create');
    }

    public function update(User $user, Caisse $caisse): bool
    {
        return $user->hasPermission('caisse.edit');
    }

    public function delete(User $user, Caisse $caisse): bool
    {
        if ($caisse->mouvements()->exists()) {
            return false;
        }
        return $user->hasPermission('caisse.delete');
    }

    public function restore(User $user, Caisse $caisse): bool
    {
        return $user->hasPermission('caisse.delete');
    }

    public function forceDelete(User $user, Caisse $caisse): bool
    {
        return $user->hasRole('admin');
    }

    public function addMouvement(User $user, Caisse $caisse): bool
    {
        return $user->hasPermission('caisse.mouvement');
    }

    public function close(User $user, Caisse $caisse): bool
    {
        return $user->hasPermission('caisse.close');
    }

    public function export(User $user): bool
    {
        return $user->hasPermission('caisse.export');
    }
}
