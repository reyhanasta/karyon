<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name' => 'Cuti Tahunan',
                'max_days_per_year' => 12,
                'is_paid' => true,
                'requires_attachment' => false,
                'description' => 'Cuti tahunan sesuai peraturan ketenagakerjaan. Maksimal 5 hari per bulan kalender.',
            ],
            [
                'name' => 'Cuti Sakit',
                'max_days_per_year' => 14,
                'is_paid' => true,
                'requires_attachment' => true,
                'description' => 'Cuti karena sakit. Disarankan melampirkan surat keterangan dokter.',
            ],
            [
                'name' => 'Cuti Melahirkan',
                'max_days_per_year' => 90,
                'is_paid' => true,
                'requires_attachment' => true,
                'description' => 'Cuti melahirkan sesuai UU Ketenagakerjaan.',
            ],
            [
                'name' => 'Izin Penting',
                'max_days_per_year' => 3,
                'is_paid' => true,
                'requires_attachment' => false,
                'description' => 'Izin untuk keperluan mendesak (pernikahan, kelahiran, kematian keluarga, dll).',
            ],
        ];

        foreach ($types as $type) {
            LeaveType::updateOrCreate(
                ['name' => $type['name']],
                $type
            );
        }
    }
}
