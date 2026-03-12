<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShiftChangeRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'requester_id',
        'target_id',
        'request_date',
        'requester_shift_id',
        'target_shift_id',
        'reason',
        'status',
        'target_approved_by',
        'target_approved_at',
        'hrd_approved_by',
        'hrd_approved_at',
        'notes',
    ];

    public function requester()
    {
        return $this->belongsTo(Employee::class, 'requester_id');
    }

    public function target()
    {
        return $this->belongsTo(Employee::class, 'target_id');
    }

    public function requesterShift()
    {
        return $this->belongsTo(Shift::class, 'requester_shift_id');
    }

    public function targetShift()
    {
        return $this->belongsTo(Shift::class, 'target_shift_id');
    }

    public function targetApprovedBy()
    {
        return $this->belongsTo(User::class, 'target_approved_by');
    }

    public function hrdApprovedBy()
    {
        return $this->belongsTo(User::class, 'hrd_approved_by');
    }
}
