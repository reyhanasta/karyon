<?php

namespace App\Models;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    const MONTHLY_LEAVE_LIMIT = 5;

    protected $fillable = [
        'user_id',
        'full_name',
        'position_id',
        'department_id',
        'employee_sip',
        'employee_status',
        'join_date',
        'leave_quota',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function overtimeRequests()
    {
        return $this->hasMany(OvertimeRequest::class);
    }

    public function documents()
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function shiftAssignments()
    {
        return $this->hasMany(ShiftAssignment::class);
    }

    public function shiftChangeRequests()
    {
        return $this->hasMany(ShiftChangeRequest::class, 'requester_id');
    }

    public function targetedShiftChangeRequests()
    {
        return $this->hasMany(ShiftChangeRequest::class, 'target_id');
    }

    /**
     * Get monthly leave usage (approved + pending) for a given year.
     * Returns ['2026-01' => 3, '2026-03' => 5, ...].
     */
    public function getMonthlyLeaveUsage(int $year): array
    {
        $requests = $this->leaveRequests()
            ->whereIn('status', ['approved', 'pending'])
            ->where(function ($q) use ($year) {
                $q->whereYear('start_date', $year)
                  ->orWhereYear('end_date', $year);
            })->where('leave_type_id', 1)
            ->get(['start_date', 'end_date']);

        $usage = [];

        foreach ($requests as $request) {
            $start = Carbon::parse($request->start_date);
            $end = Carbon::parse($request->end_date);

            // Walk day by day, count each day in its respective month
            $period = CarbonPeriod::create($start, $end);
            foreach ($period as $day) {
                if ($day->year !== $year) {
                    continue;
                }
                $key = $day->format('Y-m');
                $usage[$key] = ($usage[$key] ?? 0) + 1;
            }
        }

        return $usage;
    }

    /**
     * Calculate how many days a date range contributes to each month.
     * Returns ['2026-01' => 3, '2026-02' => 2].
     */
    public static function splitDaysByMonth(string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $result = [];

        $period = CarbonPeriod::create($start, $end);
        foreach ($period as $day) {
            $key = $day->format('Y-m');
            $result[$key] = ($result[$key] ?? 0) + 1;
        }

        return $result;
    }
}
