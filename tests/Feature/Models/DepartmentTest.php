<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('department model has correct relationship types', function () {
    $department = new Department;

    expect($department->employees())->toBeInstanceOf(HasMany::class);
    expect($department->managers())->toBeInstanceOf(BelongsToMany::class);
});

test('department can be soft deleted', function () {
    $department = Department::create(['name' => 'IT']);

    $department->delete();

    $this->assertSoftDeleted('departments', ['id' => $department->id]);
    expect(Department::count())->toBe(0);
    expect(Department::withTrashed()->count())->toBe(1);
});

test('department can be restored', function () {
    $department = Department::create(['name' => 'IT']);
    $department->delete();

    $department->restore();

    $this->assertDatabaseHas('departments', ['id' => $department->id, 'deleted_at' => null]);
    expect(Department::count())->toBe(1);
});

test('department managers relationship records timestamps', function () {
    $department = Department::create(['name' => 'IT']);
    $user = User::factory()->create();

    $department->managers()->attach($user->id);

    $pivot = DB::table('department_managers')->where('department_id', $department->id)->first();

    expect($pivot->created_at)->not->toBeNull();
    expect($pivot->updated_at)->not->toBeNull();
});

test('department forSelect scope returns ordered id and name only', function () {
    Department::create(['name' => 'Z Department']);
    Department::create(['name' => 'A Department']);

    $results = Department::forSelect()->get();

    expect($results->count())->toBe(2);
    expect($results->first()->name)->toBe('A Department');
    expect($results->last()->name)->toBe('Z Department');

    $first = $results->first()->toArray();
    expect(array_keys($first))->toEqualCanonicalizing(['id', 'name']);
});

test('department name is returned in title case', function () {
    $department = Department::create(['name' => 'it department']);

    expect($department->name)->toBe('It Department');
});

test('department activeEmployees relationship excludes resigned employees', function () {
    $department = Department::create(['name' => 'IT']);

    Employee::factory()->create([
        'department_id' => $department->id,
        'employee_status' => 'tetap',
    ]);

    Employee::factory()->create([
        'department_id' => $department->id,
        'employee_status' => 'keluar',
    ]);

    expect($department->employees()->count())->toBe(2);
    expect($department->activeEmployees()->count())->toBe(1);
});
