<?php

namespace App\Http\Controllers;

use App\Exports\OvertimeRequestExport;
use App\Http\Requests\StoreOvertimeRequest;
use App\Http\Requests\UpdateOvertimeRequest;
use App\Models\Employee;
use App\Models\OvertimeRequest;
use App\Models\User;
use App\Notifications\OvertimeRequestNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class OvertimeRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $status = $request->input('status');
        $search = $request->input('search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = OvertimeRequest::with('employee');

        if ($user->can('overtime.approve.manager') && !$user->hasRole(['super-admin', 'hr-admin'])) {
            $managedDeptIds = $user->managedDepartments()->pluck('departments.id')->toArray();
            $query->whereHas('employee', function ($q) use ($managedDeptIds) {
                $q->whereIn('department_id', $managedDeptIds);
            });
        } elseif ($user->hasRole('employee') && !$user->hasRole(['super-admin', 'hr-admin'])) {
            $query->where('employee_id', $user->employee->id ?? 0);
        }

        $query->when($status, function ($q) use ($status) {
            if ($status === 'pending') {
                $q->where('status', 'like', 'pending_%');
            } else {
                $q->where('status', $status);
            }
        });

        $query->when($search, function ($q) use ($search) {
            $q->whereHas('employee', fn ($q2) => $q2->where('full_name', 'like', "%{$search}%"));
        });

        $query->when($dateFrom, fn ($q) => $q->where('date', '>=', $dateFrom));
        $query->when($dateTo, fn ($q) => $q->where('date', '<=', $dateTo));

        $overtimeRequests = $query->orderBy('date', 'desc')->paginate(10)->withQueryString();
        
        return Inertia::render('overtime-requests/index', [
            'overtimeRequests' => $overtimeRequests,
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
        $canCreateAny = $user->can('overtime.create.any');

        if ($canCreateAny) {
            if ($user->hasRole(['super-admin', 'hr-admin'])) {
                $employees = Employee::select('id', 'full_name')->orderBy('full_name')->get();
            } else {
                $employees = Employee::where('department_id', $user->employee->department_id ?? null)
                    ->where('id', '!=', $user->employee->id ?? 0)
                    ->select('id', 'full_name')
                    ->orderBy('full_name')
                    ->get();
            }

            return Inertia::render('overtime-requests/create', [
                'employees' => $employees,
                'canCreateAny' => true,
            ]);
        }

        // Regular employee creating for self
        $employee = $user->employee;
        if (!$employee) {
            return redirect()->back()->with('error', 'You must be registered as an employee to request overtime.');
        }

        return Inertia::render('overtime-requests/create', [
            'canCreateAny' => false,
        ]);
    }

    public function store(StoreOvertimeRequest $request)
    {
        $user = Auth::user();
        $validated = $request->validated();

        // Determine which employee this request is for
        if ($user->can('overtime.create.any') && !empty($validated['employee_id'])) {
            if (!$user->hasRole(['super-admin', 'hr-admin'])) {
                $employee = Employee::where('department_id', $user->employee->department_id ?? null)
                    ->where('id', '!=', $user->employee->id ?? 0)
                    ->findOrFail($validated['employee_id']);
            } else {
                $employee = Employee::findOrFail($validated['employee_id']);
            }
        } else {
            $employee = $user->employee;
            if (!$employee) {
                return redirect()->back()->with('error', 'You must be registered as an employee to request overtime.');
            }
        }

        $exists = OvertimeRequest::where('employee_id', $employee->id)
            ->where('date', $validated['date'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'date' => 'This employee already has an overtime request for this date.'
            ]);
        }

        $initialStatus = 'pending_manager';
        $notifyRole = 'manager';

        $employeeUser = $employee->user;
        if ($user->hasRole(['hr-admin', 'super-admin'])) {
            $initialStatus = 'pending_hrd';
            $notifyRole = 'hrd';
        } elseif (($employeeUser && $employeeUser->hasRole(['karu', 'manager'])) || $user->hasRole(['karu', 'manager'])) {
            $initialStatus = 'pending_hrd';
            $notifyRole = 'hrd';
        }

        /** @var \App\Models\OvertimeRequest $overtimeRequest */
        $overtimeRequest = null;
        DB::transaction(function () use ($employee, $validated, $initialStatus, &$overtimeRequest) {
            $overtimeRequest = OvertimeRequest::create([
                'employee_id' => $employee->id,
                'date' => $validated['date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'description' => $validated['description'],
                'status' => $initialStatus,
            ]);
        });

        // Notify initial approvers
        if ($notifyRole === 'manager') {
            $approvers = $employee->department ? $employee->department->managers : collect();
        } else {
            $approvers = User::permission("overtime.approve.{$notifyRole}")->get();
        }

        if ($approvers->isNotEmpty()) {
            Notification::send($approvers, new OvertimeRequestNotification($overtimeRequest, $employee, 'submitted'));
        }

        return redirect()->route('overtime-requests.index')->with('success', 'Overtime request submitted successfully.');
    }

    public function show(OvertimeRequest $overtimeRequest)
    {
        $this->authorize('view', $overtimeRequest);

        $overtimeRequest->load(['employee.position', 'employee.department', 'approver.employee', 'hrdApprover.employee', 'managerApprover.employee']);

        $user = Auth::user();
        $canApprove = false;
        if ($overtimeRequest->status === 'pending_manager' && $user->can('overtime.approve.manager')) $canApprove = true;
        if ($overtimeRequest->status === 'pending_hrd' && $user->can('overtime.approve.hrd')) $canApprove = true;

        // Bypass: HRD can approve at any pending status
        if (str_starts_with($overtimeRequest->status, 'pending_') && $user->can('overtime.approve.hrd')) {
            $canApprove = true;
        }

        return Inertia::render('overtime-requests/show', [
            'overtimeRequest' => $overtimeRequest,
            'canApprove' => $canApprove,
        ]);
    }

    public function edit(OvertimeRequest $overtimeRequest)
    {
        $this->authorize('update', $overtimeRequest);

        $overtimeRequest->load('employee');

        $employees = Employee::select('id', 'full_name')->orderBy('full_name')->get();

        return Inertia::render('overtime-requests/edit', [
            'overtimeRequest' => $overtimeRequest,
            'employees' => $employees,
        ]);
    }

    public function update(UpdateOvertimeRequest $request, OvertimeRequest $overtimeRequest)
    {
        if (!str_starts_with($overtimeRequest->status, 'pending')) {
            return back()->with('error', 'Only pending requests can be edited.');
        }

        $validated = $request->validated();

        $employee = Employee::findOrFail($validated['employee_id']);

        // Check duplicates (exclude current request)
        $exists = OvertimeRequest::where('employee_id', $employee->id)
            ->where('date', $validated['date'])
            ->where('id', '!=', $overtimeRequest->id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'date' => 'This employee already has an overtime request for this date.'
            ]);
        }

        DB::transaction(function () use ($overtimeRequest, $validated) {
            $overtimeRequest->update([
                'employee_id' => $validated['employee_id'],
                'date'        => $validated['date'],
                'start_time'  => $validated['start_time'],
                'end_time'    => $validated['end_time'],
                'description' => $validated['description'],
            ]);
        });

        return redirect()->route('overtime-requests.index')->with('success', 'Overtime request updated successfully.');
    }

    public function updateStatus(Request $request, OvertimeRequest $overtimeRequest)
    {
        $this->authorize('updateStatus', $overtimeRequest);

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        if (!str_starts_with($overtimeRequest->status, 'pending')) {
            return back()->with('error', 'This request has already been processed completely.');
        }

        $user = Auth::user();
        $nextStatus = null;
        $approveColumn = null;
        $approveAtColumn = null;
        $rolesToNotify = [];

        if ($overtimeRequest->status === 'pending_manager') {
            if ($user->can('overtime.approve.hrd')) {
                $nextStatus = 'approved';
                $approveColumn = 'hrd_approved_by';
                $approveAtColumn = 'hrd_approved_at';
            } elseif ($user->can('overtime.approve.manager')) {
                $nextStatus = 'pending_hrd';
                $approveColumn = 'manager_approved_by';
                $approveAtColumn = 'manager_approved_at';
                $rolesToNotify = ['hrd'];
            } else {
                return back()->with('error', 'You do not have permission at this stage.');
            }
        } elseif ($overtimeRequest->status === 'pending_hrd') {
            if (!$user->can('overtime.approve.hrd')) return back()->with('error', 'You do not have permission at this stage.');
            $nextStatus = 'approved';
            $approveColumn = 'hrd_approved_by';
            $approveAtColumn = 'hrd_approved_at';
            $rolesToNotify = [];
        }

        // If action was to reject, it immediately becomes rejected and halts
        if ($validated['status'] === 'rejected') {
            $nextStatus = 'rejected';
        }

        DB::transaction(function () use ($overtimeRequest, $nextStatus, $approveColumn, $approveAtColumn) {
            $updateData = [
                'status' => $nextStatus,
                $approveColumn => Auth::id(),
                $approveAtColumn => now()
            ];

            if ($nextStatus === 'approved' || $nextStatus === 'rejected') {
                $updateData['approved_by'] = Auth::id(); // keeping legacy column for final state
            }
            
            $overtimeRequest->update($updateData);
        });

        // Notify the employee about the status change
        $overtimeRequest->load('employee');
        $employeeUser = $overtimeRequest->employee->user;
        if ($employeeUser) {
            $employeeUser->notify(new OvertimeRequestNotification(
                $overtimeRequest,
                $overtimeRequest->employee,
                $nextStatus
            ));
        }

        // Notify next approver in chain
        if (!empty($rolesToNotify)) {
            $nextApprovers = User::permission("overtime.approve.{$rolesToNotify[0]}")->get();
            Notification::send($nextApprovers, new OvertimeRequestNotification($overtimeRequest, $overtimeRequest->employee, 'submitted'));
        }

        return redirect()->back()->with('success', 'Overtime request status updated.');
    }

    public function export(Request $request)
    {
        $format = $request->input('format', 'xlsx');
        $filename = 'overtime_requests_' . now()->format('Y-m-d');

        $filters = $request->only(['status', 'search', 'date_from', 'date_to']);

        if ($format === 'csv') {
            return Excel::download(new OvertimeRequestExport($filters), $filename . '.csv', \Maatwebsite\Excel\Excel::CSV);
        }

        return Excel::download(new OvertimeRequestExport($filters), $filename . '.xlsx');
    }
}
