<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeaveRequest;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $status = $request->get('status');

        $query = LeaveRequest::with('employee');

        if ($user->hasRole('employee')) {
            $query->where('employee_id', $user->employee->id ?? 0);
        }

        $query->when($status, fn ($q) => $q->where('status', $status));

        $leaveRequests = $query->latest()->paginate(10)->withQueryString();
        
        return Inertia::render('leave-requests/index', [
            'leaveRequests' => $leaveRequests,
            'filters' => ['status' => $status],
        ]);
    }

    public function create()
    {
        $employee = Auth::user()->employee;
        if (!$employee) {
            return redirect()->back()->with('error', 'You must be registered as an employee to request leave.');
        }

        $currentYear = now()->year;
        $currentMonth = now()->format('Y-m');
        $monthlyUsage = $employee->getMonthlyLeaveUsage($currentYear);

        return Inertia::render('leave-requests/create', [
            'leaveQuota'     => $employee->leave_quota,
            'monthlyLimit'   => Employee::MONTHLY_LEAVE_LIMIT,
            'monthlyUsage'   => $monthlyUsage,
            'currentMonth'   => $currentMonth,
            'monthlyRemaining' => Employee::MONTHLY_LEAVE_LIMIT - ($monthlyUsage[$currentMonth] ?? 0),
        ]);
    }

    public function store(StoreLeaveRequest $request)
    {
        $employee = Auth::user()->employee;

        if (!$employee) {
            return redirect()->back()->with('error', 'You must be registered as an employee to request leave.');
        }

        $validated = $request->validated();

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        
        // Calculate weekdays or just simple diff in days + 1 for now (inclusive)
        $requestedDays = $start->diffInDays($end) + 1;

        // 1) Annual quota check
        if ($employee->leave_quota < $requestedDays) {
            return back()->withErrors([
                'end_date' => "Insufficient leave quota. You requested {$requestedDays} days, but only have {$employee->leave_quota} left."
            ]);
        }

        // 2) Monthly cap check (max 5 days per calendar month)
        $requestByMonth = Employee::splitDaysByMonth($validated['start_date'], $validated['end_date']);
        $year = $start->year;
        $monthlyUsage = $employee->getMonthlyLeaveUsage($year);

        foreach ($requestByMonth as $month => $days) {
            $alreadyUsed = $monthlyUsage[$month] ?? 0;
            $remaining = Employee::MONTHLY_LEAVE_LIMIT - $alreadyUsed;
            
            if ($days > $remaining) {
                $monthLabel = Carbon::parse($month . '-01')->translatedFormat('F Y');
                return back()->withErrors([
                    'end_date' => "Monthly limit exceeded for {$monthLabel}. You already have {$alreadyUsed} days used/pending and requested {$days} more (max " . Employee::MONTHLY_LEAVE_LIMIT . " per month)."
                ]);
            }
        }

        LeaveRequest::create([
            'employee_id' => $employee->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return redirect()->route('leave-requests.index')->with('success', 'Leave request submitted successfully.');
    }

    public function updateStatus(Request $request, LeaveRequest $leaveRequest)
    {
        if (!Auth::user()->hasRole(['super-admin', 'hr-admin', 'manager'])) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        if ($leaveRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        $leaveRequest->update(['status' => $validated['status']]);

        // If approved, deduct quota
        if ($validated['status'] === 'approved') {
            $start = Carbon::parse($leaveRequest->start_date);
            $end = Carbon::parse($leaveRequest->end_date);
            $requestedDays = $start->diffInDays($end) + 1;
            
            $employee = $leaveRequest->employee;
            if ($employee->leave_quota >= $requestedDays) {
                $employee->decrement('leave_quota', $requestedDays);
            }
        }

        return redirect()->back()->with('success', 'Leave request status updated.');
    }
}
