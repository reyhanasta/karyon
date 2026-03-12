<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Shift;
use App\Models\Department;

class ShiftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Shift Department Management
        $managementDept = Department::where('name', 'Manajemen')->first();
        if ($managementDept) {
            Shift::firstOrCreate([
                'department_id' => $managementDept->id,
                'name' => 'Pagi (Senin-Jumat)',
            ], [
                'start_time' => '08:00',
                'end_time' => '16:00',
                'is_active' => true,
            ]);
            
            Shift::firstOrCreate([
                'department_id' => $managementDept->id,
                'name' => 'Pagi (Sabtu)',
            ], [
                'start_time' => '08:00',
                'end_time' => '12:00',
                'is_active' => true,
            ]);
        }

        // 2. Shift Pelayanan Medis
        $medisDept = Department::where('name', 'Pelayanan Medis')->first();
        if ($medisDept) {
            $medisShifts = [
                ['name' => 'Pagi', 'start_time' => '08:00', 'end_time' => '14:00'],
                ['name' => 'Siang', 'start_time' => '14:00', 'end_time' => '20:00'],
                ['name' => 'Malam', 'start_time' => '20:00', 'end_time' => '08:00'],
            ];

            foreach ($medisShifts as $shift) {
                Shift::firstOrCreate([
                    'department_id' => $medisDept->id,
                    'name' => $shift['name'],
                ], [
                    'start_time' => $shift['start_time'],
                    'end_time' => $shift['end_time'],
                    'is_active' => true,
                ]);
            }
        }

        // 3. Shift Cleaning Service
        $csDept = Department::where('name', 'Cleaning Service')->first();
        if ($csDept) {
            $csShifts = [
                ['name' => 'Pagi', 'start_time' => '06:00', 'end_time' => '14:00'],
                ['name' => 'Siang', 'start_time' => '14:00', 'end_time' => '21:00'],
            ];

            foreach ($csShifts as $shift) {
                Shift::firstOrCreate([
                    'department_id' => $csDept->id,
                    'name' => $shift['name'],
                ], [
                    'start_time' => $shift['start_time'],
                    'end_time' => $shift['end_time'],
                    'is_active' => true,
                ]);
            }
        }

        // 4. Shift Security & Driver
        $securityDept = Department::where('name', 'Security & Driver')->first();
        if ($securityDept) {
            $securityShifts = [
                ['name' => 'Pagi', 'start_time' => '09:00', 'end_time' => '19:00'],
                ['name' => 'Malam', 'start_time' => '19:00', 'end_time' => '09:00'],
            ];

            foreach ($securityShifts as $shift) {
                Shift::firstOrCreate([
                    'department_id' => $securityDept->id,
                    'name' => $shift['name'],
                ], [
                    'start_time' => $shift['start_time'],
                    'end_time' => $shift['end_time'],
                    'is_active' => true,
                ]);
            }
        }

        // 5. Shift Farmasi
        $farmasiDept = Department::where('name', 'Farmasi')->first();
        if ($farmasiDept) {
            $farmasiShifts = [
                ['name' => 'Pagi Apoteker', 'start_time' => '08:00', 'end_time' => '17:00'],
                ['name' => 'Pagi Asisten Apoteker', 'start_time' => '08:00', 'end_time' => '16:00'],
                ['name' => 'Siang Asisten Apoteker', 'start_time' => '16:00', 'end_time' => '21:00'],
                ['name' => 'Malam Asisten Apoteker', 'start_time' => '18:00', 'end_time' => '08:00'],
            ];

            foreach ($farmasiShifts as $shift) {
                Shift::firstOrCreate([
                    'department_id' => $farmasiDept->id,
                    'name' => $shift['name'],
                ], [
                    'start_time' => $shift['start_time'],
                    'end_time' => $shift['end_time'],
                    'is_active' => true,
                ]);
            }
        }
    }
}
