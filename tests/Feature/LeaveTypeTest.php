<?php

use App\Models\User;
use App\Models\LeaveType;
use App\Models\LeaveRequest;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Position;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    // Create necessary permissions if they don't exist
    Permission::firstOrCreate(['name' => 'employee.view']);

    $this->user = User::factory()->create();
    $this->user->givePermissionTo('employee.view');

    $this->unauthorizedUser = User::factory()->create();
});

test('guests cannot access leave types', function () {
    $this->get(route('leave-types.index'))->assertRedirect(route('login'));
});

test('unauthorized users cannot access leave types', function () {
    $this->actingAs($this->unauthorizedUser)
         ->get(route('leave-types.index'))
         ->assertForbidden();
});

test('authorized users can visit the leave types page', function () {
    $this->actingAs($this->user)
         ->get(route('leave-types.index'))
         ->assertOk();
});

test('can create leave type', function () {
    $response = $this->actingAs($this->user)->post(route('leave-types.store'), [
        'name' => 'Cuti Menikah',
        'max_days_per_year' => 3,
        'is_paid' => true,
        'requires_attachment' => true,
        'is_active' => true,
        'description' => 'Cuti khusus untuk menikah',
    ]);

    $response->assertRedirect(route('leave-types.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('leave_types', [
        'name' => 'Cuti Menikah',
        'max_days_per_year' => 3,
        'is_paid' => 1,
        'requires_attachment' => 1,
    ]);
});

test('can update a leave type', function () {
    $leaveType = LeaveType::create([
        'name' => 'Old Name',
        'max_days_per_year' => 10,
        'is_paid' => true,
        'requires_attachment' => false,
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->user)->put(route('leave-types.update', $leaveType), [
        'name' => 'Updated Name',
        'max_days_per_year' => 15,
        'is_paid' => false,
        'requires_attachment' => true,
        'is_active' => false,
        'description' => 'Updated description',
    ]);

    $response->assertRedirect(route('leave-types.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('leave_types', [
        'id' => $leaveType->id,
        'name' => 'Updated Name',
        'max_days_per_year' => 15,
        'is_paid' => 0,
        'requires_attachment' => 1,
        'is_active' => 0,
    ]);
});

test('can delete an unused leave type', function () {
    $leaveType = LeaveType::create([
        'name' => 'To Delete',
        'max_days_per_year' => 5,
        'is_paid' => true,
        'requires_attachment' => false,
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->user)->delete(route('leave-types.destroy', $leaveType));

    $response->assertRedirect(route('leave-types.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseMissing('leave_types', [
        'id' => $leaveType->id,
    ]);
});

test('cannot delete an in-use leave type', function () {
    $leaveType = LeaveType::create([
        'name' => 'In Use',
        'max_days_per_year' => 5,
    ]);

    $department = Department::firstOrCreate(['name' => 'IT']);
    $position = Position::firstOrCreate(['name' => 'Staff']);
    
    $employeeUser = User::factory()->create();
    $employee = Employee::create([
        'user_id' => $employeeUser->id,
        'full_name' => 'John Doe',
        'position_id' => $position->id,
        'department_id' => $department->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 12,
    ]);
    
    LeaveRequest::create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'reason' => 'test use',
        'status' => 'pending'
    ]);

    $response = $this->actingAs($this->user)->delete(route('leave-types.destroy', $leaveType));

    $response->assertRedirect(route('leave-types.index'));
    $response->assertSessionHas('error');

    $this->assertDatabaseHas('leave_types', [
        'id' => $leaveType->id,
    ]);
});
