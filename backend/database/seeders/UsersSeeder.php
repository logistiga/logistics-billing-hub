<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin - Omar
        $omar = User::firstOrCreate(
            ['email' => 'omar@logistiga.com'],
            [
                'name' => 'Omar Amraoui',
                'password' => Hash::make('Amraoui@1'),
                'phone' => '+212 600 000 000',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $omar->assignRole('super-admin');

        // Super Admin - Default
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'phone' => '+212 600 000 001',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->assignRole('super-admin');

        // Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'phone' => '+212 600 000 002',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // Manager
        $manager = User::firstOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name' => 'Manager User',
                'password' => Hash::make('password'),
                'phone' => '+212 600 000 003',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $manager->assignRole('manager');

        // Comptable
        $comptable = User::firstOrCreate(
            ['email' => 'comptable@example.com'],
            [
                'name' => 'Comptable User',
                'password' => Hash::make('password'),
                'phone' => '+212 600 000 004',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $comptable->assignRole('comptable');

        // Commercial
        $commercial = User::firstOrCreate(
            ['email' => 'commercial@example.com'],
            [
                'name' => 'Commercial User',
                'password' => Hash::make('password'),
                'phone' => '+212 600 000 005',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $commercial->assignRole('commercial');

        // Operateur
        $operateur = User::firstOrCreate(
            ['email' => 'operateur@example.com'],
            [
                'name' => 'Opérateur User',
                'password' => Hash::make('password'),
                'phone' => '+212 600 000 006',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $operateur->assignRole('operateur');

        // Additional test users
        $testUsers = [
            ['name' => 'Ahmed Benali', 'email' => 'ahmed.benali@example.com', 'role' => 'commercial'],
            ['name' => 'Fatima Zahra', 'email' => 'fatima.zahra@example.com', 'role' => 'comptable'],
            ['name' => 'Karim Idrissi', 'email' => 'karim.idrissi@example.com', 'role' => 'operateur'],
            ['name' => 'Sara Alaoui', 'email' => 'sara.alaoui@example.com', 'role' => 'manager'],
            ['name' => 'Youssef Tazi', 'email' => 'youssef.tazi@example.com', 'role' => 'operateur'],
        ];

        foreach ($testUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make('password'),
                    'phone' => '+212 6' . rand(10000000, 99999999),
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
            $user->assignRole($userData['role']);
        }
    }
}
