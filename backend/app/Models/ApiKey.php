<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'key',
        'prefix',
        'permissions',
        'rate_limit',
        'expires_at',
        'last_used_at',
        'last_used_ip',
        'is_active',
        'created_by',
        'description',
    ];

    protected $casts = [
        'permissions' => 'array',
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
        'is_active' => 'boolean',
        'rate_limit' => 'integer',
    ];

    protected $hidden = [
        'key',
    ];

    // Relations
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    // Methods
    public static function generateKey(): array
    {
        $prefix = 'sk_' . (app()->environment('production') ? 'live' : 'test') . '_';
        $rawKey = $prefix . Str::random(32);
        $hashedKey = hash('sha256', $rawKey);

        return [
            'raw' => $rawKey,
            'hashed' => $hashedKey,
            'prefix' => substr($rawKey, 0, 12),
        ];
    }

    public static function findByKey(string $rawKey): ?self
    {
        $hashedKey = hash('sha256', $rawKey);
        return static::where('key', $hashedKey)->first();
    }

    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    public function hasPermission(string $permission): bool
    {
        if (empty($this->permissions)) {
            return true; // Si pas de permissions définies, tout est autorisé
        }

        return in_array($permission, $this->permissions) || in_array('*', $this->permissions);
    }

    public function recordUsage(string $ip = null): void
    {
        $this->update([
            'last_used_at' => now(),
            'last_used_ip' => $ip,
        ]);
    }

    public function getDisplayKey(): string
    {
        return $this->prefix . '****' . substr($this->prefix, -4);
    }

    // Available permissions
    public static function availablePermissions(): array
    {
        return [
            'clients:read' => 'Lire les clients',
            'clients:write' => 'Créer/modifier les clients',
            'ordres:read' => 'Lire les ordres de travail',
            'ordres:write' => 'Créer/modifier les ordres de travail',
            'ordres:status' => 'Modifier le statut des OT',
            'invoices:read' => 'Lire les factures',
            'invoices:write' => 'Créer/modifier les factures',
            '*' => 'Accès complet',
        ];
    }
}
