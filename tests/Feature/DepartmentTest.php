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
    $this->get(route('departments.index'))->assertRedirect(route('login'));
});

test('unauthorized users get forbidden', function () {
    $this->actingAs($this->unauthorizedUser)
         ->get(route('departments.index'))
         ->assertForbidden();
});

test('authorized users can view departments', function () {
    $this->actingAs($this->authorizedUser)
         ->get(route('departments.index'))
         ->assertOk();
});

test('can create a department', function () {
    $response = $this->actingAs($this->authorizedUser)->post(route('departments.store'), [
        'name' => 'Finance',
        'description' => 'Handles money',
    ]);

    $response->assertSessionHas('success');
    $this->assertDatabaseHas('departments', [
        'name' => 'Finance',
        'description' => 'Handles money',
    ]);
});

test('cannot create duplicate department', function () {
    Department::create(['name' => 'Marketing']);

    $response = $this->actingAs($this->authorizedUser)->post(route('departments.store'), [
        'name' => 'Marketing',
    ]);

    $response->assertSessionHasErrors('name');
});

test('can update a department', function () {
    $department = Department::create(['name' => 'Old Name']);

    $response = $this->actingAs($this->authorizedUser)->put(route('departments.update', $department), [
        'name' => 'New Name',
        'description' => 'New Description',
    ]);

    $response->assertSessionHas('success');
    $this->assertDatabaseHas('departments', [
        'id' => $department->id,
        'name' => 'New Name',
        'description' => 'New Description',
    ]);
});

test('can delete a department without employees', function () {
    $department = Department::create(['name' => 'To Delete']);

    $response = $this->actingAs($this->authorizedUser)->delete(route('departments.destroy', $department));

    $response->assertSessionHas('success');
    $this->assertDatabaseMissing('departments', [
        'id' => $department->id,
    ]);
});

test('cannot delete a department with employees', function () {
    $department = Department::create(['name' => 'Has Employees']);
    $position = Position::firstOrCreate(['name' => 'Staff']);
    
    $user = User::factory()->create();
    Employee::create([
        'user_id' => $user->id,
        'full_name' => 'John Doe',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 12,
    ]);

    $response = $this->actingAs($this->authorizedUser)->delete(route('departments.destroy', $department));

    $response->assertSessionHas('error');
    $this->assertDatabaseHas('departments', [
        'id' => $department->id,
    ]);
});
