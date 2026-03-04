<?php

namespace App\Exports;

use App\Models\Employee;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class EmployeeExport extends DefaultValueBinder implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithColumnFormatting, WithCustomValueBinder
{
    public function collection()
    {
        return Employee::with(['user.roles', 'position', 'department'])->orderBy('created_at', 'desc')->get();
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

    /**
     * Bind value to a cell.
     * Ensure NIP (Column A) is always a String.
     */
    public function bindValue(Cell $cell, $value)
    {
        if ($cell->getColumn() === 'A') {
            $cell->setValueExplicit($value, DataType::TYPE_STRING);
            return true;
        }

        return parent::bindValue($cell, $value);
    }

    public function columnFormats(): array
    {
        return [
            'A' => NumberFormat::FORMAT_TEXT, // NIP
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        // Get the highest row and column
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        $cellRange = 'A1:' . $highestColumn . $highestRow;

        // Apply borders
        $sheet->getStyle($cellRange)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        // Specific style for Header (Row 1)
        $sheet->getStyle('A1:' . $highestColumn . '1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['argb' => 'FFFFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => [
                    'argb' => 'FF4F46E5', // Indigo-600
                ]
            ],
        ]);

        return [];
    }
}
