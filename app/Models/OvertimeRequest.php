<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OvertimeRequest extends Model
{
    protected $fillable = [
        'employee_id',
        'date',
        'start_time',
        'end_time',
        'description',
        'status',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
