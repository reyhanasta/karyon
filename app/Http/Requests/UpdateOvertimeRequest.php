<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOvertimeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('overtime-request.edit');
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'date'        => 'required|date|before_or_equal:today',
            'start_time'  => 'required',
            'end_time'    => 'required|after:start_time',
            'description' => 'required|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'date.before_or_equal' => 'Tanggal lembur harus hari ini atau sebelumnya.',
            'end_time.after'       => 'Waktu selesai harus setelah waktu mulai.',
        ];
    }

    public function attributes(): array
    {
        return [
            'employee_id' => 'karyawan',
            'date'        => 'tanggal',
            'start_time'  => 'waktu mulai',
            'end_time'    => 'waktu selesai',
            'description' => 'keterangan/alasan',
        ];
    }
}
