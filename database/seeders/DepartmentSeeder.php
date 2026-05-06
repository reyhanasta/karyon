<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            ['name' => 'Manajemen'],
            ['name' => 'Pelayanan Medis'],
            ['name' => 'Cleaning Service'],
            ['name' => 'Security & Driver'],
            ['name' => 'Farmasi & Keuangan'],
        ];

        foreach ($departments as $department) {
            Department::updateOrCreate(['name' => $department['name']], $department);
        }
    }
}
