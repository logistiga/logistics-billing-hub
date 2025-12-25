<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create roles table
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('guard_name')->default('web');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Create permissions table
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('guard_name')->default('web');
            $table->string('group')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Create role_has_permissions pivot table
        Schema::create('role_has_permissions', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->primary(['role_id', 'permission_id']);
        });

        // Create model_has_roles pivot table (for users)
        Schema::create('model_has_roles', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->primary(['role_id', 'model_id', 'model_type']);
            $table->index(['model_id', 'model_type']);
        });

        // Create model_has_permissions pivot table (for direct user permissions)
        Schema::create('model_has_permissions', function (Blueprint $table) {
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->primary(['permission_id', 'model_id', 'model_type']);
            $table->index(['model_id', 'model_type']);
        });

        // Insert default roles
        DB::table('roles')->insert([
            ['name' => 'admin', 'guard_name' => 'web', 'description' => 'Administrateur avec tous les droits', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'manager', 'guard_name' => 'web', 'description' => 'Manager avec droits étendus', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'user', 'guard_name' => 'web', 'description' => 'Utilisateur standard', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Insert default permissions
        $permissions = [
            // Clients
            ['name' => 'clients.view', 'group' => 'clients', 'description' => 'Voir les clients'],
            ['name' => 'clients.create', 'group' => 'clients', 'description' => 'Créer des clients'],
            ['name' => 'clients.edit', 'group' => 'clients', 'description' => 'Modifier des clients'],
            ['name' => 'clients.delete', 'group' => 'clients', 'description' => 'Supprimer des clients'],
            // Factures
            ['name' => 'invoices.view', 'group' => 'invoices', 'description' => 'Voir les factures'],
            ['name' => 'invoices.create', 'group' => 'invoices', 'description' => 'Créer des factures'],
            ['name' => 'invoices.edit', 'group' => 'invoices', 'description' => 'Modifier des factures'],
            ['name' => 'invoices.delete', 'group' => 'invoices', 'description' => 'Supprimer des factures'],
            // Devis
            ['name' => 'devis.view', 'group' => 'devis', 'description' => 'Voir les devis'],
            ['name' => 'devis.create', 'group' => 'devis', 'description' => 'Créer des devis'],
            ['name' => 'devis.edit', 'group' => 'devis', 'description' => 'Modifier des devis'],
            ['name' => 'devis.delete', 'group' => 'devis', 'description' => 'Supprimer des devis'],
            // Ordres de travail
            ['name' => 'ordres.view', 'group' => 'ordres', 'description' => 'Voir les ordres de travail'],
            ['name' => 'ordres.create', 'group' => 'ordres', 'description' => 'Créer des ordres'],
            ['name' => 'ordres.edit', 'group' => 'ordres', 'description' => 'Modifier des ordres'],
            ['name' => 'ordres.delete', 'group' => 'ordres', 'description' => 'Supprimer des ordres'],
            // Banques
            ['name' => 'banques.view', 'group' => 'banques', 'description' => 'Voir les comptes bancaires'],
            ['name' => 'banques.manage', 'group' => 'banques', 'description' => 'Gérer les comptes bancaires'],
            // Caisse
            ['name' => 'caisse.view', 'group' => 'caisse', 'description' => 'Voir la caisse'],
            ['name' => 'caisse.manage', 'group' => 'caisse', 'description' => 'Gérer la caisse'],
            // Rapports
            ['name' => 'reports.view', 'group' => 'reports', 'description' => 'Voir les rapports'],
            ['name' => 'reports.export', 'group' => 'reports', 'description' => 'Exporter les rapports'],
            // Administration
            ['name' => 'users.view', 'group' => 'admin', 'description' => 'Voir les utilisateurs'],
            ['name' => 'users.manage', 'group' => 'admin', 'description' => 'Gérer les utilisateurs'],
            ['name' => 'roles.manage', 'group' => 'admin', 'description' => 'Gérer les rôles'],
            ['name' => 'settings.manage', 'group' => 'admin', 'description' => 'Gérer les paramètres'],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->insert([
                'name' => $permission['name'],
                'guard_name' => 'web',
                'group' => $permission['group'],
                'description' => $permission['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Assign all permissions to admin role
        $adminRole = DB::table('roles')->where('name', 'admin')->first();
        $allPermissions = DB::table('permissions')->pluck('id');
        foreach ($allPermissions as $permissionId) {
            DB::table('role_has_permissions')->insert([
                'role_id' => $adminRole->id,
                'permission_id' => $permissionId,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('model_has_permissions');
        Schema::dropIfExists('model_has_roles');
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
