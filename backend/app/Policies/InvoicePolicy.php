<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class InvoicePolicy
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
        return $user->hasPermission('invoices.view');
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $user->hasPermission('invoices.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('invoices.create');
    }

    public function update(User $user, Invoice $invoice): bool
    {
        if ($invoice->status === 'paid') {
            return $user->hasRole('admin');
        }
        return $user->hasPermission('invoices.edit');
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        if ($invoice->status === 'paid') {
            return false;
        }
        return $user->hasPermission('invoices.delete');
    }

    public function restore(User $user, Invoice $invoice): bool
    {
        return $user->hasPermission('invoices.delete');
    }

    public function forceDelete(User $user, Invoice $invoice): bool
    {
        return $user->hasRole('admin');
    }

    public function validate(User $user, Invoice $invoice): bool
    {
        return $user->hasPermission('invoices.validate');
    }

    public function send(User $user, Invoice $invoice): bool
    {
        return $user->hasPermission('invoices.send');
    }

    public function addPayment(User $user, Invoice $invoice): bool
    {
        return $user->hasPermission('payments.create');
    }

    public function export(User $user): bool
    {
        return $user->hasPermission('invoices.export');
    }

    public function print(User $user, Invoice $invoice): bool
    {
        return $user->hasPermission('invoices.view');
    }
}
