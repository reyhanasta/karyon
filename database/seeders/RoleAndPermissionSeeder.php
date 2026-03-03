<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all permissions
        $permissions = [
            // Employee management
            'employee.view',
            'employee.create',
            'employee.edit',
            'employee.delete',
            // Leave request management
            'leave.view',
            'leave.create',
            'leave.approve',
            // Overtime request management
            'overtime.view',
            'overtime.create',
            'overtime.approve',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // Create roles with assigned permissions
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $superAdmin->syncPermissions($permissions); // all permissions

        $hrAdmin = Role::firstOrCreate(['name' => 'hr-admin']);
        $hrAdmin->syncPermissions([
            'employee.view', 'employee.create', 'employee.edit', 'employee.delete',
            'leave.view', 'leave.approve',
            'overtime.view', 'overtime.approve',
        ]);

        $manager = Role::firstOrCreate(['name' => 'manager']);
        $manager->syncPermissions([
            'employee.view',
            'leave.view', 'leave.approve',
            'overtime.view', 'overtime.approve',
        ]);

        $employee = Role::firstOrCreate(['name' => 'employee']);
        $employee->syncPermissions([
            'leave.view', 'leave.create',
            'overtime.view', 'overtime.create',
        ]);

        // Create default super-admin user
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'nip' => '00000001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $adminUser->syncRoles(['super-admin']);
    }
}
