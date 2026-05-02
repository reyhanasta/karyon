<?php

namespace App\Exports;

use App\Models\ShiftChangeRequest;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ShiftChangeRequestsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $collection;

    public function __construct($collection)
    {
        $this->collection = $collection;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->collection;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Pemohon',
            'Karyawan Pengganti',
            'Tanggal Shift',
            'Shift',
            'Alasan',
            'Status',
            'Diajukan',
        ];
    }

    public function map($request): array
    {
        $shiftInfo = $request->requesterShift 
            ? "{$request->requesterShift->name} (" . substr($request->requesterShift->start_time, 0, 5) . "-" . substr($request->requesterShift->end_time, 0, 5) . ")"
            : '-';

        return [
            $request->id,
            $request->requester->full_name ?? '-',
            $request->target->full_name ?? '-',
            \Carbon\Carbon::parse($request->request_date)->format('d-m-Y'),
            $shiftInfo,
            $request->reason,
            str_replace('_', ' ', ucfirst($request->status)),
            $request->created_at->format('d-m-Y H:i'),
        ];
    }
}
