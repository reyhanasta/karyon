<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Position;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Http\UploadedFile;
use Maatwebsite\Excel\Facades\Excel;

beforeEach(function () {
    // Create necessary permissions and roles
    $permissions = [
        'employee.view',
        'employee.create',
        'employee.edit',
        'employee.delete',
    ];
    
    foreach ($permissions as $perm) {
        Permission::firstOrCreate(['name' => $perm]);
    }

    $this->hrRole = Role::firstOrCreate(['name' => 'hr-admin']);
    $this->hrRole->syncPermissions($permissions);

    $this->userRole = Role::firstOrCreate(['name' => 'employee']);

    $this->hrUser = User::factory()->create();
    $this->hrUser->assignRole('hr-admin');

    $this->unauthorizedUser = User::factory()->create();

    $this->department = Department::firstOrCreate(['name' => 'IT Department']);
    $this->position = Position::firstOrCreate(['name' => 'IT Staff']);
});

test('unauthenticated users are redirected', function () {
    $this->get(route('employees.index'))->assertRedirect(route('login'));
});

test('unauthorized users get forbidden on index', function () {
    $this->actingAs($this->unauthorizedUser)
         ->get(route('employees.index'))
         ->assertForbidden();
});

test('authorized users can view employees index', function () {
    $this->actingAs($this->hrUser)
         ->get(route('employees.index'))
         ->assertOk();
});

test('can view create employee page', function () {
    $this->actingAs($this->hrUser)
         ->get(route('employees.create'))
         ->assertOk();
});

test('unauthorized users cannot store employee', function () {
    $this->actingAs($this->unauthorizedUser)
         ->post(route('employees.store'), [])
         ->assertForbidden();
});

test('can store an employee', function () {
    $response = $this->actingAs($this->hrUser)->post(route('employees.store'), [
        'full_name' => 'New Employee',
        'email' => 'new@employee.com',
        'nip' => '12345678',
        'password' => 'password',
        'role' => 'employee',
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 12,
    ]);

    $response->assertRedirect(route('employees.index'));
    
    $this->assertDatabaseHas('users', [
        'email' => 'new@employee.com',
        'nip' => '12345678',
    ]);

    $this->assertDatabaseHas('employees', [
        'full_name' => 'New Employee',
        'leave_quota' => 12,
    ]);
});

test('can view employee details', function () {
    $employeeUser = User::factory()->create();
    $employee = Employee::create([
        'user_id' => $employeeUser->id,
        'full_name' => 'Detailed Employee',
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 12,
    ]);

    $this->actingAs($this->hrUser)
         ->get(route('employees.show', $employee))
         ->assertOk();
});

test('can view edit employee page', function () {
    $employeeUser = User::factory()->create();
    $employee = Employee::create([
        'user_id' => $employeeUser->id,
        'full_name' => 'Edit Employee',
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 12,
    ]);

    $this->actingAs($this->hrUser)
         ->get(route('employees.edit', $employee))
         ->assertOk();
});

test('can update an employee', function () {
    $employeeUser = User::factory()->create([
        'email' => 'old@email.com',
        'nip' => 'old-nip'
    ]);
    $employeeUser->assignRole('employee');

    $employee = Employee::create([
        'user_id' => $employeeUser->id,
        'full_name' => 'Old Name',
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 10,
    ]);

    $response = $this->actingAs($this->hrUser)->put(route('employees.update', $employee), [
        'full_name' => 'Updated Name',
        'email' => 'updated@email.com',
        'nip' => 'new-nip',
        'role' => 'hr-admin',
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 15,
    ]);

    $response->assertRedirect(route('employees.index'));
    
    $this->assertDatabaseHas('users', [
        'id' => $employeeUser->id,
        'email' => 'updated@email.com',
        'nip' => 'new-nip',
    ]);

    $this->assertDatabaseHas('employees', [
        'id' => $employee->id,
        'full_name' => 'Updated Name',
        'leave_quota' => 15,
    ]);

    expect($employeeUser->refresh()->hasRole('hr-admin'))->toBeTrue();
});

test('unauthorized users cannot delete employee', function () {
    $employeeUser = User::factory()->create();
    $employee = Employee::create([
        'user_id' => $employeeUser->id,
        'full_name' => 'To Delete',
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 12,
    ]);

    $this->actingAs($this->unauthorizedUser)
         ->delete(route('employees.destroy', $employee))
         ->assertForbidden();
});

test('can delete an employee', function () {
    $employeeUser = User::factory()->create();
    $employee = Employee::create([
        'user_id' => $employeeUser->id,
        'full_name' => 'To Delete',
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'join_date' => now()->toDateString(),
        'leave_quota' => 12,
    ]);

    $response = $this->actingAs($this->hrUser)
         ->delete(route('employees.destroy', $employee));

    $response->assertRedirect(route('employees.index'));
    
    // Check soft delete
    $this->assertSoftDeleted('employees', [
        'id' => $employee->id,
    ]);
});

test('can export employees', function () {
    Excel::fake();

    $response = $this->actingAs($this->hrUser)->get(route('employees.export'));
    
    $response->assertOk();
    Excel::assertDownloaded('employees_' . now()->format('Y-m-d') . '.xlsx');
});

test('can import employees', function () {
    Excel::fake();

    $file = UploadedFile::fake()->create('employees.xlsx', 100);

    $response = $this->actingAs($this->hrUser)->post(route('employees.import'), [
        'file' => $file,
    ]);

    Excel::assertImported('employees.xlsx');
    // Note: Since Excel is fake, it won't actually process it, but it proves the controller acts correctly
    $response->assertRedirect();
});
