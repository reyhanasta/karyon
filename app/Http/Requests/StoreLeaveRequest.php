<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('leave.create') || $this->user()->can('leave.create.any');
    }

    public function rules(): array
    {
        $canCreateAny = $this->user()->can('leave.create.any');

        $rules = [
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date'    => $canCreateAny ? 'required|date' : 'required|date|after_or_equal:today',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'reason'        => 'required|string|max:500',
            'attachment'    => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ];

        if ($canCreateAny) {
            $rules['employee_id'] = 'nullable|exists:employees,id';
        }

        return $rules;
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
