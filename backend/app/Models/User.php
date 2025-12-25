<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
        'password' => 'hashed',
    ];

    // Relations
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'model_has_roles', 'model_id', 'role_id')
            ->where('model_type', self::class);
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'model_has_permissions', 'model_id', 'permission_id')
            ->where('model_type', self::class);
    }

    // Methods
    public function hasRole(string $role): bool
    {
        return $this->roles()->where('name', $role)->exists();
    }

    public function hasPermission(string $permission): bool
    {
        // Check direct permissions
        if ($this->permissions()->where('name', $permission)->exists()) {
            return true;
        }

        // Check permissions through roles
        foreach ($this->roles as $role) {
            if ($role->permissions()->where('name', $permission)->exists()) {
                return true;
            }
        }

        return false;
    }

    public function assignRole(string $role): void
    {
        $roleModel = Role::where('name', $role)->first();
        if ($roleModel) {
            $this->roles()->syncWithoutDetaching([$roleModel->id]);
        }
    }

    public function removeRole(string $role): void
    {
        $roleModel = Role::where('name', $role)->first();
        if ($roleModel) {
            $this->roles()->detach($roleModel->id);
        }
    }

    public function getAllPermissions()
    {
        $permissions = $this->permissions;

        foreach ($this->roles as $role) {
            $permissions = $permissions->merge($role->permissions);
        }

        return $permissions->unique('id');
    }
}
