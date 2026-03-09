<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Position;
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
    $response = $this->actingAs($this->authorizedUser)->post(route('positions.store'), [
        'name' => 'Manager',
        'description' => 'Department head',
    ]);

    $response->assertSessionHas('success');
    $this->assertDatabaseHas('positions', [
        'name' => 'Manager',
        'description' => 'Department head',
    ]);
});

test('cannot create duplicate position', function () {
    Position::create(['name' => 'Supervisor']);

    $response = $this->actingAs($this->authorizedUser)->post(route('positions.store'), [
        'name' => 'Supervisor',
    ]);

    $response->assertSessionHasErrors('name');
});

test('can update a position', function () {
    $position = Position::create(['name' => 'Old Name']);

    $response = $this->actingAs($this->authorizedUser)->put(route('positions.update', $position), [
        'name' => 'New Name',
        'description' => 'New Description',
    ]);

    $response->assertSessionHas('success');
    $this->assertDatabaseHas('positions', [
        'id' => $position->id,
        'name' => 'New Name',
        'description' => 'New Description',
    ]);
});

test('can delete a position without employees', function () {
    $position = Position::create(['name' => 'To Delete']);

    $response = $this->actingAs($this->authorizedUser)->delete(route('positions.destroy', $position));

    $response->assertSessionHas('success');
    $this->assertDatabaseMissing('positions', [
        'id' => $position->id,
    ]);
});

test('cannot delete a position with employees', function () {
    $department = Department::firstOrCreate(['name' => 'IT Department']);
    $position = Position::create(['name' => 'Has Employees']);
    
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
