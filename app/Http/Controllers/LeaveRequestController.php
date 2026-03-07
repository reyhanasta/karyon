<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeaveRequest;
use App\Http\Requests\UpdateLeaveRequest;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $status = $request->input('status');
        $search = $request->input('search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = LeaveRequest::with('employee');

        if ($user->hasRole('employee')) {
            $query->where('employee_id', $user->employee->id ?? 0);
        }

        $query->when($status, fn ($q) => $q->where('status', $status));

        $query->when($search, function ($q) use ($search) {
            $q->whereHas('employee', fn ($q2) => $q2->where('full_name', 'like', "%{$search}%"));
        });

        $query->when($dateFrom, fn ($q) => $q->where('start_date', '>=', $dateFrom));
        $query->when($dateTo, fn ($q) => $q->where('end_date', '<=', $dateTo));

        $leaveRequests = $query->latest()->paginate(10)->withQueryString();
        
        return Inertia::render('leave-requests/index', [
            'leaveRequests' => $leaveRequests,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $canCreateAny = $user->can('leave.create.any');

        // Admin/HRD creating on behalf of others
        if ($canCreateAny) {
            $employees = Employee::select('id', 'full_name')->orderBy('full_name')->get();

            return Inertia::render('leave-requests/create', [
                'employees' => $employees,
                'canCreateAny' => true,
            ]);
        }

        // Regular employee creating for self
        $employee = $user->employee;
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
            'canCreateAny' => false,
        ]);
    }

    public function store(StoreLeaveRequest $request)
    {
        $user = Auth::user();
        $validated = $request->validated();

        // Determine which employee this request is for
        if ($user->can('leave.create.any') && !empty($validated['employee_id'])) {
            $employee = Employee::findOrFail($validated['employee_id']);
        } else {
            $employee = $user->employee;
            if (!$employee) {
                return redirect()->back()->with('error', 'You must be registered as an employee to request leave.');
            }
        }

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        
        // Calculate weekdays or just simple diff in days + 1 for now (inclusive)
        $requestedDays = $start->diffInDays($end) + 1;

        // 1) Annual quota check
        if ($employee->leave_quota < $requestedDays) {
            return back()->withErrors([
                'end_date' => "Insufficient leave quota. Requested {$requestedDays} days, but only {$employee->leave_quota} left."
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
                    'end_date' => "Monthly limit exceeded for {$monthLabel}. Already {$alreadyUsed} days used/pending and requested {$days} more (max " . Employee::MONTHLY_LEAVE_LIMIT . " per month)."
                ]);
            }
        }

        DB::transaction(function () use ($employee, $validated) {
            LeaveRequest::create([
                'employee_id' => $employee->id,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'reason' => $validated['reason'],
                'status' => 'pending',
            ]);
        });

        return redirect()->route('leave-requests.index')->with('success', 'Leave request submitted successfully.');
    }

    public function edit(LeaveRequest $leaveRequest)
    {
        $this->authorize('update', $leaveRequest);

        $leaveRequest->load('employee');

        $employees = Employee::select('id', 'full_name')->orderBy('full_name')->get();

        return Inertia::render('leave-requests/edit', [
            'leaveRequest' => $leaveRequest,
            'employees' => $employees,
        ]);
    }

    public function update(UpdateLeaveRequest $request, LeaveRequest $leaveRequest)
    {
        if ($leaveRequest->status !== 'pending') {
            return back()->with('error', 'Only pending requests can be edited.');
        }

        $validated = $request->validated();

        $employee = Employee::findOrFail($validated['employee_id']);

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $requestedDays = $start->diffInDays($end) + 1;

        // Quota check (exclude current request from usage if employee changed or dates changed)
        $currentQuota = $employee->leave_quota;
        // If editing the same employee's request, add back the original days
        if ($leaveRequest->employee_id === $employee->id && $leaveRequest->status === 'pending') {
            // Pending requests haven't deducted quota yet, so no adjustment needed
        }

        if ($currentQuota < $requestedDays) {
            return back()->withErrors([
                'end_date' => "Insufficient leave quota. Requested {$requestedDays} days, but only {$currentQuota} left."
            ]);
        }

        DB::transaction(function () use ($leaveRequest, $validated) {
            $leaveRequest->update([
                'employee_id' => $validated['employee_id'],
                'start_date'  => $validated['start_date'],
                'end_date'    => $validated['end_date'],
                'reason'      => $validated['reason'],
            ]);
        });

        return redirect()->route('leave-requests.index')->with('success', 'Leave request updated successfully.');
    }

    public function updateStatus(Request $request, LeaveRequest $leaveRequest)
    {
        $this->authorize('updateStatus', $leaveRequest);

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        if ($leaveRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        DB::transaction(function () use ($leaveRequest, $validated) {
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
        });

        return redirect()->back()->with('success', 'Leave request status updated.');
    }
}
