<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Shift;
use App\Models\ShiftChangeRequest;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(RoleAndPermissionSeeder::class);
    $this->admin = User::where('email', 'admin@admin.com')->first();
    
    // Setup basic org structure
    $this->department = Department::create(['name' => 'Medis']);
    $this->position = Position::create(['name' => 'Dokter']);
    $this->shift = Shift::create([
        'name' => 'Pagi', 
        'start_time' => '07:00', 
        'end_time' => '14:00', 
        'department_id' => $this->department->id,
        'is_active' => true
    ]);

    // Setup employees
    $this->employeeA = Employee::factory()->create([
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'full_name' => 'Employee Alpha'
    ]);
    $this->employeeA->user->assignRole('employee');

    $this->employeeB = Employee::factory()->create([
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'full_name' => 'Employee Beta'
    ]);
    $this->employeeB->user->assignRole('employee');
});

test('employee can view shift change requests index', function () {
    actingAs($this->employeeA->user)
        ->get(route('shift-change-requests.index'))
        ->assertStatus(200);
});

test('employee can submit a shift change request to a colleague', function () {
    actingAs($this->employeeA->user)
        ->post(route('shift-change-requests.store'), [
            'request_date' => now()->addDay()->format('Y-m-d'),
            'requester_shift_id' => $this->shift->id,
            'target_id' => $this->employeeB->id,
            'reason' => 'Ada keperluan keluarga'
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('shift_change_requests', [
        'requester_id' => $this->employeeA->id,
        'target_id' => $this->employeeB->id,
        'status' => 'pending_target'
    ]);
});

test('admin can submit a shift change request on behalf of an employee', function () {
    actingAs($this->admin)
        ->post(route('shift-change-requests.store'), [
            'requester_id' => $this->employeeA->id,
            'request_date' => now()->addDay()->format('Y-m-d'),
            'requester_shift_id' => $this->shift->id,
            'target_id' => $this->employeeB->id,
            'reason' => 'Created by admin'
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('shift_change_requests', [
        'requester_id' => $this->employeeA->id,
        'target_id' => $this->employeeB->id,
        'status' => 'pending_target'
    ]);
});

test('target employee can approve a shift change request', function () {
    $request = ShiftChangeRequest::create([
        'requester_id' => $this->employeeA->id,
        'target_id' => $this->employeeB->id,
        'request_date' => now()->addDay()->format('Y-m-d'),
        'requester_shift_id' => $this->shift->id,
        'status' => 'pending_target',
        'reason' => 'Test'
    ]);

    actingAs($this->employeeB->user)
        ->post(route('shift-change-requests.approve-target', $request))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($request->refresh()->status)->toBe('pending_hrd');
});

test('hr admin can approve a target-approved shift change request', function () {
    $request = ShiftChangeRequest::create([
        'requester_id' => $this->employeeA->id,
        'target_id' => $this->employeeB->id,
        'request_date' => now()->addDay()->format('Y-m-d'),
        'requester_shift_id' => $this->shift->id,
        'status' => 'pending_hrd',
        'target_approved_by' => $this->employeeB->user_id,
        'target_approved_at' => now(),
        'reason' => 'Test'
    ]);

    actingAs($this->admin)
        ->post(route('shift-change-requests.approve-hrd', $request))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($request->refresh()->status)->toBe('pending_manager');
});
