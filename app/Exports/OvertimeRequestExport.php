<?php

namespace App\Exports;

use App\Models\OvertimeRequest;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Carbon\Carbon;

class OvertimeRequestExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithColumnFormatting
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $status = $this->filters['status'] ?? null;
        $search = $this->filters['search'] ?? null;
        $dateFrom = $this->filters['date_from'] ?? null;
        $dateTo = $this->filters['date_to'] ?? null;

        $query = OvertimeRequest::with(['employee.user', 'employee.department']);

        $query->when($status, function ($q) use ($status) {
            if ($status === 'pending') {
                $q->where('status', 'like', 'pending_%');
            } else {
                $q->where('status', $status);
            }
        });

        $query->when($search, function ($q) use ($search) {
            $q->whereHas('employee', fn ($q2) => $q2->where('full_name', 'like', "%{$search}%"));
        });

        $query->when($dateFrom, fn ($q) => $q->where('date', '>=', $dateFrom));
        $query->when($dateTo, fn ($q) => $q->where('date', '<=', $dateTo));

        return $query->orderBy('date', 'desc');
    }

    public function headings(): array
    {
        return [
            'Employee Name',
            'NIP',
            'Department',
            'Date',
            'Start Time',
            'End Time',
            'Total Hours',
            'Status',
            'Description',
            'Requested At',
        ];
    }

    /**
     * @param OvertimeRequest $overtimeRequest
     */
    public function map($overtimeRequest): array
    {
        $start = Carbon::parse($overtimeRequest->start_time);
        $end = Carbon::parse($overtimeRequest->end_time);
        
        // Basic hours calculation (assuming same day overtime)
        $totalHours = round($start->diffInMinutes($end) / 60, 2);

        return [
            $overtimeRequest->employee?->full_name ?? '',
            $overtimeRequest->employee?->user?->nip ?? '',
            $overtimeRequest->employee?->department?->name ?? '',
            $overtimeRequest->date,
            $overtimeRequest->start_time,
            $overtimeRequest->end_time,
            $totalHours,
            ucfirst(str_replace('_', ' ', $overtimeRequest->status)),
            $overtimeRequest->description,
            $overtimeRequest->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function columnFormats(): array
    {
        return [
            'B' => NumberFormat::FORMAT_TEXT, // NIP
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        $cellRange = 'A1:' . $highestColumn . $highestRow;

        $sheet->getStyle($cellRange)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

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
