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
        // Hapus entri lama
        // DocumentType::where('name', 'Dokumen Lamaran Kerja')->delete();

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
                'name' => 'KTP',
                'description' => 'Kartu Tanda Penduduk',
                'is_active' => true,
            ],
            [
                'name' => 'Surat Lamaran Kerja',
                'description' => 'Surat lamaran kerja dari pelamar',
                'is_active' => true,
            ],
            [
                'name' => 'CV',
                'description' => 'Curriculum Vitae / Daftar Riwayat Hidup',
                'is_active' => true,
            ],
            [
                'name' => 'Transkrip Nilai',
                'description' => 'Transkrip nilai akademik dari perguruan tinggi',
                'is_active' => true,
            ],
        ];

        foreach ($types as $type) {
            DocumentType::firstOrCreate(['name' => $type['name']], $type);
        }
    }
}
