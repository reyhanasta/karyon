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
            ['name' => 'Pendaftaran'],
            ['name' => 'HRD'],
            ['name' => 'Dokter'],
            ['name' => 'Apoteker'],
            ['name' => 'Farmasi'],
            ['name' => 'Analis Laboratorium'],
            ['name' => 'Ahli Gizi'],
            ['name' => 'Staf Keuangan'],
            ['name' => 'Staf IT'],
            ['name' => 'Security'],
            ['name' => 'Cleaning Service'],
        ];

        foreach ($positions as $position) {
            \App\Models\Position::create($position);
        }
    }
}
