<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ClientPolicy
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
        return $user->hasPermission('clients.view');
    }

    public function view(User $user, Client $client): bool
    {
        return $user->hasPermission('clients.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('clients.create');
    }

    public function update(User $user, Client $client): bool
    {
        return $user->hasPermission('clients.edit');
    }

    public function delete(User $user, Client $client): bool
    {
        return $user->hasPermission('clients.delete');
    }

    public function restore(User $user, Client $client): bool
    {
        return $user->hasPermission('clients.delete');
    }

    public function forceDelete(User $user, Client $client): bool
    {
        return $user->hasRole('admin');
    }

    public function export(User $user): bool
    {
        return $user->hasPermission('clients.export');
    }

    public function import(User $user): bool
    {
        return $user->hasPermission('clients.import');
    }
}
