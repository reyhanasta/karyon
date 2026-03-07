<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOvertimeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('overtime.edit');
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
            'date.before_or_equal' => 'Overtime date must be today or in the past.',
            'end_time.after'       => 'End time must be after the start time.',
        ];
    }
}
