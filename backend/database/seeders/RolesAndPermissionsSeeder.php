<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // Clients
            ['name' => 'clients.view', 'group' => 'clients', 'description' => 'Voir les clients'],
            ['name' => 'clients.create', 'group' => 'clients', 'description' => 'Créer des clients'],
            ['name' => 'clients.edit', 'group' => 'clients', 'description' => 'Modifier des clients'],
            ['name' => 'clients.delete', 'group' => 'clients', 'description' => 'Supprimer des clients'],
            ['name' => 'clients.export', 'group' => 'clients', 'description' => 'Exporter les clients'],
            ['name' => 'clients.import', 'group' => 'clients', 'description' => 'Importer des clients'],

            // Invoices
            ['name' => 'invoices.view', 'group' => 'invoices', 'description' => 'Voir les factures'],
            ['name' => 'invoices.create', 'group' => 'invoices', 'description' => 'Créer des factures'],
            ['name' => 'invoices.edit', 'group' => 'invoices', 'description' => 'Modifier des factures'],
            ['name' => 'invoices.delete', 'group' => 'invoices', 'description' => 'Supprimer des factures'],
            ['name' => 'invoices.validate', 'group' => 'invoices', 'description' => 'Valider des factures'],
            ['name' => 'invoices.send', 'group' => 'invoices', 'description' => 'Envoyer des factures'],
            ['name' => 'invoices.export', 'group' => 'invoices', 'description' => 'Exporter les factures'],

            // Payments
            ['name' => 'payments.view', 'group' => 'payments', 'description' => 'Voir les paiements'],
            ['name' => 'payments.create', 'group' => 'payments', 'description' => 'Créer des paiements'],
            ['name' => 'payments.edit', 'group' => 'payments', 'description' => 'Modifier des paiements'],
            ['name' => 'payments.delete', 'group' => 'payments', 'description' => 'Supprimer des paiements'],

            // Devis
            ['name' => 'devis.view', 'group' => 'devis', 'description' => 'Voir les devis'],
            ['name' => 'devis.create', 'group' => 'devis', 'description' => 'Créer des devis'],
            ['name' => 'devis.edit', 'group' => 'devis', 'description' => 'Modifier des devis'],
            ['name' => 'devis.delete', 'group' => 'devis', 'description' => 'Supprimer des devis'],
            ['name' => 'devis.validate', 'group' => 'devis', 'description' => 'Valider des devis'],
            ['name' => 'devis.send', 'group' => 'devis', 'description' => 'Envoyer des devis'],
            ['name' => 'devis.convert', 'group' => 'devis', 'description' => 'Convertir en facture'],
            ['name' => 'devis.export', 'group' => 'devis', 'description' => 'Exporter les devis'],

            // Avoirs
            ['name' => 'avoirs.view', 'group' => 'avoirs', 'description' => 'Voir les avoirs'],
            ['name' => 'avoirs.create', 'group' => 'avoirs', 'description' => 'Créer des avoirs'],
            ['name' => 'avoirs.edit', 'group' => 'avoirs', 'description' => 'Modifier des avoirs'],
            ['name' => 'avoirs.delete', 'group' => 'avoirs', 'description' => 'Supprimer des avoirs'],
            ['name' => 'avoirs.validate', 'group' => 'avoirs', 'description' => 'Valider des avoirs'],
            ['name' => 'avoirs.compensate', 'group' => 'avoirs', 'description' => 'Compenser des avoirs'],
            ['name' => 'avoirs.export', 'group' => 'avoirs', 'description' => 'Exporter les avoirs'],

            // Ordres de travail
            ['name' => 'ordres-travail.view', 'group' => 'ordres-travail', 'description' => 'Voir les ordres de travail'],
            ['name' => 'ordres-travail.create', 'group' => 'ordres-travail', 'description' => 'Créer des ordres de travail'],
            ['name' => 'ordres-travail.edit', 'group' => 'ordres-travail', 'description' => 'Modifier des ordres de travail'],
            ['name' => 'ordres-travail.delete', 'group' => 'ordres-travail', 'description' => 'Supprimer des ordres de travail'],
            ['name' => 'ordres-travail.validate', 'group' => 'ordres-travail', 'description' => 'Valider des ordres de travail'],
            ['name' => 'ordres-travail.invoice', 'group' => 'ordres-travail', 'description' => 'Facturer des ordres de travail'],
            ['name' => 'ordres-travail.export', 'group' => 'ordres-travail', 'description' => 'Exporter les ordres de travail'],

            // Notes de début
            ['name' => 'notes-debut.view', 'group' => 'notes-debut', 'description' => 'Voir les notes de début'],
            ['name' => 'notes-debut.create', 'group' => 'notes-debut', 'description' => 'Créer des notes de début'],
            ['name' => 'notes-debut.edit', 'group' => 'notes-debut', 'description' => 'Modifier des notes de début'],
            ['name' => 'notes-debut.delete', 'group' => 'notes-debut', 'description' => 'Supprimer des notes de début'],
            ['name' => 'notes-debut.validate', 'group' => 'notes-debut', 'description' => 'Valider des notes de début'],
            ['name' => 'notes-debut.close', 'group' => 'notes-debut', 'description' => 'Clôturer des notes de début'],
            ['name' => 'notes-debut.export', 'group' => 'notes-debut', 'description' => 'Exporter les notes de début'],

            // Crédits bancaires
            ['name' => 'credits.view', 'group' => 'credits', 'description' => 'Voir les crédits'],
            ['name' => 'credits.create', 'group' => 'credits', 'description' => 'Créer des crédits'],
            ['name' => 'credits.edit', 'group' => 'credits', 'description' => 'Modifier des crédits'],
            ['name' => 'credits.delete', 'group' => 'credits', 'description' => 'Supprimer des crédits'],
            ['name' => 'credits.payment', 'group' => 'credits', 'description' => 'Ajouter des paiements'],
            ['name' => 'credits.export', 'group' => 'credits', 'description' => 'Exporter les crédits'],

            // Banques
            ['name' => 'banques.view', 'group' => 'banques', 'description' => 'Voir les banques'],
            ['name' => 'banques.create', 'group' => 'banques', 'description' => 'Créer des banques'],
            ['name' => 'banques.edit', 'group' => 'banques', 'description' => 'Modifier des banques'],
            ['name' => 'banques.delete', 'group' => 'banques', 'description' => 'Supprimer des banques'],
            ['name' => 'banques.reconcile', 'group' => 'banques', 'description' => 'Rapprocher les banques'],
            ['name' => 'banques.export', 'group' => 'banques', 'description' => 'Exporter les banques'],

            // Transactions
            ['name' => 'transactions.view', 'group' => 'transactions', 'description' => 'Voir les transactions'],
            ['name' => 'transactions.create', 'group' => 'transactions', 'description' => 'Créer des transactions'],
            ['name' => 'transactions.edit', 'group' => 'transactions', 'description' => 'Modifier des transactions'],
            ['name' => 'transactions.delete', 'group' => 'transactions', 'description' => 'Supprimer des transactions'],
            ['name' => 'transactions.reconcile', 'group' => 'transactions', 'description' => 'Rapprocher les transactions'],
            ['name' => 'transactions.import', 'group' => 'transactions', 'description' => 'Importer des transactions'],
            ['name' => 'transactions.export', 'group' => 'transactions', 'description' => 'Exporter les transactions'],

            // Partenaires
            ['name' => 'partenaires.view', 'group' => 'partenaires', 'description' => 'Voir les partenaires'],
            ['name' => 'partenaires.create', 'group' => 'partenaires', 'description' => 'Créer des partenaires'],
            ['name' => 'partenaires.edit', 'group' => 'partenaires', 'description' => 'Modifier des partenaires'],
            ['name' => 'partenaires.delete', 'group' => 'partenaires', 'description' => 'Supprimer des partenaires'],
            ['name' => 'partenaires.transaction', 'group' => 'partenaires', 'description' => 'Ajouter des transactions'],
            ['name' => 'partenaires.export', 'group' => 'partenaires', 'description' => 'Exporter les partenaires'],

            // Caisse
            ['name' => 'caisse.view', 'group' => 'caisse', 'description' => 'Voir la caisse'],
            ['name' => 'caisse.create', 'group' => 'caisse', 'description' => 'Créer des caisses'],
            ['name' => 'caisse.edit', 'group' => 'caisse', 'description' => 'Modifier des caisses'],
            ['name' => 'caisse.delete', 'group' => 'caisse', 'description' => 'Supprimer des caisses'],
            ['name' => 'caisse.mouvement', 'group' => 'caisse', 'description' => 'Ajouter des mouvements'],
            ['name' => 'caisse.close', 'group' => 'caisse', 'description' => 'Clôturer la caisse'],
            ['name' => 'caisse.export', 'group' => 'caisse', 'description' => 'Exporter la caisse'],

            // Entreprise
            ['name' => 'entreprise.view', 'group' => 'entreprise', 'description' => 'Voir l\'entreprise'],
            ['name' => 'entreprise.edit', 'group' => 'entreprise', 'description' => 'Modifier l\'entreprise'],
            ['name' => 'entreprise.settings', 'group' => 'entreprise', 'description' => 'Gérer les paramètres'],

            // Users
            ['name' => 'users.view', 'group' => 'users', 'description' => 'Voir les utilisateurs'],
            ['name' => 'users.create', 'group' => 'users', 'description' => 'Créer des utilisateurs'],
            ['name' => 'users.edit', 'group' => 'users', 'description' => 'Modifier des utilisateurs'],
            ['name' => 'users.delete', 'group' => 'users', 'description' => 'Supprimer des utilisateurs'],
            ['name' => 'users.roles', 'group' => 'users', 'description' => 'Assigner des rôles'],
            ['name' => 'users.permissions', 'group' => 'users', 'description' => 'Gérer les permissions'],
            ['name' => 'users.status', 'group' => 'users', 'description' => 'Changer le statut'],
            ['name' => 'users.password', 'group' => 'users', 'description' => 'Réinitialiser le mot de passe'],

            // Roles
            ['name' => 'roles.view', 'group' => 'roles', 'description' => 'Voir les rôles'],
            ['name' => 'roles.create', 'group' => 'roles', 'description' => 'Créer des rôles'],
            ['name' => 'roles.edit', 'group' => 'roles', 'description' => 'Modifier des rôles'],
            ['name' => 'roles.delete', 'group' => 'roles', 'description' => 'Supprimer des rôles'],
            ['name' => 'roles.permissions', 'group' => 'roles', 'description' => 'Gérer les permissions des rôles'],

            // Dashboard & Reports
            ['name' => 'dashboard.view', 'group' => 'dashboard', 'description' => 'Voir le tableau de bord'],
            ['name' => 'reports.view', 'group' => 'reports', 'description' => 'Voir les rapports'],
            ['name' => 'reports.generate', 'group' => 'reports', 'description' => 'Générer des rapports'],
            ['name' => 'reports.export', 'group' => 'reports', 'description' => 'Exporter les rapports'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                [
                    'guard_name' => 'web',
                    'group' => $permission['group'],
                    'description' => $permission['description'],
                ]
            );
        }

        // Create roles
        $superAdmin = Role::firstOrCreate(
            ['name' => 'super-admin'],
            ['guard_name' => 'web', 'description' => 'Super administrateur avec tous les droits']
        );

        $admin = Role::firstOrCreate(
            ['name' => 'admin'],
            ['guard_name' => 'web', 'description' => 'Administrateur']
        );

        $manager = Role::firstOrCreate(
            ['name' => 'manager'],
            ['guard_name' => 'web', 'description' => 'Manager']
        );

        $comptable = Role::firstOrCreate(
            ['name' => 'comptable'],
            ['guard_name' => 'web', 'description' => 'Comptable']
        );

        $commercial = Role::firstOrCreate(
            ['name' => 'commercial'],
            ['guard_name' => 'web', 'description' => 'Commercial']
        );

        $operateur = Role::firstOrCreate(
            ['name' => 'operateur'],
            ['guard_name' => 'web', 'description' => 'Opérateur']
        );

        // Assign all permissions to admin
        $allPermissions = Permission::all();
        $admin->permissions()->sync($allPermissions->pluck('id'));

        // Manager permissions
        $managerPermissions = Permission::whereIn('group', [
            'clients', 'invoices', 'payments', 'devis', 'avoirs',
            'ordres-travail', 'notes-debut', 'dashboard', 'reports'
        ])->get();
        $manager->permissions()->sync($managerPermissions->pluck('id'));

        // Comptable permissions
        $comptablePermissions = Permission::whereIn('group', [
            'invoices', 'payments', 'avoirs', 'credits', 'banques',
            'transactions', 'caisse', 'dashboard', 'reports'
        ])->get();
        $comptable->permissions()->sync($comptablePermissions->pluck('id'));

        // Commercial permissions
        $commercialPermissions = Permission::whereIn('group', [
            'clients', 'devis', 'dashboard'
        ])->get();
        $commercial->permissions()->sync($commercialPermissions->pluck('id'));

        // Operateur permissions
        $operateurPermissions = Permission::whereIn('name', [
            'clients.view', 'ordres-travail.view', 'ordres-travail.create',
            'ordres-travail.edit', 'notes-debut.view', 'notes-debut.create',
            'notes-debut.edit', 'dashboard.view'
        ])->get();
        $operateur->permissions()->sync($operateurPermissions->pluck('id'));
    }
}
