<?php

namespace App\Policies;

use App\Models\Partenaire;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PartenairePolicy
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
        return $user->hasPermission('partenaires.view');
    }

    public function view(User $user, Partenaire $partenaire): bool
    {
        return $user->hasPermission('partenaires.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('partenaires.create');
    }

    public function update(User $user, Partenaire $partenaire): bool
    {
        return $user->hasPermission('partenaires.edit');
    }

    public function delete(User $user, Partenaire $partenaire): bool
    {
        if ($partenaire->transactions()->exists()) {
            return false;
        }
        return $user->hasPermission('partenaires.delete');
    }

    public function restore(User $user, Partenaire $partenaire): bool
    {
        return $user->hasPermission('partenaires.delete');
    }

    public function forceDelete(User $user, Partenaire $partenaire): bool
    {
        return $user->hasRole('admin');
    }

    public function addTransaction(User $user, Partenaire $partenaire): bool
    {
        return $user->hasPermission('partenaires.transaction');
    }

    public function export(User $user): bool
    {
        return $user->hasPermission('partenaires.export');
    }
}
