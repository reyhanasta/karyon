<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('employee.edit');
    }

    public function rules(): array
    {
        $userId = $this->route('employee')->user_id;

        return [
            'nip'          => ['nullable', 'string', Rule::unique('users')->ignore($userId)],
            'email'        => ['required', 'email', Rule::unique('users')->ignore($userId)],
            'password'     => 'nullable|string|min:8',
            'full_name'    => 'required|string|max:255',
            'position_id'  => 'required|exists:positions,id',
            'department_id'=> 'required|exists:departments,id',
            'join_date'    => 'required|date',
            'role'         => 'required|exists:roles,name',
            'leave_quota'  => 'required|integer|min:0',
        ];
    }
}
