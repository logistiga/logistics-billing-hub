<?php

namespace App\Policies;

use App\Models\Credit;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CreditPolicy
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
        return $user->hasPermission('credits.view');
    }

    public function view(User $user, Credit $credit): bool
    {
        return $user->hasPermission('credits.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('credits.create');
    }

    public function update(User $user, Credit $credit): bool
    {
        if ($credit->status === 'paid') {
            return false;
        }
        return $user->hasPermission('credits.edit');
    }

    public function delete(User $user, Credit $credit): bool
    {
        if ($credit->paid_amount > 0) {
            return false;
        }
        return $user->hasPermission('credits.delete');
    }

    public function restore(User $user, Credit $credit): bool
    {
        return $user->hasPermission('credits.delete');
    }

    public function forceDelete(User $user, Credit $credit): bool
    {
        return $user->hasRole('admin');
    }

    public function addPayment(User $user, Credit $credit): bool
    {
        if ($credit->remaining <= 0) {
            return false;
        }
        return $user->hasPermission('credits.payment');
    }

    public function export(User $user): bool
    {
        return $user->hasPermission('credits.export');
    }
}
