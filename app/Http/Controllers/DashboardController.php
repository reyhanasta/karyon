<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $isManagerOrAdmin = $user->hasRole(['super-admin', 'hr-admin', 'manager']);

        if ($isManagerOrAdmin) {
            $stats = [
                'totalEmployees' => Employee::count(),
                'pendingLeaves' => LeaveRequest::where('status', 'pending')->count(),
                'pendingOvertime' => OvertimeRequest::where('status', 'pending')->count(),
                'approvedLeavesThisMonth' => LeaveRequest::where('status', 'approved')
                    ->whereMonth('updated_at', now()->month)
                    ->whereYear('updated_at', now()->year)
                    ->count(),
                'approvedOvertimeThisMonth' => OvertimeRequest::where('status', 'approved')
                    ->whereMonth('updated_at', now()->month)
                    ->whereYear('updated_at', now()->year)
                    ->count(),
            ];
        } else {
            $employee = $user->employee;
            $stats = [
                'leaveQuota' => $employee?->leave_quota ?? 0,
                'pendingLeaves' => $employee
                    ? LeaveRequest::where('employee_id', $employee->id)->where('status', 'pending')->count()
                    : 0,
                'approvedLeaves' => $employee
                    ? LeaveRequest::where('employee_id', $employee->id)->where('status', 'approved')->count()
                    : 0,
                'pendingOvertime' => $employee
                    ? OvertimeRequest::where('employee_id', $employee->id)->where('status', 'pending')->count()
                    : 0,
                'approvedOvertimeThisMonth' => $employee
                    ? OvertimeRequest::where('employee_id', $employee->id)
                        ->where('status', 'approved')
                        ->whereMonth('updated_at', now()->month)
                        ->whereYear('updated_at', now()->year)
                        ->count()
                    : 0,
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'isManagerOrAdmin' => $isManagerOrAdmin,
        ]);
    }
}
