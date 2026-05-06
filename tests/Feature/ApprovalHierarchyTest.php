<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\OvertimeRequest;
use App\Models\Position;
use App\Models\Shift;
use App\Models\ShiftChangeRequest;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(RoleAndPermissionSeeder::class);

    $this->department = Department::create(['name' => 'IT']);
    $this->position = Position::create(['name' => 'Developer']);

    $this->employee = Employee::factory()->create([
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
    ]);

    $this->hrd = User::factory()->create();
    $this->hrd->assignRole('hr-admin');

    $this->manager = User::factory()->create();
    $this->manager->assignRole('manager');
    $this->department->managers()->attach($this->manager->id);

    $this->director = User::factory()->create();
    $this->director->assignRole('director');
});

test('HRD can bypass Manager approval in Leave Request', function () {
    $leaveType = LeaveType::create(['name' => 'Cuti Tahunan', 'code' => 'CT', 'default_days' => 12]);

    $leaveRequest = LeaveRequest::create([
        'employee_id' => $this->employee->id,
        'leave_type_id' => $leaveType->id,
        'start_date' => now()->addDays(1)->format('Y-m-d'),
        'end_date' => now()->addDays(2)->format('Y-m-d'),
        'reason' => 'Bypass Test',
        'status' => 'pending_manager',
    ]);

    actingAs($this->hrd)
        ->post(route('leave-requests.status', $leaveRequest), ['status' => 'approved'])
        ->assertRedirect();

    $leaveRequest->refresh();

    // Status should move to pending_director, NOT approved yet
    expect($leaveRequest->status)->toBe('pending_director');

    // Both manager and hrd columns should be filled by HRD
    expect($leaveRequest->manager_approved_by)->toBe($this->hrd->id);
    expect($leaveRequest->hrd_approved_by)->toBe($this->hrd->id);
    expect($leaveRequest->manager_approved_at)->not->toBeNull();
    expect($leaveRequest->hrd_approved_at)->not->toBeNull();
});

test('HRD can bypass Director approval in Leave Request', function () {
    $leaveType = LeaveType::create(['name' => 'Cuti Tahunan', 'code' => 'CT', 'default_days' => 12]);

    $leaveRequest = LeaveRequest::create([
        'employee_id' => $this->employee->id,
        'leave_type_id' => $leaveType->id,
        'start_date' => now()->addDays(1)->format('Y-m-d'),
        'end_date' => now()->addDays(2)->format('Y-m-d'),
        'reason' => 'Bypass Director Test',
        'status' => 'pending_director',
    ]);

    actingAs($this->hrd)
        ->post(route('leave-requests.status', $leaveRequest), ['status' => 'approved'])
        ->assertRedirect();

    $leaveRequest->refresh();

    expect($leaveRequest->status)->toBe('approved');
    expect($leaveRequest->director_approved_by)->toBe($this->hrd->id);
    expect($leaveRequest->director_approved_at)->not->toBeNull();
});

test('Proxy bypass does not overwrite existing approval data', function () {
    $leaveType = LeaveType::create(['name' => 'Cuti Tahunan', 'code' => 'CT', 'default_days' => 12]);

    // Case: Manager already approved, HRD bypasses Director
    $leaveRequest = LeaveRequest::create([
        'employee_id' => $this->employee->id,
        'leave_type_id' => $leaveType->id,
        'start_date' => now()->addDays(1)->format('Y-m-d'),
        'end_date' => now()->addDays(2)->format('Y-m-d'),
        'reason' => 'Overwrite Test',
        'status' => 'pending_director',
        'manager_approved_by' => $this->manager->id,
        'manager_approved_at' => now()->subHour(),
        'hrd_approved_by' => $this->hrd->id,
        'hrd_approved_at' => now()->subMinutes(30),
    ]);

    actingAs($this->hrd)
        ->post(route('leave-requests.status', $leaveRequest), ['status' => 'approved'])
        ->assertRedirect();

    $leaveRequest->refresh();

    // Manager data should remain as the original manager, not the bypasser
    expect($leaveRequest->manager_approved_by)->toBe($this->manager->id);
    expect($leaveRequest->director_approved_by)->toBe($this->hrd->id);
});

test('HRD can bypass Manager in Overtime Request', function () {
    $overtimeRequest = OvertimeRequest::create([
        'employee_id' => $this->employee->id,
        'date' => now()->format('Y-m-d'),
        'start_time' => '17:00',
        'end_time' => '19:00',
        'description' => 'Overtime Test',
        'status' => 'pending_manager',
    ]);

    actingAs($this->hrd)
        ->post(route('overtime-requests.status', $overtimeRequest), ['status' => 'approved'])
        ->assertRedirect();

    $overtimeRequest->refresh();

    expect($overtimeRequest->status)->toBe('approved');
    expect($overtimeRequest->manager_approved_by)->toBe($this->hrd->id);
    expect($overtimeRequest->hrd_approved_by)->toBe($this->hrd->id);
});

test('HRD can bypass Manager in Shift Change Request', function () {
    $targetEmployee = Employee::factory()->create();
    $shift = Shift::create(['name' => 'Morning', 'start_time' => '07:00', 'end_time' => '14:00']);

    $shiftChangeRequest = ShiftChangeRequest::create([
        'requester_id' => $this->employee->id,
        'target_id' => $targetEmployee->id,
        'request_date' => now()->format('Y-m-d'),
        'requester_shift_id' => $shift->id,
        'status' => 'pending_manager',
    ]);

    actingAs($this->hrd)
        ->post(route('shift-change-requests.status', $shiftChangeRequest), ['status' => 'approved'])
        ->assertRedirect();

    $shiftChangeRequest->refresh();

    expect($shiftChangeRequest->status)->toBe('approved');
    expect($shiftChangeRequest->manager_approved_by)->toBe($this->hrd->id);
    expect($shiftChangeRequest->hrd_approved_by)->toBe($this->hrd->id);
});

test('Director can bypass Manager and HRD in Leave Request', function () {
    $leaveType = LeaveType::create(['name' => 'Cuti Tahunan', 'code' => 'CT', 'default_days' => 12]);

    $leaveRequest = LeaveRequest::create([
        'employee_id' => $this->employee->id,
        'leave_type_id' => $leaveType->id,
        'start_date' => now()->addDays(1)->format('Y-m-d'),
        'end_date' => now()->addDays(2)->format('Y-m-d'),
        'reason' => 'Director Multi Bypass Test',
        'status' => 'pending_manager',
    ]);

    // Director has hrd permission, so they should be able to bypass manager and move to pending_director
    actingAs($this->director)
        ->post(route('leave-requests.status', $leaveRequest), ['status' => 'approved'])
        ->assertRedirect();

    $leaveRequest->refresh();

    expect($leaveRequest->status)->toBe('pending_director');
    expect($leaveRequest->manager_approved_by)->toBe($this->director->id);
    expect($leaveRequest->hrd_approved_by)->toBe($this->director->id);

    // Now Director approves again at pending_director stage
    actingAs($this->director)
        ->post(route('leave-requests.status', $leaveRequest), ['status' => 'approved'])
        ->assertRedirect();

    $leaveRequest->refresh();
    expect($leaveRequest->status)->toBe('approved');
    expect($leaveRequest->director_approved_by)->toBe($this->director->id);
});
