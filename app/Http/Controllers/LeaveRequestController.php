<?php

namespace App\Http\Controllers;

use App\Exports\LeaveRequestExport;
use App\Http\Requests\StoreLeaveRequest;
use App\Http\Requests\UpdateLeaveRequest;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use App\Notifications\LeaveRequestNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class LeaveRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $status = $request->input('status');
        $search = $request->input('search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $leaveTypeId = $request->input('leave_type_id');

        $query = LeaveRequest::with(['employee', 'leaveType']);

        if ($user->can('leave.approve.manager') && !$user->hasRole(['super-admin', 'hr-admin', 'director'])) {
            $managedDeptIds = $user->managedDepartments()->pluck('departments.id')->toArray();
            $query->whereHas('employee', function ($q) use ($managedDeptIds) {
                $q->whereIn('department_id', $managedDeptIds);
            });
        } elseif ($user->hasRole('employee') && !$user->hasRole(['super-admin', 'hr-admin', 'director'])) {
            $query->where('employee_id', $user->employee->id ?? 0);
        }

        $query->when($status, function ($q) use ($status) {
            if ($status === 'pending') {
                $q->where('status', 'like', 'pending_%');
            } else {
                $q->where('status', $status);
            }
        });
        $query->when($leaveTypeId, fn ($q) => $q->where('leave_type_id', $leaveTypeId));

        $query->when($search, function ($q) use ($search) {
            $q->whereHas('employee', fn ($q2) => $q2->where('full_name', 'like', "%{$search}%"));
        });

        $query->when($dateFrom, fn ($q) => $q->where('start_date', '>=', $dateFrom));
        $query->when($dateTo, fn ($q) => $q->where('end_date', '<=', $dateTo));

        $leaveRequests = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('leave-requests/index', [
            'leaveRequests' => $leaveRequests,
            'leaveTypes' => LeaveType::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'status' => $status,
                'search' => $search,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'leave_type_id' => $leaveTypeId,
            ],
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $canCreateAny = $user->can('leave.create.any');
        $leaveTypes = LeaveType::active()->orderBy('name')->get();

        if ($canCreateAny) {
            if ($user->hasRole(['super-admin', 'hr-admin'])) {
                $employees = Employee::select('id', 'full_name')->orderBy('full_name')->get();
            } else {
                $managedDeptIds = $user->managedDepartments()->pluck('departments.id')->toArray();
                $ownDeptId = $user->employee->department_id ?? null;
                if ($ownDeptId && !in_array($ownDeptId, $managedDeptIds)) {
                    $managedDeptIds[] = $ownDeptId;
                }

                $employees = Employee::whereIn('department_id', $managedDeptIds)
                    ->where('id', '!=', $user->employee->id ?? 0)
                    ->select('id', 'full_name')
                    ->orderBy('full_name')
                    ->get();
            }

            return Inertia::render('leave-requests/create', [
                'employees' => $employees,
                'leaveTypes' => $leaveTypes,
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

        // Calculate per-type usage for the current year
        $typeUsage = $this->getLeaveTypeUsage($employee, $currentYear);

        return Inertia::render('leave-requests/create', [
            'leaveQuota'       => $employee->leave_quota,
            'monthlyLimit'     => Employee::MONTHLY_LEAVE_LIMIT,
            'monthlyUsage'     => $monthlyUsage,
            'currentMonth'     => $currentMonth,
            'monthlyRemaining' => Employee::MONTHLY_LEAVE_LIMIT - ($monthlyUsage[$currentMonth] ?? 0),
            'leaveTypes'       => $leaveTypes,
            'typeUsage'        => $typeUsage,
            'canCreateAny'     => false,
        ]);
    }

    public function store(StoreLeaveRequest $request)
    {
        $user = Auth::user();
        $validated = $request->validated();

        // Determine which employee this request is for
        if ($user->can('leave.create.any') && !empty($validated['employee_id'])) {
            if (!$user->hasRole(['super-admin', 'hr-admin'])) {
                $managedDeptIds = $user->managedDepartments()->pluck('departments.id')->toArray();
                $ownDeptId = $user->employee->department_id ?? null;
                if ($ownDeptId && !in_array($ownDeptId, $managedDeptIds)) {
                    $managedDeptIds[] = $ownDeptId;
                }

                $employee = Employee::whereIn('department_id', $managedDeptIds)
                    ->where('id', '!=', $user->employee->id ?? 0)
                    ->findOrFail($validated['employee_id']);
            } else {
                $employee = Employee::findOrFail($validated['employee_id']);
            }
        } else {
            $employee = $user->employee;
            if (!$employee) {
                return redirect()->back()->with('error', 'You must be registered as an employee to request leave.');
            }
        }

        $leaveType = LeaveType::findOrFail($validated['leave_type_id']);
        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $requestedDays = $start->diffInDays($end) + 1;

        // Per-type annual quota check
        if ($leaveType->max_days_per_year !== null) {
            $usedDaysForType = $this->getUsedDaysForType($employee, $leaveType->id, $start->year);
            $remainingForType = $leaveType->max_days_per_year - $usedDaysForType;

            if ($requestedDays > $remainingForType) {
                return back()->withErrors([
                    'end_date' => "Kuota {$leaveType->name} tidak cukup. Diajukan {$requestedDays} hari, sisa {$remainingForType} hari."
                ]);
            }
        }

        // Monthly cap check — only for "Cuti Tahunan" (ID check by name)
        if ($leaveType->name === 'Cuti Tahunan') {
            // Also check global leave_quota on employee
            if ($employee->leave_quota < $requestedDays) {
                return back()->withErrors([
                    'end_date' => "Kuota cuti tahunan tidak cukup. Diajukan {$requestedDays} hari, sisa {$employee->leave_quota} hari."
                ]);
            }

            $requestByMonth = Employee::splitDaysByMonth($validated['start_date'], $validated['end_date']);
            $year = $start->year;
            $monthlyUsage = $employee->getMonthlyLeaveUsage($year);

            foreach ($requestByMonth as $month => $days) {
                $alreadyUsed = $monthlyUsage[$month] ?? 0;
                $remaining = Employee::MONTHLY_LEAVE_LIMIT - $alreadyUsed;

                if ($days > $remaining) {
                    $monthLabel = Carbon::parse($month . '-01')->translatedFormat('F Y');
                    return back()->withErrors([
                        'end_date' => "Batas bulanan terlampaui untuk {$monthLabel}. Sudah {$alreadyUsed} hari digunakan/pending dan mengajukan {$days} hari lagi (maks " . Employee::MONTHLY_LEAVE_LIMIT . " per bulan)."
                    ]);
                }
            }
        }

        // Handle file upload
        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('leave-attachments', 'public');
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

        /** @var \App\Models\LeaveRequest $leaveRequest */
        $leaveRequest = null;
        DB::transaction(function () use ($employee, $validated, $leaveType, $attachmentPath, $initialStatus, &$leaveRequest) {
            $leaveRequest = LeaveRequest::create([
                'employee_id'   => $employee->id,
                'leave_type_id' => $leaveType->id,
                'start_date'    => $validated['start_date'],
                'end_date'      => $validated['end_date'],
                'reason'        => $validated['reason'],
                'attachment_path' => $attachmentPath,
                'status'        => $initialStatus,
            ]);
        });

        // Notify initial approvers
        if ($notifyRole === 'manager') {
            $approvers = $employee->department ? $employee->department->managers : collect();
        } else {
            $approvers = User::permission("leave.approve.{$notifyRole}")->get();
        }

        if ($approvers->isNotEmpty()) {
            Notification::send($approvers, new LeaveRequestNotification($leaveRequest, $employee, 'submitted'));
        }

        return redirect()->route('leave-requests.index')->with('success', 'Pengajuan cuti berhasil dikirim.');
    }

    public function show(LeaveRequest $leaveRequest)
    {
        $this->authorize('view', $leaveRequest); // Or handle authorization similarly to index/edit
        
        $leaveRequest->load(['employee.position', 'employee.department', 'leaveType', 'approver.employee', 'hrdApprover.employee', 'managerApprover.employee', 'directorApprover.employee']);

        $user = Auth::user();
        $canApprove = false;
        
        if ($leaveRequest->status === 'pending_manager' && $user->can('leave.approve.manager')) $canApprove = true;
        if ($leaveRequest->status === 'pending_hrd' && $user->can('leave.approve.hrd')) $canApprove = true;
        if ($leaveRequest->status === 'pending_director' && $user->can('leave.approve.director')) $canApprove = true;

        // Bypass: HRD can approve at any pending status
        if (str_starts_with($leaveRequest->status, 'pending_') && $user->can('leave.approve.hrd')) {
            $canApprove = true;
        }

        return Inertia::render('leave-requests/show', [
            'leaveRequest' => $leaveRequest,
            'canApprove' => $canApprove,
        ]);
    }

    public function edit(LeaveRequest $leaveRequest)
    {
        $this->authorize('update', $leaveRequest);

        $leaveRequest->load(['employee', 'leaveType']);

        $employees = Employee::select('id', 'full_name')->orderBy('full_name')->get();
        $leaveTypes = LeaveType::active()->orderBy('name')->get();

        return Inertia::render('leave-requests/edit', [
            'leaveRequest' => $leaveRequest,
            'employees' => $employees,
            'leaveTypes' => $leaveTypes,
        ]);
    }

    public function update(UpdateLeaveRequest $request, LeaveRequest $leaveRequest)
    {
        if (!str_starts_with($leaveRequest->status, 'pending')) {
            return back()->with('error', 'Only pending requests can be edited.');
        }

        $validated = $request->validated();

        $employee = Employee::findOrFail($validated['employee_id']);
        $leaveType = LeaveType::findOrFail($validated['leave_type_id']);

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $requestedDays = $start->diffInDays($end) + 1;

        // Per-type quota check (exclude current request from used count)
        if ($leaveType->max_days_per_year !== null) {
            $usedDaysForType = $this->getUsedDaysForType($employee, $leaveType->id, $start->year, $leaveRequest->id);
            $remainingForType = $leaveType->max_days_per_year - $usedDaysForType;

            if ($requestedDays > $remainingForType) {
                return back()->withErrors([
                    'end_date' => "Kuota {$leaveType->name} tidak cukup. Diajukan {$requestedDays} hari, sisa {$remainingForType} hari."
                ]);
            }
        }

        // Monthly cap check for Cuti Tahunan
        if ($leaveType->name === 'Cuti Tahunan') {
            $currentQuota = $employee->leave_quota;
            if ($currentQuota < $requestedDays) {
                return back()->withErrors([
                    'end_date' => "Kuota cuti tahunan tidak cukup. Diajukan {$requestedDays} hari, sisa {$currentQuota} hari."
                ]);
            }
        }

        // Handle file upload
        $attachmentPath = $leaveRequest->attachment_path;
        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($attachmentPath) {
                Storage::disk('public')->delete($attachmentPath);
            }
            $attachmentPath = $request->file('attachment')->store('leave-attachments', 'public');
        }

        DB::transaction(function () use ($leaveRequest, $validated, $leaveType, $attachmentPath) {
            $leaveRequest->update([
                'employee_id'   => $validated['employee_id'],
                'leave_type_id' => $leaveType->id,
                'start_date'    => $validated['start_date'],
                'end_date'      => $validated['end_date'],
                'reason'        => $validated['reason'],
                'attachment_path' => $attachmentPath,
            ]);
        });

        return redirect()->route('leave-requests.index')->with('success', 'Pengajuan cuti berhasil diperbarui.');
    }

    public function updateStatus(Request $request, LeaveRequest $leaveRequest)
    {
        $this->authorize('updateStatus', $leaveRequest);

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        if (!str_starts_with($leaveRequest->status, 'pending')) {
            return back()->with('error', 'This request has already been processed completely.');
        }

        $user = Auth::user();
        $nextStatus = null;
        $approveColumn = null;
        $approveAtColumn = null;
        $rolesToNotify = [];

        if ($leaveRequest->status === 'pending_manager') {
            if ($user->can('leave.approve.hrd')) {
                $nextStatus = 'approved';
                $approveColumn = 'hrd_approved_by';
                $approveAtColumn = 'hrd_approved_at';
            } elseif ($user->can('leave.approve.manager')) {
                $nextStatus = 'pending_hrd';
                $approveColumn = 'manager_approved_by';
                $approveAtColumn = 'manager_approved_at';
                $rolesToNotify = ['hrd'];
            } else {
                return back()->with('error', 'You do not have permission at this stage.');
            }
        } elseif ($leaveRequest->status === 'pending_hrd') {
            if (!$user->can('leave.approve.hrd')) return back()->with('error', 'You do not have permission at this stage.');
            $nextStatus = 'pending_director';
            $approveColumn = 'hrd_approved_by';
            $approveAtColumn = 'hrd_approved_at';
            $rolesToNotify = ['director'];
        } elseif ($leaveRequest->status === 'pending_director') {
            if ($user->can('leave.approve.hrd') || $user->can('leave.approve.director')) {
                $nextStatus = 'approved';
                $approveColumn = $user->can('leave.approve.director') ? 'director_approved_by' : 'hrd_approved_by';
                $approveAtColumn = $user->can('leave.approve.director') ? 'director_approved_at' : 'hrd_approved_at';
            } else {
                return back()->with('error', 'You do not have permission at this stage.');
            }
        }

        // If action was to reject, it immediately becomes rejected and halts
        if ($validated['status'] === 'rejected') {
            $nextStatus = 'rejected';
        }

        DB::transaction(function () use ($leaveRequest, $nextStatus, $approveColumn, $approveAtColumn) {
            $updateData = [
                'status' => $nextStatus,
                $approveColumn => Auth::id(),
                $approveAtColumn => now()
            ];

            if ($nextStatus === 'approved' || $nextStatus === 'rejected') {
                $updateData['approved_by'] = Auth::id(); // keeping legacy column for final state
            }
            
            $leaveRequest->update($updateData);

            // If fully approved and it's Cuti Tahunan, deduct quota
            if ($nextStatus === 'approved') {
                $leaveRequest->load('leaveType');
                if ($leaveRequest->leaveType && $leaveRequest->leaveType->name === 'Cuti Tahunan') {
                    $start = Carbon::parse($leaveRequest->start_date);
                    $end = Carbon::parse($leaveRequest->end_date);
                    $requestedDays = $start->diffInDays($end) + 1;

                    $employee = $leaveRequest->employee;
                    if ($employee->leave_quota >= $requestedDays) {
                        $employee->decrement('leave_quota', $requestedDays);
                    }
                }
            }
        });

        // Notify the employee about the status change
        $leaveRequest->load('employee');
        $employeeUser = $leaveRequest->employee->user;
        if ($employeeUser) {
            $employeeUser->notify(new LeaveRequestNotification(
                $leaveRequest,
                $leaveRequest->employee,
                $nextStatus
            ));
        }

        // Notify next approver in chain
        if (!empty($rolesToNotify)) {
            $nextApprovers = User::permission("leave.approve.{$rolesToNotify[0]}")->get();
            Notification::send($nextApprovers, new LeaveRequestNotification($leaveRequest, $leaveRequest->employee, 'submitted'));
        }

        return redirect()->back()->with('success', 'Status pengajuan cuti berhasil diperbarui.');
    }

    /**
     * Calculate total used days for a specific leave type in a given year.
     * Excludes a specific request ID if provided (for edit scenarios).
     */
    private function getUsedDaysForType(Employee $employee, int $leaveTypeId, int $year, ?int $excludeId = null): int
    {
        $query = $employee->leaveRequests()
            ->where('leave_type_id', $leaveTypeId)
            ->whereIn('status', ['approved', 'pending_hrd', 'pending_manager', 'pending_director'])
            ->where(function ($q) use ($year) {
                $q->whereYear('start_date', $year)
                  ->orWhereYear('end_date', $year);
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $totalDays = 0;
        foreach ($query->get(['start_date', 'end_date']) as $req) {
            $totalDays += Carbon::parse($req->start_date)->diffInDays(Carbon::parse($req->end_date)) + 1;
        }

        return $totalDays;
    }

    /**
     * Get per-type usage summary for an employee in a given year.
     * Returns array: [leave_type_id => ['used' => X, 'max' => Y, 'remaining' => Z]]
     */
    private function getLeaveTypeUsage(Employee $employee, int $year): array
    {
        $leaveTypes = LeaveType::active()->get();
        $usage = [];

        foreach ($leaveTypes as $type) {
            $used = $this->getUsedDaysForType($employee, $type->id, $year);
            $usage[$type->id] = [
                'used' => $used,
                'max' => $type->max_days_per_year,
                'remaining' => $type->max_days_per_year !== null ? $type->max_days_per_year - $used : null,
            ];
        }

        return $usage;
    }

    public function export(Request $request)
    {
        $format = $request->input('format', 'xlsx');
        $filename = 'leave_requests_' . now()->format('Y-m-d');

        $filters = $request->only(['status', 'search', 'date_from', 'date_to', 'leave_type_id']);

        if ($format === 'csv') {
            return Excel::download(new LeaveRequestExport($filters), $filename . '.csv', \Maatwebsite\Excel\Excel::CSV);
        }

        return Excel::download(new LeaveRequestExport($filters), $filename . '.xlsx');
    }
}
