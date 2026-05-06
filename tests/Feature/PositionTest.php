<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'employee.view']);

    $this->authorizedUser = User::factory()->create();
    $this->authorizedUser->givePermissionTo('employee.view');

    $this->unauthorizedUser = User::factory()->create();
});

test('unauthenticated users are redirected', function () {
    $this->get(route('positions.index'))->assertRedirect(route('login'));
});

test('unauthorized users get forbidden', function () {
    $this->actingAs($this->unauthorizedUser)
        ->get(route('positions.index'))
        ->assertForbidden();
});

test('authorized users can view positions', function () {
    $this->actingAs($this->authorizedUser)
        ->get(route('positions.index'))
        ->assertOk();
});

test('can create a position', function () {
    $department = Department::create(['name' => 'IT']);
    $response = $this->actingAs($this->authorizedUser)->post(route('positions.store'), [
        'name' => 'Manager',
        'description' => 'Department head',
        'department_id' => $department->id,
    ]);

    $response->assertSessionHas('success');
    $this->assertDatabaseHas('positions', [
        'name' => 'Manager',
        'description' => 'Department head',
        'department_id' => $department->id,
    ]);
});

test('cannot create duplicate position in same department', function () {
    $department = Department::create(['name' => 'IT']);
    Position::create(['name' => 'Supervisor', 'department_id' => $department->id]);

    // Allowed in different dept
    Position::create(['name' => 'Supervisor', 'department_id' => Department::create(['name' => 'HR'])->id]);

    $response = $this->actingAs($this->authorizedUser)->post(route('positions.store'), [
        'name' => 'Supervisor',
        'department_id' => $department->id,
    ]);

    $response->assertSessionHasErrors('name');
});

test('can update a position', function () {
    $department = Department::create(['name' => 'IT']);
    $position = Position::create(['name' => 'Old Name', 'department_id' => $department->id]);

    $response = $this->actingAs($this->authorizedUser)->put(route('positions.update', $position), [
        'name' => 'New Name',
        'description' => 'New Description',
        'department_id' => $department->id,
    ]);

    $response->assertSessionHas('success');
    $this->assertDatabaseHas('positions', [
        'id' => $position->id,
        'name' => 'New Name',
        'department_id' => $department->id,
    ]);
});

test('can delete a position without employees', function () {
    $department = Department::create(['name' => 'IT']);
    $position = Position::create(['name' => 'To Delete', 'department_id' => $department->id]);

    $response = $this->actingAs($this->authorizedUser)->delete(route('positions.destroy', $position));

    $response->assertSessionHas('success');
    $this->assertSoftDeleted($position);
});

test('cannot delete a position with employees', function () {
    $department = Department::firstOrCreate(['name' => 'IT Department']);
    $position = Position::create(['name' => 'Has Employees', 'department_id' => $department->id]);

    $user = User::factory()->create();
    Employee::create([
        'user_id' => $user->id,
        'full_name' => 'Jane Doe',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 12,
    ]);

    $response = $this->actingAs($this->authorizedUser)->delete(route('positions.destroy', $position));

    $response->assertSessionHas('error');
    $this->assertDatabaseHas('positions', [
        'id' => $position->id,
    ]);
});
