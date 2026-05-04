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
        'status' => 'pending_manager'
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

test('employee cannot submit leave request if quota is insufficient', function () {
    $this->employee->update(['leave_quota' => 1]);

    actingAs($this->employee->user)
        ->post(route('leave-requests.store'), [
            'leave_type_id' => $this->leaveType->id,
            'start_date' => now()->addDays(5)->format('Y-m-d'),
            'end_date' => now()->addDays(7)->format('Y-m-d'), // 3 days
            'reason' => 'Liburan',
        ])
        ->assertSessionHasErrors('end_date');
});

test('leave request approval workflow', function () {
    $leaveRequest = \App\Models\LeaveRequest::create([
        'employee_id' => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date' => now()->addDays(1)->format('Y-m-d'),
        'end_date' => now()->addDays(2)->format('Y-m-d'),
        'reason' => 'Test',
        'status' => 'pending_manager'
    ]);

    // Manager approval
    $manager = User::factory()->create();
    $manager->assignRole('manager');
    $this->department->managers()->attach($manager->id);

    actingAs($manager)
        ->post(route('leave-requests.status', $leaveRequest), ['status' => 'approved'])
        ->assertRedirect();

    expect($leaveRequest->refresh()->status)->toBe('pending_hrd');

    // HRD approval
    actingAs($this->admin)
        ->post(route('leave-requests.status', $leaveRequest), ['status' => 'approved'])
        ->assertRedirect();

    expect($leaveRequest->refresh()->status)->toBe('pending_director');

    // Director approval
    $director = User::factory()->create();
    $director->assignRole('director');

    actingAs($director)
        ->post(route('leave-requests.status', $leaveRequest), ['status' => 'approved'])
        ->assertRedirect();

    expect($leaveRequest->refresh()->status)->toBe('approved');
});

test('leave quota is deducted after final approval', function () {
    $initialQuota = $this->employee->leave_quota;
    $leaveRequest = \App\Models\LeaveRequest::create([
        'employee_id' => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date' => now()->addDays(1)->format('Y-m-d'),
        'end_date' => now()->addDays(1)->format('Y-m-d'), // 1 day
        'reason' => 'Test',
        'status' => 'pending_director'
    ]);

    $director = User::factory()->create();
    $director->assignRole('director');

    actingAs($director)
        ->post(route('leave-requests.status', $leaveRequest), ['status' => 'approved'])
        ->assertRedirect();

    expect($this->employee->refresh()->leave_quota)->toBe($initialQuota - 1);
});

test('leave request can be rejected', function () {
    $leaveRequest = \App\Models\LeaveRequest::create([
        'employee_id' => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date' => now()->addDays(1)->format('Y-m-d'),
        'end_date' => now()->addDays(1)->format('Y-m-d'),
        'reason' => 'Test',
        'status' => 'pending_manager'
    ]);

    actingAs($this->admin)
        ->post(route('leave-requests.status', $leaveRequest), ['status' => 'rejected'])
        ->assertRedirect();

    expect($leaveRequest->refresh()->status)->toBe('rejected');
});

test('leave request can only be updated if pending', function () {
    $leaveRequest = \App\Models\LeaveRequest::create([
        'employee_id' => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'start_date' => now()->addDays(1)->format('Y-m-d'),
        'end_date' => now()->addDays(1)->format('Y-m-d'),
        'reason' => 'Test',
        'status' => 'approved'
    ]);

    $this->employee->user->givePermissionTo('leave-request.edit');

    actingAs($this->employee->user)
        ->put(route('leave-requests.update', $leaveRequest), [
            'employee_id' => $this->employee->id,
            'leave_type_id' => $this->leaveType->id,
            'start_date' => now()->addDays(2)->format('Y-m-d'),
            'end_date' => now()->addDays(2)->format('Y-m-d'),
            'reason' => 'Updated',
        ])
        ->assertSessionHas('error');
});
