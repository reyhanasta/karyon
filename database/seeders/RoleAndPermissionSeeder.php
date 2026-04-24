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
            'employee-profile.edit',
            // Shift management
            'shift.view',
            'shift.manage',
            'shift-change.view',
            'shift-change.create',
            'shift-change.create.any',
            'shift-change.approve.hrd',
            'shift-change.approve.manager',
            // Document management
            'document.upload',
            // Leave request management
            'leave.view',
            'leave.create',
            'leave.create.any',
            'leave.edit',
            'leave.approve.hrd',
            'leave.approve.manager',
            'leave.approve.director',
            // Overtime request management
            'overtime.view',
            'overtime.create',
            'overtime.create.any',
            'overtime.edit',
            'overtime.approve.hrd',
            'overtime.approve.manager',
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
            'shift.view', 'shift.manage', 'shift-change.view', 'shift-change.create.any', 'shift-change.approve.hrd',
            'document.upload',
            'leave.view', 'leave.create.any', 'leave.edit', 'leave.approve.hrd',
            'overtime.view', 'overtime.create.any', 'overtime.edit', 'overtime.approve.hrd',
        ]);

        $manager = Role::firstOrCreate(['name' => 'manager']);
        $manager->syncPermissions([
            'employee.view',
            'shift.view', 'shift.manage', 'shift-change.view',
            'leave.view', 'leave.approve.manager', 'leave.create',
            'overtime.view', 'overtime.approve.manager','overtime.create',
            'shift-change.view', 'shift-change.approve.manager','employee-profile.edit'
        ]);

        $karu = Role::firstOrCreate(['name' => 'karu']);
        $karu->syncPermissions([
            'employee.view',
            'shift.view', 'shift.manage', 'shift-change.view',
            'leave.view', 'leave.approve.manager','leave.create',
            'overtime.view', 'overtime.approve.manager','overtime.create',
            'shift-change.view', 'shift-change.approve.manager','employee-profile.edit'
        ]);

        $director = Role::firstOrCreate(['name' => 'director']);
        $director->syncPermissions([
            'employee.view',
            'shift.view', 'shift-change.view', 'shift-change.approve.manager',
            'leave.view', 'leave.approve.hrd','leave.approve.manager','leave.approve.director','leave.create',
            'overtime.view', 'overtime.approve.hrd','overtime.approve.manager','overtime.create','employee-profile.edit'
        ]);

        $employee = Role::firstOrCreate(['name' => 'employee']);
        $employee->syncPermissions([
            'document.upload',
            'shift.view', 'shift-change.view', 'shift-change.create',
            'leave.view', 'leave.create',
            'overtime.view', 'overtime.create','employee-profile.edit'
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
