<?php

namespace Database\Factories;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

class PermissionFactory extends Factory
{
    protected $model = Permission::class;

    public function definition(): array
    {
        $modules = ['users', 'clients', 'invoices', 'devis', 'ordres', 'banques', 'caisses', 'rapports'];
        $actions = ['view', 'create', 'update', 'delete', 'export'];
        
        $module = fake()->randomElement($modules);
        $action = fake()->randomElement($actions);

        return [
            'name' => ucfirst($action) . ' ' . ucfirst($module),
            'slug' => $module . '.' . $action,
            'description' => "Permission to {$action} {$module}",
            'module' => $module,
        ];
    }
}
