<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Position;
use App\Models\OvertimeRequest;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    // Create base permissions and roles
    $permissions = [
        'overtime.view',
        'overtime.create',
        'overtime.create.any',
        'overtime.edit',
        'overtime.approve'
    ];
    
    foreach ($permissions as $perm) {
        Permission::firstOrCreate(['name' => $perm]);
    }

    $managerRole = Role::firstOrCreate(['name' => 'manager']);
    $managerRole->syncPermissions(['overtime.view', 'overtime.create.any', 'overtime.edit', 'overtime.approve']);

    Role::firstOrCreate(['name' => 'super-admin']);
    Role::firstOrCreate(['name' => 'hr-admin']);

    $employeeRole = Role::firstOrCreate(['name' => 'employee']);
    $employeeRole->syncPermissions(['overtime.view', 'overtime.create']);
    
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

    // Another employee user (to test isolation)
    $this->otherEmployeeUser = User::factory()->create();
    $this->otherEmployeeUser->assignRole('employee');
    $this->otherEmployee = Employee::create([
        'user_id' => $this->otherEmployeeUser->id,
        'full_name' => 'Other Employee',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 12
    ]);
});

test('unauthenticated users are redirected from overtime requests', function () {
    $this->get(route('overtime-requests.index'))->assertRedirect(route('login'));
});

test('employees can view their own overtime index', function () {
    $response = $this->actingAs($this->employeeUser)->get(route('overtime-requests.index'));
    $response->assertOk();
});

test('manager can view all overtime index', function () {
    $response = $this->actingAs($this->managerUser)->get(route('overtime-requests.index'));
    $response->assertOk();
});

test('employee can submit own overtime request', function () {
    Notification::fake();

    $response = $this->actingAs($this->employeeUser)->post(route('overtime-requests.store'), [
        'date' => now()->toDateString(),
        'start_time' => '17:00',
        'end_time' => '20:00',
        'description' => 'Fixing bug XYZ',
    ]);

    $response->assertRedirect(route('overtime-requests.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('overtime_requests', [
        'employee_id' => $this->employee->id,
        'description' => 'Fixing bug XYZ',
        'status' => 'pending',
    ]);
});

test('employee cannot submit multiple overtimes for same date', function () {
    OvertimeRequest::create([
        'employee_id' => $this->employee->id,
        'date' => now()->toDateString(),
        'start_time' => '17:00',
        'end_time' => '19:00',
        'description' => 'Existing task',
        'status' => 'pending'
    ]);

    $response = $this->actingAs($this->employeeUser)->post(route('overtime-requests.store'), [
        'date' => now()->toDateString(),
        'start_time' => '19:00',
        'end_time' => '21:00',
        'description' => 'Another task',
    ]);

    $response->assertSessionHasErrors('date');
    $this->assertDatabaseCount('overtime_requests', 1);
});

test('manager can create overtime for another employee', function () {
    Notification::fake();
    $this->withoutExceptionHandling();
    $response = $this->actingAs($this->managerUser)->post(route('overtime-requests.store'), [
        'employee_id' => $this->employee->id,
        'date' => now()->toDateString(),
        'start_time' => '17:00',
        'end_time' => '20:00',
        'description' => 'Assigned bug fix',
    ]);

    $response->assertRedirect(route('overtime-requests.index'));
    $this->assertDatabaseHas('overtime_requests', [
        'employee_id' => $this->employee->id,
        'description' => 'Assigned bug fix',
    ]);
});

test('employee can view own overtime detail', function () {
    $overtime = OvertimeRequest::create([
        'employee_id' => $this->employee->id,
        'date' => now()->toDateString(),
        'start_time' => '17:00',
        'end_time' => '19:00',
        'description' => 'Existing task',
        'status' => 'pending'
    ]);

    $this->actingAs($this->employeeUser)->get(route('overtime-requests.show', $overtime))->assertOk();
});

test('employee cannot view other employee overtime detail', function () {
    $overtime = OvertimeRequest::create([
        'employee_id' => $this->otherEmployee->id,
        'date' => now()->toDateString(),
        'start_time' => '17:00',
        'end_time' => '19:00',
        'description' => 'Existing task',
        'status' => 'pending'
    ]);

    $this->actingAs($this->employeeUser)->get(route('overtime-requests.show', $overtime))->assertForbidden();
});

test('manager can view any overtime detail', function () {
    $overtime = OvertimeRequest::create([
        'employee_id' => $this->otherEmployee->id,
        'date' => now()->toDateString(),
        'start_time' => '17:00',
        'end_time' => '19:00',
        'description' => 'Existing task',
        'status' => 'pending'
    ]);

    $this->actingAs($this->managerUser)->get(route('overtime-requests.show', $overtime))->assertOk();
});

test('manager can update overtime status', function () {
    Notification::fake();
    $this->withoutExceptionHandling();
    $overtime = OvertimeRequest::create([
        'employee_id' => $this->employee->id,
        'date' => now()->toDateString(),
        'start_time' => '17:00',
        'end_time' => '19:00',
        'description' => 'Existing task',
        'status' => 'pending'
    ]);

    $response = $this->actingAs($this->managerUser)->post(route('overtime-requests.status', $overtime), [
        'status' => 'approved'
    ]);

    $response->assertSessionHas('success');
    $this->assertDatabaseHas('overtime_requests', [
        'id' => $overtime->id,
        'status' => 'approved',
    ]);
});

test('employee cannot update overtime status', function () {
    $overtime = OvertimeRequest::create([
        'employee_id' => $this->otherEmployee->id,
        'date' => now()->toDateString(),
        'start_time' => '17:00',
        'end_time' => '19:00',
        'description' => 'Existing task',
        'status' => 'pending'
    ]);

    $this->actingAs($this->employeeUser)->post(route('overtime-requests.status', $overtime), [
        'status' => 'approved'
    ])->assertForbidden();
});

test('cannot update status if already processed', function () {
    $overtime = OvertimeRequest::create([
        'employee_id' => $this->employee->id,
        'date' => now()->toDateString(),
        'start_time' => '17:00',
        'end_time' => '19:00',
        'description' => 'Existing task',
        'status' => 'rejected'
    ]);

    $response = $this->actingAs($this->managerUser)->post(route('overtime-requests.status', $overtime), [
        'status' => 'approved'
    ]);

    $response->assertSessionHas('error');
    $this->assertDatabaseHas('overtime_requests', [
        'id' => $overtime->id,
        'status' => 'rejected', // Remains rejected
    ]);
});
