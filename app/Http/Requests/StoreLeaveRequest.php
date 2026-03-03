<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('leave.create');
    }

    public function rules(): array
    {
        return [
            'start_date' => 'required|date|after_or_equal:today',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'reason'     => 'required|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.after_or_equal' => 'Leave start date must be today or in the future.',
            'end_date.after_or_equal'   => 'End date must be on or after the start date.',
        ];
    }
}
