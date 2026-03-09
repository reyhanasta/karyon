<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Position;
use App\Models\LeaveType;
use App\Models\LeaveRequest;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Notification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

beforeEach(function () {
    // Roles & Permissions
    $permissions = [
        'leave.view',
        'leave.create',
        'leave.create.any',
        'leave.edit',
        'leave.approve'
    ];
    
    foreach ($permissions as $perm) {
        Permission::firstOrCreate(['name' => $perm]);
    }

    $managerRole = Role::firstOrCreate(['name' => 'manager']);
    $managerRole->syncPermissions(['leave.view', 'leave.create.any', 'leave.edit', 'leave.approve']);

    Role::firstOrCreate(['name' => 'super-admin']);
    Role::firstOrCreate(['name' => 'hr-admin']);

    $employeeRole = Role::firstOrCreate(['name' => 'employee']);
    $employeeRole->syncPermissions(['leave.view', 'leave.create']);
    
    $department = Department::firstOrCreate(['name' => 'IT Department']);
    $position = Position::firstOrCreate(['name' => 'IT Staff']);

    // Admin / Manager user
    $this->managerUser = User::factory()->create();
    $this->managerUser->assignRole('manager');
    $this->managerEmployee = Employee::create([
        'user_id' => $this->managerUser->id,
        'full_name' => 'Manager Man',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 12
    ]);

    // Regular employee user
    $this->employeeUser = User::factory()->create();
    $this->employeeUser->assignRole('employee');
    $this->employee = Employee::create([
        'user_id' => $this->employeeUser->id,
        'full_name' => 'Normal Employee',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 12
    ]);

    // Leave Types
    $this->tahunanType = LeaveType::create([
        'name' => 'Cuti Tahunan',
        'max_days_per_year' => 12,
        'is_paid' => true,
        'requires_attachment' => false,
        'is_active' => true
    ]);

    $this->sakitType = LeaveType::create([
        'name' => 'Sakit',
        'max_days_per_year' => 14,
        'is_paid' => true,
        'requires_attachment' => true,
        'is_active' => true
    ]);
});

test('unauthenticated users are redirected from leave requests', function () {
    $this->get(route('leave-requests.index'))->assertRedirect(route('login'));
});

test('employees can view their own leave index', function () {
    $response = $this->actingAs($this->employeeUser)->get(route('leave-requests.index'));
    $response->assertOk();
});

test('manager can view all leave index', function () {
    $response = $this->actingAs($this->managerUser)->get(route('leave-requests.index'));
    $response->assertOk();
});

test('employee can submit own leave request', function () {
    Notification::fake();
    Storage::fake('public');

    $response = $this->actingAs($this->employeeUser)->post(route('leave-requests.store'), [
        'leave_type_id' => $this->tahunanType->id,
        'start_date' => now()->addDays(2)->toDateString(),
        'end_date' => now()->addDays(3)->toDateString(),
        'reason' => 'Vacation',
    ]);

    $response->assertRedirect(route('leave-requests.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('leave_requests', [
        'employee_id' => $this->employee->id,
        'leave_type_id' => $this->tahunanType->id,
        'status' => 'pending',
    ]);
});

test('employee cannot exceed annual quota for leave type', function () {
    $response = $this->actingAs($this->employeeUser)->post(route('leave-requests.store'), [
        'leave_type_id' => $this->tahunanType->id,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(20)->toDateString(), // Exceeds 12 days
        'reason' => 'Long Vacation',
    ]);

    $response->assertSessionHasErrors('end_date');
    $this->assertDatabaseCount('leave_requests', 0);
});

test('employee cannot exceed monthly limit for cuti tahunan', function () {
    // Current Employee limit is 5 per month
    // Use the 1st day of the next month to guarantee the date is in the future
    // and we have enough days inside the same month.
    $start = now()->addMonths(1)->startOfMonth();
    $end = $start->copy()->addDays(6); // 7 days in the same month

    $response = $this->actingAs($this->employeeUser)->post(route('leave-requests.store'), [
        'leave_type_id' => $this->tahunanType->id,
        'start_date' => $start->toDateString(),
        'end_date' => $end->toDateString(),
        'reason' => 'Vacation',
    ]);

    $response->assertSessionHasErrors('end_date');
});

test('file is uploaded if attachment is provided', function () {
    Notification::fake();
    Storage::fake('public');

    $file = UploadedFile::fake()->image('doctor_note.jpg');

    $response = $this->actingAs($this->employeeUser)->post(route('leave-requests.store'), [
        'leave_type_id' => $this->sakitType->id,
        'start_date' => now()->toDateString(),
        'end_date' => now()->toDateString(),
        'reason' => 'Sick',
        'attachment' => $file,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('leave-requests.index'));
    
    $leave = LeaveRequest::first();
    expect($leave->attachment_path)->not->toBeNull();
    Storage::disk('public')->assertExists($leave->attachment_path);
});

test('manager can update leave status', function () {
    Notification::fake();

    $leave = LeaveRequest::create([
        'employee_id' => $this->employee->id,
        'leave_type_id' => $this->tahunanType->id,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'reason' => 'Vacation',
        'status' => 'pending'
    ]);

    // Employee initial quota is 12
    $initialQuota = $this->employee->leave_quota;

    $response = $this->actingAs($this->managerUser)->post(route('leave-requests.status', $leave), [
        'status' => 'approved'
    ]);

    $response->assertSessionHas('success');
    
    $this->assertDatabaseHas('leave_requests', [
        'id' => $leave->id,
        'status' => 'approved',
    ]);

    // Should deduct 3 days for Cuti Tahunan
    $this->employee->refresh();
    expect($this->employee->leave_quota)->toBe($initialQuota - 3);
});

test('rejecting leave does not deduct quota', function () {
    Notification::fake();

    $leave = LeaveRequest::create([
        'employee_id' => $this->employee->id,
        'leave_type_id' => $this->tahunanType->id,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'reason' => 'Vacation',
        'status' => 'pending'
    ]);

    $initialQuota = $this->employee->leave_quota;

    $this->actingAs($this->managerUser)->post(route('leave-requests.status', $leave), [
        'status' => 'rejected'
    ]);

    $this->employee->refresh();
    expect($this->employee->leave_quota)->toBe($initialQuota); // No deduction
});

test('manager can edit pending leave request', function () {
    $leave = LeaveRequest::create([
        'employee_id' => $this->employee->id,
        'leave_type_id' => $this->tahunanType->id,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(1)->toDateString(),
        'reason' => 'Old Reason',
        'status' => 'pending'
    ]);

    $response = $this->actingAs($this->managerUser)->put(route('leave-requests.update', $leave), [
        'employee_id' => $this->employee->id,
        'leave_type_id' => $this->tahunanType->id,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'reason' => 'New Reason',
    ]);

    $response->assertRedirect(route('leave-requests.index'));
    $this->assertDatabaseHas('leave_requests', [
        'id' => $leave->id,
        'reason' => 'New Reason',
    ]);
});

test('manager cannot edit processed leave request', function () {
    $leave = LeaveRequest::create([
        'employee_id' => $this->employee->id,
        'leave_type_id' => $this->tahunanType->id,
        'start_date' => now()->toDateString(),
        'end_date' => now()->toDateString(),
        'reason' => 'Old Reason',
        'status' => 'approved'
    ]);

    $response = $this->actingAs($this->managerUser)->put(route('leave-requests.update', $leave), [
        'employee_id' => $this->employee->id,
        'leave_type_id' => $this->tahunanType->id,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'reason' => 'New Reason',
    ]);

    $response->assertSessionHas('error');
    $this->assertDatabaseHas('leave_requests', [
        'id' => $leave->id,
        'reason' => 'Old Reason', // Not changed
    ]);
});
