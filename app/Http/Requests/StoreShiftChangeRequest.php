<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreShiftChangeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'requester_id'       => 'nullable|exists:employees,id',
            'request_date'       => 'required|date',
            'requester_shift_id' => 'required|exists:shifts,id',
            'target_id'          => 'required|exists:employees,id',
            'reason'             => 'required|string|max:500',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'requester_id'       => 'karyawan pemohon',
            'request_date'       => 'tanggal penggantian',
            'requester_shift_id' => 'shift asal',
            'target_id'          => 'karyawan pengganti',
            'reason'             => 'alasan',
        ];
    }
}
