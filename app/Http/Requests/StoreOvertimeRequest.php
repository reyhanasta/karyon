<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOvertimeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('overtime.create') || $this->user()->can('overtime.create.any');
    }

    public function rules(): array
    {
        $rules = [
            'date'        => 'required|date|before_or_equal:today',
            'start_time'  => 'required',
            'end_time'    => 'required',
            'description' => 'required|string|max:500',
        ];

        if ($this->user()->can('overtime.create.any')) {
            $rules['employee_id'] = 'nullable|exists:employees,id';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'date.before_or_equal'  => 'Overtime date must be today or in the past.',
            'end_time.after'        => 'End time must be after the start time.',
        ];
    }
}
