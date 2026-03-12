<?php

use App\Models\Department;
use App\Models\Position;
use Spatie\Permission\Models\Role;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    // Create the required role for registration
    Role::create(['name' => 'employee']);
    
    $department = Department::factory()->create();
    $position = Position::factory()->create(['name' => 'Staff IT']);

    $response = $this->post(route('register.store'), [
        'full_name' => 'Test User',
        'email' => 'test@example.com',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
    
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
    ]);
    
    $this->assertDatabaseHas('employees', [
        'full_name' => 'Test User',
        'department_id' => $department->id,
        'position_id' => $position->id,
    ]);
});
