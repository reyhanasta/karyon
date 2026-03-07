<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('leave.edit');
    }

    public function rules(): array
    {
        return [
            'employee_id'   => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date'    => 'required|date|after_or_equal:today',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'reason'        => 'required|string|max:500',
            'attachment'    => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'leave_type_id.required'    => 'Jenis cuti wajib dipilih.',
            'start_date.after_or_equal' => 'Tanggal mulai harus hari ini atau setelahnya.',
            'end_date.after_or_equal'   => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
            'attachment.mimes'          => 'Lampiran harus berupa file JPG, PNG, atau PDF.',
            'attachment.max'            => 'Ukuran lampiran maksimal 2MB.',
        ];
    }
}
