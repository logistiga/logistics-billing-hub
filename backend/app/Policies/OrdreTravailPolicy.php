<?php

namespace App\Policies;

use App\Models\OrdreTravail;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrdreTravailPolicy
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
        return $user->hasPermission('ordres-travail.view');
    }

    public function view(User $user, OrdreTravail $ordreTravail): bool
    {
        return $user->hasPermission('ordres-travail.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('ordres-travail.create');
    }

    public function update(User $user, OrdreTravail $ordreTravail): bool
    {
        if ($ordreTravail->status === 'invoiced') {
            return $user->hasRole('admin');
        }
        return $user->hasPermission('ordres-travail.edit');
    }

    public function delete(User $user, OrdreTravail $ordreTravail): bool
    {
        if ($ordreTravail->status === 'invoiced') {
            return false;
        }
        return $user->hasPermission('ordres-travail.delete');
    }

    public function restore(User $user, OrdreTravail $ordreTravail): bool
    {
        return $user->hasPermission('ordres-travail.delete');
    }

    public function forceDelete(User $user, OrdreTravail $ordreTravail): bool
    {
        return $user->hasRole('admin');
    }

    public function validate(User $user, OrdreTravail $ordreTravail): bool
    {
        return $user->hasPermission('ordres-travail.validate');
    }

    public function invoice(User $user, OrdreTravail $ordreTravail): bool
    {
        if ($ordreTravail->status !== 'validated') {
            return false;
        }
        return $user->hasPermission('ordres-travail.invoice') || $user->hasPermission('invoices.create');
    }

    public function export(User $user): bool
    {
        return $user->hasPermission('ordres-travail.export');
    }

    public function print(User $user, OrdreTravail $ordreTravail): bool
    {
        return $user->hasPermission('ordres-travail.view');
    }
}
