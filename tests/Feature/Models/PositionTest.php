<?php

use App\Models\Position;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('position model has correct relationship types', function () {
    $position = new Position;

    expect($position->employees())->toBeInstanceOf(HasMany::class);
    expect($position->documentTypes())->toBeInstanceOf(BelongsToMany::class);
});

test('position can be soft deleted', function () {
    $position = Position::create(['name' => 'Manager']);

    $position->delete();

    $this->assertSoftDeleted('positions', ['id' => $position->id]);
    expect(Position::count())->toBe(0);
    expect(Position::withTrashed()->count())->toBe(1);
});

test('position can be restored', function () {
    $position = Position::create(['name' => 'Manager']);
    $position->delete();

    $position->restore();

    $this->assertDatabaseHas('positions', ['id' => $position->id, 'deleted_at' => null]);
    expect(Position::count())->toBe(1);
});

test('position forSelect scope returns ordered id and name only', function () {
    Position::create(['name' => 'Z Position']);
    Position::create(['name' => 'A Position']);

    $results = Position::forSelect()->get();

    expect($results->count())->toBe(2);
    expect($results->first()->name)->toBe('A Position');
    expect($results->last()->name)->toBe('Z Position');

    $first = $results->first()->toArray();
    expect(array_keys($first))->toEqualCanonicalizing(['id', 'name']);
});

test('position name is returned in title case', function () {
    $position = Position::create(['name' => 'manager level 1']);

    expect($position->name)->toBe('Manager Level 1');
});
