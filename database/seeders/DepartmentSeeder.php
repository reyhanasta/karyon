<?php

namespace Database\Seeders;

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
            ['name' => 'Kebersihan'],
            ['name' => 'Security & Driver'],
            ['name' => 'Farmasi & Keuangan'],
        ];

        foreach ($departments as $department) {
            \App\Models\Department::create($department);
        }
    }
}
