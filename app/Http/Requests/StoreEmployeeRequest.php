<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('employee.create');
    }

    public function rules(): array
    {
        return [
            'nip'          => 'required|string|unique:users,nip',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|string|min:8',
            'full_name'    => 'required|string|max:255',
            'position_id'  => 'required|exists:positions,id',
            'department_id'=> 'required|exists:departments,id',
            'join_date'    => 'required|date',
            'role'         => 'required|exists:roles,name',
            'leave_quota'  => 'required|integer|min:0',
        ];
    }
}
