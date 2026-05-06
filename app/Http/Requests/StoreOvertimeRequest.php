<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOvertimeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('overtime-request.create') || $this->user()->can('overtime-request.create.any');
    }

    public function rules(): array
    {
        $rules = [
            'date' => 'required|date|before_or_equal:today',
            'start_time' => 'required',
            'end_time' => 'required',
            'description' => 'required|string|max:500',
        ];

        if ($this->user()->can('overtime-request.create.any')) {
            $rules['employee_id'] = 'nullable|exists:employees,id';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'date.before_or_equal' => 'Tanggal lembur harus hari ini atau sebelumnya.',
            'end_time.after' => 'Waktu selesai harus setelah waktu mulai.',
        ];
    }

    public function attributes(): array
    {
        return [
            'employee_id' => 'karyawan',
            'date' => 'tanggal',
            'start_time' => 'waktu mulai',
            'end_time' => 'waktu selesai',
            'description' => 'keterangan/alasan',
        ];
    }
}
