<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Organization
        \App\Models\Department::create(['name' => 'General Support']);
        \App\Models\Department::create(['name' => 'Medical']);
        \App\Models\Department::create(['name' => 'IT & Engineering']);

        \App\Models\Position::create(['name' => 'Doctor']);
        \App\Models\Position::create(['name' => 'Nurse']);
        \App\Models\Position::create(['name' => 'Staff']);

        $this->call([
            RoleAndPermissionSeeder::class,
        ]);
    }
}
