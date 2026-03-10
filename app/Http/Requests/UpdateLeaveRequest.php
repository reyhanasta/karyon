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
        $rules = [
            'employee_id'   => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date'    => 'required|date|after_or_equal:today',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'reason'        => 'required|string|max:500',
        ];

        $leaveType = \App\Models\LeaveType::find($this->input('leave_type_id'));
        $leaveRequest = $this->route('leave_request'); // The bound model

        if ($leaveType && $leaveType->requires_attachment) {
            if (!$leaveRequest || !$leaveRequest->attachment_path) {
                $rules['attachment'] = 'required|file|mimes:jpg,jpeg,png,pdf|max:2048';
            } else {
                $rules['attachment'] = 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048';
            }
        } else {
            $rules['attachment'] = 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048';
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
