<?php

namespace App\Policies;

use App\Models\NoteDebut;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class NoteDebutPolicy
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
        return $user->hasPermission('notes-debut.view');
    }

    public function view(User $user, NoteDebut $noteDebut): bool
    {
        return $user->hasPermission('notes-debut.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('notes-debut.create');
    }

    public function update(User $user, NoteDebut $noteDebut): bool
    {
        if ($noteDebut->status === 'closed') {
            return $user->hasRole('admin');
        }
        return $user->hasPermission('notes-debut.edit');
    }

    public function delete(User $user, NoteDebut $noteDebut): bool
    {
        if ($noteDebut->status === 'closed') {
            return false;
        }
        return $user->hasPermission('notes-debut.delete');
    }

    public function restore(User $user, NoteDebut $noteDebut): bool
    {
        return $user->hasPermission('notes-debut.delete');
    }

    public function forceDelete(User $user, NoteDebut $noteDebut): bool
    {
        return $user->hasRole('admin');
    }

    public function validate(User $user, NoteDebut $noteDebut): bool
    {
        return $user->hasPermission('notes-debut.validate');
    }

    public function close(User $user, NoteDebut $noteDebut): bool
    {
        return $user->hasPermission('notes-debut.close');
    }

    public function export(User $user): bool
    {
        return $user->hasPermission('notes-debut.export');
    }

    public function print(User $user, NoteDebut $noteDebut): bool
    {
        return $user->hasPermission('notes-debut.view');
    }
}
