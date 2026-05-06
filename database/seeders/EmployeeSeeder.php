<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = Role::all();
        $departments = Department::all();
        $positions = Position::all();

        if ($departments->isEmpty() || $positions->isEmpty()) {
            $this->command->error('Departments or Positions are empty. Please run DepartmentSeeder and PositionSeeder first.');

            return;
        }

        foreach ($roles as $role) {
            $roleName = $role->name;
            $email = str_replace('-', '', $roleName).'@karyaone.com';
            $nip = '12345'.str_pad($role->id, 3, '0', STR_PAD_LEFT);

            $user = User::where('email', $email)->orWhere('nip', $nip)->first();

            if (! $user) {
                $user = User::create([
                    'nip' => $nip,
                    'email' => $email,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]);
                $user->assignRole($role);
            }

            // Create Employee if not exists
            if (! $user->employee) {
                Employee::create([
                    'user_id' => $user->id,
                    'full_name' => ucwords(str_replace('-', ' ', $roleName)).' User',
                    'position_id' => $this->getPositionByRole($roleName, $positions),
                    'department_id' => $this->getDepartmentByRole($roleName, $departments),
                    'employee_status' => 'tetap',
                    'join_date' => now()->subYears(1),
                    'leave_quota' => 12,
                ]);
            }
        }

        // Specific Employees and Karu as requested
        $medisDept = $departments->where('name', 'Pelayanan Medis')->first();
        $farmasiDept = $departments->where('name', 'Farmasi & Keuangan')->first();

        if (! $medisDept || ! $farmasiDept) {
            $this->command->error('Required departments (Pelayanan Medis, Farmasi & Keuangan) not found.');

            return;
        }

        $employeeData = [
            // Department: Pelayanan Medis
            [
                'name' => 'Karu Medis',
                'role' => 'karu',
                'dept' => $medisDept->id,
                'pos' => $positions->where('name', 'Perawat')->first()?->id,
                'email' => 'karu.medis@karyaone.com',
                'nip' => 'K001',
            ],
            [
                'name' => 'Employee Medis 1',
                'role' => 'employee',
                'dept' => $medisDept->id,
                'pos' => $positions->where('name', 'Bidan')->first()?->id,
                'email' => 'emp.medis1@karyaone.com',
                'nip' => 'E001',
            ],
            [
                'name' => 'Employee Medis 2',
                'role' => 'employee',
                'dept' => $medisDept->id,
                'pos' => $positions->where('name', 'Bidan')->first()?->id,
                'email' => 'emp.medis2@karyaone.com',
                'nip' => 'E002',
            ],
            [
                'name' => 'Employee Medis 3',
                'role' => 'employee',
                'dept' => $medisDept->id,
                'pos' => $positions->where('name', 'Rekam Medis')->first()?->id,
                'email' => 'emp.medis3@karyaone.com',
                'nip' => 'E003',
            ],
            // Department: Farmasi & Keuangan
            [
                'name' => 'Karu Farmasi',
                'role' => 'karu',
                'dept' => $farmasiDept->id,
                'pos' => $positions->where('name', 'Apoteker')->first()?->id,
                'email' => 'karu.farmasi@karyaone.com',
                'nip' => 'K002',
            ],
            [
                'name' => 'Employee Farmasi 1',
                'role' => 'employee',
                'dept' => $farmasiDept->id,
                'pos' => $positions->where('name', 'Asisten Apoteker')->first()?->id,
                'email' => 'emp.farmasi1@karyaone.com',
                'nip' => 'E004',
            ],
            [
                'name' => 'Employee Asisten Apoteker 2',
                'role' => 'employee',
                'dept' => $farmasiDept->id,
                'pos' => $positions->where('name', 'Asisten Apoteker')->first()?->id,
                'email' => 'emp.farmasi2@karyaone.com',
                'nip' => 'E005',
            ],
            [
                'name' => 'Employee Apoteker 3',
                'role' => 'employee',
                'dept' => $farmasiDept->id,
                'pos' => $positions->where('name', 'Apoteker')->first()?->id,
                'email' => 'emp.farmasi3@karyaone.com',
                'nip' => 'E006',
            ],
        ];

        foreach ($employeeData as $data) {
            $user = User::create([
                'nip' => $data['nip'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $user->assignRole($data['role']);

            Employee::create([
                'user_id' => $user->id,
                'full_name' => $data['name'],
                'position_id' => $data['pos'] ?? $positions->random()->id,
                'department_id' => $data['dept'],
                'employee_status' => 'tetap',
                'join_date' => now()->subYears(1),
                'leave_quota' => 12,
            ]);
        }
    }

    private function getPositionByRole(string $roleName, $positions)
    {
        return match ($roleName) {
            'super-admin' => $positions->where('name', 'IT')->first()?->id ?? $positions->first()->id,
            'hr-admin' => $positions->where('name', 'Casemix HRD')->first()?->id ?? $positions->first()->id,
            'manager' => $positions->where('name', 'Manajer')->first()?->id ?? $positions->first()->id,
            'director' => $positions->where('name', 'Direktur')->first()?->id ?? $positions->first()->id,
            'karu' => $positions->where('name', 'Perawat')->first()?->id ?? $positions->first()->id,
            default => $positions->random()->id,
        };
    }

    private function getDepartmentByRole(string $roleName, $departments)
    {
        return match ($roleName) {
            'super-admin', 'hr-admin', 'director' => $departments->where('name', 'Manajemen')->first()?->id ?? $departments->first()->id,
            'manager', 'karu' => $departments->where('name', 'Pelayanan Medis')->first()?->id ?? $departments->first()->id,
            default => $departments->random()->id,
        };
    }
}
