<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'STR',
                'description' => 'Surat Tanda Registrasi',
                'is_active' => true,
            ],
            [
                'name' => 'SIP',
                'description' => 'Surat Izin Praktik',
                'is_active' => true,
            ],
            [
                'name' => 'Dokumen Lamaran Kerja',
                'description' => 'Berkas lamaran kerja awal (CV, Ijazah, dll)',
                'is_active' => true,
            ],
        ];

        foreach ($types as $type) {
            DocumentType::firstOrCreate(['name' => $type['name']], $type);
        }
    }
}
