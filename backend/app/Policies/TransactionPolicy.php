<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TransactionPolicy
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
        return $user->hasPermission('transactions.view');
    }

    public function view(User $user, Transaction $transaction): bool
    {
        return $user->hasPermission('transactions.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('transactions.create');
    }

    public function update(User $user, Transaction $transaction): bool
    {
        if ($transaction->is_reconciled) {
            return $user->hasRole('admin');
        }
        return $user->hasPermission('transactions.edit');
    }

    public function delete(User $user, Transaction $transaction): bool
    {
        if ($transaction->is_reconciled) {
            return false;
        }
        return $user->hasPermission('transactions.delete');
    }

    public function restore(User $user, Transaction $transaction): bool
    {
        return $user->hasPermission('transactions.delete');
    }

    public function forceDelete(User $user, Transaction $transaction): bool
    {
        return $user->hasRole('admin');
    }

    public function reconcile(User $user, Transaction $transaction): bool
    {
        return $user->hasPermission('transactions.reconcile');
    }

    public function import(User $user): bool
    {
        return $user->hasPermission('transactions.import');
    }

    public function export(User $user): bool
    {
        return $user->hasPermission('transactions.export');
    }
}
