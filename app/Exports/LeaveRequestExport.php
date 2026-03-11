<?php

namespace App\Exports;

use App\Models\LeaveRequest;
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

class LeaveRequestExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithColumnFormatting
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
        $leaveTypeId = $this->filters['leave_type_id'] ?? null;

        $query = LeaveRequest::with(['employee.user', 'employee.department', 'leaveType']);

        $query->when($status, function ($q) use ($status) {
            if ($status === 'pending') {
                $q->where('status', 'like', 'pending_%');
            } else {
                $q->where('status', $status);
            }
        });

        $query->when($leaveTypeId, fn ($q) => $q->where('leave_type_id', $leaveTypeId));

        $query->when($search, function ($q) use ($search) {
            $q->whereHas('employee', fn ($q2) => $q2->where('full_name', 'like', "%{$search}%"));
        });

        $query->when($dateFrom, fn ($q) => $q->where('start_date', '>=', $dateFrom));
        $query->when($dateTo, fn ($q) => $q->where('end_date', '<=', $dateTo));

        return $query->latest();
    }

    public function headings(): array
    {
        return [
            'Employee Name',
            'NIP',
            'Department',
            'Leave Type',
            'Start Date',
            'End Date',
            'Total Days',
            'Status',
            'Reason',
            'Requested At',
        ];
    }

    /**
     * @param LeaveRequest $leaveRequest
     */
    public function map($leaveRequest): array
    {
        $start = Carbon::parse($leaveRequest->start_date);
        $end = Carbon::parse($leaveRequest->end_date);
        $totalDays = $start->diffInDays($end) + 1;

        return [
            $leaveRequest->employee?->full_name ?? '',
            $leaveRequest->employee?->user?->nip ?? '',
            $leaveRequest->employee?->department?->name ?? '',
            $leaveRequest->leaveType?->name ?? '',
            $leaveRequest->start_date,
            $leaveRequest->end_date,
            $totalDays,
            ucfirst(str_replace('_', ' ', $leaveRequest->status)),
            $leaveRequest->reason,
            $leaveRequest->created_at->format('Y-m-d H:i:s'),
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
