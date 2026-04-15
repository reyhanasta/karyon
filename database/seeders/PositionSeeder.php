<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [
            ['name' => 'Direktur'],
            ['name' => 'Manajer'],
            ['name' => 'Perawat'],
            ['name' => 'Bidan'],
            ['name' => 'Rekam Medis'],
            ['name' => 'Casemix & HRD'],
            ['name' => 'Dokter'],
            ['name' => 'Apoteker'],
            ['name' => 'Asisten Apoteker'],
            ['name' => 'Farmasi'],
            ['name' => 'Staff Laboratorium'],
            ['name' => 'Ahli Gizi'],
            ['name' => 'Keuangan'],
            ['name' => 'IT'],
            ['name' => 'Security'],
            ['name' => 'Cleaning Service'],
        ];

        foreach ($positions as $position) {
            \App\Models\Position::create($position);
        }
    }
}
