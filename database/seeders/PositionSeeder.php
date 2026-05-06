<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mapping = [
            'Manajemen' => [
                'Direktur',
                'Manajer',
                'Casemix HRD',
                'IT',
                'Staff Laboratorium',
                'Keuangan',
            ],
            'Pelayanan Medis' => [
                'Perawat',
                'Bidan',
                'Rekam Medis',
                'Dokter',
            ],
            'Security & Driver' => [
                'Security',
            ],
            'Cleaning Service' => [
                'Cleaning Service',
            ],
            'Farmasi & Keuangan' => [
                'Apoteker',
                'Asisten Apoteker',
            ],
        ];

        foreach ($mapping as $deptName => $positions) {
            $department = Department::where('name', $deptName)->first();

            if ($department) {
                foreach ($positions as $posName) {
                    Position::updateOrCreate(
                        ['name' => $posName],
                        ['department_id' => $department->id]
                    );
                }
            }
        }
    }
}
