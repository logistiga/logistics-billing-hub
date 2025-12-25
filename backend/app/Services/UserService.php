<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = User::with('roles');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (!empty($filters['role'])) {
            $query->whereHas('roles', function ($q) use ($filters) {
                $q->where('name', $filters['role']);
            });
        }

        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getById(int $id): ?User
    {
        return User::with('roles.permissions')->find($id);
    }

    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        if (!empty($data['role'])) {
            $user->assignRole($data['role']);
        }

        return $user->load('roles');
    }

    public function update(User $user, array $data): User
    {
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        if (isset($data['role'])) {
            $user->roles()->detach();
            if ($data['role']) {
                $user->assignRole($data['role']);
            }
        }

        return $user->load('roles');
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }

    public function toggleActive(User $user): User
    {
        $user->update(['is_active' => !$user->is_active]);
        return $user;
    }

    public function updatePassword(User $user, string $newPassword): User
    {
        $user->update(['password' => Hash::make($newPassword)]);
        return $user;
    }

    public function updateLastLogin(User $user): void
    {
        $user->update(['last_login_at' => now()]);
    }
}
