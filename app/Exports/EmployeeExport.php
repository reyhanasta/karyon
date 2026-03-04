<?php

namespace App\Exports;

use App\Models\Employee;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EmployeeExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    public function collection()
    {
        return Employee::with(['user.roles', 'position', 'department'])->get();
    }

    public function headings(): array
    {
        return [
            'NIP',
            'Full Name',
            'Email',
            'Position',
            'Department',
            'Role',
            'Join Date',
            'Leave Quota',
        ];
    }

    /**
     * @param Employee $employee
     */
    public function map($employee): array
    {
        return [
            $employee->user?->nip ?? '',
            $employee->full_name,
            $employee->user?->email ?? '',
            $employee->position?->name ?? '',
            $employee->department?->name ?? '',
            $employee->user?->roles?->first()?->name ?? 'employee',
            $employee->join_date ?? '',
            $employee->leave_quota,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
