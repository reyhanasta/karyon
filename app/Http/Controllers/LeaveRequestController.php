<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeaveRequest;
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
            'isManagerOrAdmin' => $user->hasRole(['super-admin', 'hr-admin', 'manager']),
            'filters' => ['status' => $status],
        ]);
    }

    public function create()
    {
        $employee = Auth::user()->employee;
        if (!$employee) {
            return redirect()->back()->with('error', 'You must be registered as an employee to request leave.');
        }

        return Inertia::render('leave-requests/create', [
            'leaveQuota' => $employee->leave_quota
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

        if ($employee->leave_quota < $requestedDays) {
            return back()->withErrors([
                'end_date' => "Insufficient leave quota. You requested {$requestedDays} days, but only have {$employee->leave_quota} left."
            ]);
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
