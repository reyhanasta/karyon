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
        $roleRule = 'required|exists:roles,name';
        if (! $this->user()->hasRole('super-admin')) {
            $roleRule .= '|in:employee,director,karu';
        }

        return [
            'nip' => 'nullable|string|unique:users,nip',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:8',
            'full_name' => 'required|string|max:255',
            'position_id' => 'required|exists:positions,id',
            'department_id' => 'required|exists:departments,id',
            'employee_sip' => 'nullable|string|max:255',
            'employee_status' => 'required|string|in:orientasi,tidak_tetap,tetap,keluar',
            'join_date' => 'required|date',
            'role' => $roleRule,
            'leave_quota' => 'required|integer|min:0',
        ];
    }
}
