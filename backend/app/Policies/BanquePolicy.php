<?php

namespace App\Policies;

use App\Models\Banque;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class BanquePolicy
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
        return $user->hasPermission('banques.view');
    }

    public function view(User $user, Banque $banque): bool
    {
        return $user->hasPermission('banques.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('banques.create');
    }

    public function update(User $user, Banque $banque): bool
    {
        return $user->hasPermission('banques.edit');
    }

    public function delete(User $user, Banque $banque): bool
    {
        if ($banque->transactions()->exists()) {
            return false;
        }
        return $user->hasPermission('banques.delete');
    }

    public function restore(User $user, Banque $banque): bool
    {
        return $user->hasPermission('banques.delete');
    }

    public function forceDelete(User $user, Banque $banque): bool
    {
        return $user->hasRole('admin');
    }

    public function reconcile(User $user, Banque $banque): bool
    {
        return $user->hasPermission('banques.reconcile');
    }

    public function export(User $user): bool
    {
        return $user->hasPermission('banques.export');
    }
}
