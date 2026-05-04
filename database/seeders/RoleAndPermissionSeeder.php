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
            'employee.view', 'employee.create', 'employee.edit', 'employee.delete',
            'employee-profile.edit',
            // Department & Position
            'department.view', 'department.create', 'department.edit', 'department.delete',
            'position.view', 'position.create', 'position.edit', 'position.delete',
            // Shift management
            'shift.view', 'shift.manage',
            'shift-change-request.view', 'shift-change-request.create', 'shift-change-request.edit', 'shift-change-request.delete',
            'shift-change-request.create.any', 'shift-change-request.approve.hrd', 'shift-change-request.approve.manager', 'shift-change-request.export',
            // Document management
            'document.upload', 'document-type.view', 'document-type.create', 'document-type.edit', 'document-type.delete',
            // Leave request management
            'leave-request.view', 'leave-request.create', 'leave-request.create.any', 'leave-request.edit', 'leave-request.delete',
            'leave-request.approve.hrd', 'leave-request.approve.manager', 'leave-request.approve.director','leave-request.export',
            'leave-type.view', 'leave-type.create', 'leave-type.edit', 'leave-type.delete',
            // Overtime request management
            'overtime-request.view', 'overtime-request.create', 'overtime-request.create.any', 'overtime-request.edit', 'overtime-request.delete',
            'overtime-request.approve.hrd', 'overtime-request.approve.manager','overtime-request.export',
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
            'department.view', 'department.create', 'department.edit', 'department.delete',
            'position.view', 'position.create', 'position.edit', 'position.delete',
            'shift.view', 'shift.manage', 'shift-change-request.view', 'shift-change-request.create.any', 'shift-change-request.approve.hrd', 'shift-change-request.edit', 'shift-change-request.export',
            'document.upload', 'document-type.view',
            'leave-request.view', 'leave-request.create.any', 'leave-request.edit', 'leave-request.approve.hrd', 'leave-request.export', 'leave-type.view',
            'overtime-request.view', 'overtime-request.create.any', 'overtime-request.edit', 'overtime-request.approve.hrd','overtime-request.export',
        ]);

        $manager = Role::firstOrCreate(['name' => 'manager']);
        $manager->syncPermissions([
            'employee.view', 'department.view', 'position.view',
            'shift.view', 'shift.manage', 'shift-change-request.view', 'shift-change-request.edit', 'shift-change-request.approve.manager', 'shift-change-request.create.any', 'shift-change-request.export',
            'document.upload', 'document-type.view',
            'leave-request.view', 'leave-request.approve.manager', 'leave-request.create', 'leave-request.create.any', 'leave-type.view',
            'overtime-request.view', 'overtime-request.approve.manager', 'overtime-request.create', 'overtime-request.create.any',
            'employee-profile.edit'
        ]);

        $karu = Role::firstOrCreate(['name' => 'karu']);
        $karu->syncPermissions([
            'shift.view', 'shift-change-request.view', 'shift-change-request.create', 'shift-change-request.edit', 'shift-change-request.approve.manager','shift-change-request.export',
            'document.upload',
            'leave-request.view', 'leave-request.approve.manager', 'leave-request.create', 'leave-request.edit','leave-request.export',
            'overtime-request.view', 'overtime-request.approve.manager', 'overtime-request.create', 'overtime-request.edit','overtime-request.export',
            'employee-profile.edit'
        ]);

        $director = Role::firstOrCreate(['name' => 'director']);
        $director->syncPermissions([
            'employee.view', 'department.view', 'position.view','leave-type.view','shift.view',
            'shift-change-request.view', 'shift-change-request.approve.manager', 'shift-change-request.export',
            'leave-request.view', 'leave-request.approve.hrd', 'leave-request.approve.manager', 'leave-request.approve.director', 'leave-request.create', 'leave-request.edit', 'leave-request.export', 
            'overtime-request.view', 'overtime-request.approve.hrd', 'overtime-request.approve.manager', 'overtime-request.create','overtime-request.export',
            'employee-profile.edit'
        ]);

        $employee = Role::firstOrCreate(['name' => 'employee']);
        $employee->syncPermissions([
            'document.upload',
            'shift.view', 'shift-change-request.view', 'shift-change-request.create', 'shift-change-request.edit',
            'leave-request.view', 'leave-request.create', 'leave-request.edit',
            'overtime-request.view', 'overtime-request.create', 'overtime-request.edit',
            'employee-profile.edit'
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
