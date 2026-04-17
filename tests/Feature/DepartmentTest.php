<?php

use App\Models\Department;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\DB;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(RoleAndPermissionSeeder::class);
    $this->user = User::where('email', 'admin@admin.com')->first();
});

test('admin can view departments list', function () {
    Department::create(['name' => 'IT Department', 'description' => 'Test Desk']);

    actingAs($this->user)
        ->get(route('departments.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('departments/index')
            ->has('departments.data')
        );
});

test('admin can store a new department', function () {
    actingAs($this->user)
        ->post(route('departments.store'), [
            'name' => 'Human Resources',
            'description' => 'HR description'
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('departments', [
        'name' => 'Human Resources'
    ]);
});

test('admin can update a department', function () {
    $department = Department::create(['name' => 'Finance']);

    actingAs($this->user)
        ->patch(route('departments.update', $department), [
            'name' => 'Finance & Accounting',
            'description' => 'Updated description'
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($department->refresh()->name)->toBe('Finance & Accounting');
});

test('admin can delete a department without employees', function () {
    $department = Department::create(['name' => 'Temporary Dept']);

    actingAs($this->user)
        ->delete(route('departments.destroy', $department))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('departments', ['id' => $department->id]);
});

test('admin cannot delete a department with active employees', function () {
    $department = Department::create(['name' => 'Critical Dept']);
    \App\Models\Employee::factory()->create([
        'department_id' => $department->id
    ]);

    actingAs($this->user)
        ->delete(route('departments.destroy', $department))
        ->assertRedirect()
        ->assertSessionHas('error', 'Cannot delete department with active employees.');

    $this->assertDatabaseHas('departments', ['id' => $department->id]);
});
