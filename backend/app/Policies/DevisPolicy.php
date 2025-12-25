<?php

namespace App\Policies;

use App\Models\Devis;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DevisPolicy
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
        return $user->hasPermission('devis.view');
    }

    public function view(User $user, Devis $devis): bool
    {
        return $user->hasPermission('devis.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('devis.create');
    }

    public function update(User $user, Devis $devis): bool
    {
        if (in_array($devis->status, ['accepted', 'converted'])) {
            return $user->hasRole('admin');
        }
        return $user->hasPermission('devis.edit');
    }

    public function delete(User $user, Devis $devis): bool
    {
        if ($devis->status === 'converted') {
            return false;
        }
        return $user->hasPermission('devis.delete');
    }

    public function restore(User $user, Devis $devis): bool
    {
        return $user->hasPermission('devis.delete');
    }

    public function forceDelete(User $user, Devis $devis): bool
    {
        return $user->hasRole('admin');
    }

    public function send(User $user, Devis $devis): bool
    {
        return $user->hasPermission('devis.send');
    }

    public function accept(User $user, Devis $devis): bool
    {
        return $user->hasPermission('devis.validate');
    }

    public function reject(User $user, Devis $devis): bool
    {
        return $user->hasPermission('devis.validate');
    }

    public function convert(User $user, Devis $devis): bool
    {
        if ($devis->status !== 'accepted') {
            return false;
        }
        return $user->hasPermission('devis.convert') || $user->hasPermission('invoices.create');
    }

    public function duplicate(User $user, Devis $devis): bool
    {
        return $user->hasPermission('devis.create');
    }

    public function export(User $user): bool
    {
        return $user->hasPermission('devis.export');
    }
}
