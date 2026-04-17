<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveType;
use App\Models\Position;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(RoleAndPermissionSeeder::class);
    $this->admin = User::where('email', 'admin@admin.com')->first();
    
    $this->department = Department::create(['name' => 'Medis']);
    $this->position = Position::create(['name' => 'Dokter']);
    $this->leaveType = LeaveType::create(['name' => 'Cuti Tahunan', 'code' => 'CT', 'default_days' => 12]);

    $this->employee = Employee::factory()->create([
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'leave_quota' => 12
    ]);
    $this->employee->user->assignRole('employee');
});

test('employee can submit leave request', function () {
    actingAs($this->employee->user)
        ->post(route('leave-requests.store'), [
            'leave_type_id' => $this->leaveType->id,
            'start_date' => now()->addDays(5)->format('Y-m-d'),
            'end_date' => now()->addDays(7)->format('Y-m-d'),
            'reason' => 'Liburan',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('leave_requests', [
        'employee_id' => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'status' => 'pending_hrd'
    ]);
});

test('admin can submit leave request for employee', function () {
    actingAs($this->admin)
        ->post(route('leave-requests.store'), [
            'employee_id' => $this->employee->id,
            'leave_type_id' => $this->leaveType->id,
            'start_date' => now()->addDays(10)->format('Y-m-d'),
            'end_date' => now()->addDays(12)->format('Y-m-d'),
            'reason' => 'Emergency',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('leave_requests', [
        'employee_id' => $this->employee->id,
        'status' => 'pending_hrd'
    ]);
});
