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
            $email = str_replace('-', '', $roleName) . '@karyaone.com';
            $nip = '12345' . str_pad($role->id, 3, '0', STR_PAD_LEFT);

            $user = User::where('email', $email)->orWhere('nip', $nip)->first();
            
            if (!$user) {
                $user = User::create([
                    'nip' => $nip,
                    'email' => $email,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]);
                $user->assignRole($role);
            }

            // Create Employee if not exists
            if (!$user->employee) {
                Employee::create([
                    'user_id' => $user->id,
                    'full_name' => ucwords(str_replace('-', ' ', $roleName)) . ' User',
                    'position_id' => $this->getPositionByRole($roleName, $positions),
                    'department_id' => $this->getDepartmentByRole($roleName, $departments),
                    'employee_status' => 'tetap',
                    'join_date' => now()->subYears(1),
                    'leave_quota' => 12,
                ]);
            }
        }

        // Add some generic employees
        Employee::factory()->count(10)->create([
            'department_id' => fn() => $departments->random()->id,
            'position_id' => fn() => $positions->random()->id,
        ])->each(function ($employee) {
            $employee->user->assignRole('employee');
        });
    }

    private function getPositionByRole(string $roleName, $positions)
    {
        return match ($roleName) {
            'super-admin' => $positions->where('name', 'IT')->first()?->id ?? $positions->first()->id,
            'hr-admin' => $positions->where('name', 'Casemix & HRD')->first()?->id ?? $positions->first()->id,
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
