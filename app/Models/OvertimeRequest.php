<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OvertimeRequest extends Model
{
    use SoftDeletes;

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
