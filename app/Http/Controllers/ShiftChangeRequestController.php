<?php

namespace App\Http\Controllers;

use App\Models\ShiftChangeRequest;
use App\Models\Employee;
use App\Models\User;
use App\Notifications\ShiftChangeRequestNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\ShiftChangeRequestsExport;

class ShiftChangeRequestController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status');
        $search = $request->input('search');

        $query = $this->getBaseQuery($status, $search);

        return Inertia::render('shift-change-requests/index', [
            'requests' => $query->paginate(15)->withQueryString(),
            'filters' => [
                'status' => $status,
                'search' => $search,
            ]
        ]);
    }

    private function getBaseQuery($status = null, $search = null)
    {
        $user = Auth::user();
        $query = ShiftChangeRequest::with([
            'requester', 'target', 'requesterShift', 'targetShift', 
            'targetApprovedBy', 'hrdApprovedBy', 'managerApprovedBy'
        ])->latest();

        if ($user->hasPermissionTo('shift-change.approve.manager') && !$user->hasAnyRole(['super-admin', 'hr-admin', 'director', 'karu', 'manager'])) {
            $managedDeptIds = $user->managedDepartments()->pluck('departments.id')->toArray();
            $query->whereHas('requester', function ($q) use ($managedDeptIds) {
                $q->whereIn('department_id', $managedDeptIds);
            });
        } elseif ($user->hasRole('employee') && !$user->hasAnyRole(['super-admin', 'hr-admin', 'director', 'karu', 'manager'])) {
            $query->where(function ($q) use ($user) {
                $q->where('requester_id', $user->employee->id ?? 0)
                  ->orWhere('target_id', $user->employee->id ?? 0);
            });
        }

        $query->when($status, function ($q) use ($status) {
            if ($status === 'pending') {
                $q->where('status', 'like', 'pending_%');
            } else {
                $q->where('status', $status);
            }
        });

        $query->when($search, function ($q) use ($search) {
            $q->whereHas('requester', fn ($q2) => $q2->where('full_name', 'like', "%{$search}%"))
              ->orWhereHas('target', fn ($q2) => $q2->where('full_name', 'like', "%{$search}%"));
        });

        return $query;
    }

    public function exportExcel(Request $request)
    {
        $requests = $this->getBaseQuery($request->status, $request->search)->get();
        return Excel::download(new ShiftChangeRequestsExport($requests), 'shift_change_requests_' . now()->format('YmdHis') . '.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $requests = $this->getBaseQuery($request->status, $request->search)->get();
        $pdf = Pdf::loadView('exports.shift-change-requests', compact('requests'));
        return $pdf->download('shift_change_requests_' . now()->format('YmdHis') . '.pdf');
    }

    public function create()
    {
        $user = Auth::user();
        $canCreateAny = $user->can('shift-change.create.any');
        
        // Fetch all potential shifts and employees for filtering on frontend
        $shifts = \App\Models\Shift::where('is_active', true)->get();

        // $employees = Employee::with(['department', 'position'])->orderBy('full_name')->get();

        $employee = $user->employee;
        $myFilteredShifts = collect();
        $myTargetEmployees = collect();

        if ($employee) {
            $myFilteredShifts = $shifts->where('department_id', $employee->department_id)->values();
            $myTargetEmployees = Employee::with(['department', 'position'])
                ->where('position_id', $employee->position_id)
                ->where('id', '!=', $employee->id)
                ->get();
        }

        if ($canCreateAny) {
            if ($user->hasRole(['super-admin', 'hr-admin'])) {
                $assignableEmployees = Employee::with(['department', 'position'])->orderBy('full_name')->get();
            } else {
                $managedDeptIds = $user->managedDepartments()->pluck('departments.id')->toArray();

                $assignableEmployees = Employee::with(['department', 'position'])
                    ->whereIn('department_id', $managedDeptIds)
                    ->where('id', '!=', $user->employee->id ?? 0)
                    ->orderBy('full_name')
                    ->get();
            }

            return Inertia::render('shift-change-requests/create', [
                'employees' => $assignableEmployees,
                'shifts' => $shifts,
                'myShifts' => $myFilteredShifts,
                'targetEmployees' => $myTargetEmployees->values(),
                'canCreateAny' => true,
            ]);
        }

        if (!$employee) {
            return redirect()->route('shift-change-requests.index')->with('error', 'Hanya karyawan yang dapat mengajukan tukar shift.');
        }

        return Inertia::render('shift-change-requests/create', [
            'shifts' => $myFilteredShifts,
            'myShifts' => $myFilteredShifts,
            'targetEmployees' => $myTargetEmployees->values(),
            'canCreateAny' => false,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $canCreateAny = $user->can('shift-change.create.any');

        $validated = $request->validate([
            'requester_id' => 'nullable|exists:employees,id',
            'request_date' => 'required|date',
            'requester_shift_id' => 'required|exists:shifts,id',
            'target_id' => 'required|exists:employees,id',
            'reason' => 'required|string|max:500',
        ]);

        if ($canCreateAny && !empty($validated['requester_id'])) {
            if (!$user->hasRole(['super-admin', 'hr-admin'])) {
                $managedDeptIds = $user->managedDepartments()->pluck('departments.id')->toArray();


                $requester = Employee::whereIn('department_id', $managedDeptIds)
                    ->where('id', '!=', $user->employee->id ?? 0)
                    ->findOrFail($validated['requester_id']);
            } else {
                $requester = Employee::findOrFail($validated['requester_id']);
            }
        } else {
            $requester = $user->employee;
            if (!$requester) {
                return redirect()->route('shift-change-requests.index')->with('error', 'Hanya karyawan yang dapat mengajukan penggantian shift.');
            }
        }

        $targetEmployee = Employee::findOrFail($validated['target_id']);

        // Prevent duplicate requests
        $existing = ShiftChangeRequest::where('requester_id', $requester->id)
            ->where('target_id', $targetEmployee->id)
            ->where('request_date', $validated['request_date'])
            ->whereIn('status', ['pending_manager', 'pending_hrd'])
            ->exists();

        if ($existing) {
            return back()->with('error', 'Permintaan penggantian shift untuk tanggal dan rekan tersebut sudah ada dan masih pending.');
        }

        $initialStatus = 'pending_manager';
        $managerApprovedBy = null;
        $managerApprovedAt = null;
        $notifyRole = 'manager';

        $requesterUser = $requester->user;
        if ($user->hasRole(['hr-admin', 'super-admin'])) {
            $initialStatus = 'pending_hrd';
            $notifyRole = 'hrd';
            $managerApprovedBy = $user->id;
            $managerApprovedAt = now();
        } elseif (($requesterUser && $requesterUser->hasRole(['karu', 'manager'])) || $user->hasRole(['karu', 'manager'])) {
            $initialStatus = 'pending_hrd';
            $notifyRole = 'hrd';
            $managerApprovedBy = $user->id;
            $managerApprovedAt = now();
        }

        $changeRequest = ShiftChangeRequest::create([
            'requester_id' => $requester->id,
            'target_id' => $targetEmployee->id,
            'request_date' => $validated['request_date'],
            'requester_shift_id' => $validated['requester_shift_id'],
            'target_shift_id' => null,
            'reason' => $validated['reason'],
            'status' => $initialStatus,
            'manager_approved_by' => $managerApprovedBy,
            'manager_approved_at' => $managerApprovedAt,
        ]);

        // Notify initial approvers
        if ($notifyRole === 'manager') {
            $approvers = $requester->department ? $requester->department->managers : collect();
        } else {
            $approvers = User::permission('shift-change.approve.hrd')->get();
        }

        foreach ($approvers as $approver) {
            $approver->notify(new ShiftChangeRequestNotification($changeRequest, $initialStatus));
        }

        return redirect()->route('shift-change-requests.index')->with('success', 'Permintaan penggantian shift berhasil dikirim.');
    }

    public function show(ShiftChangeRequest $shift_change_request)
    {
        $this->authorize('view', $shift_change_request);

        $shift_change_request->load([
            'requester.position', 'requester.department',
            'target.position', 'target.department',
            'requesterShift', 'targetShift', 
            'targetApprovedBy.employee', 'hrdApprovedBy.employee', 'managerApprovedBy.employee'
        ]);


        return Inertia::render('shift-change-requests/show', [
            'request' => $shift_change_request
        ]);
    }

    public function approveHrd(Request $request, ShiftChangeRequest $shift_change_request)
    {
        if (!Auth::user()->hasPermissionTo('shift-change.approve.hrd')) {
            abort(403);
        }

        $shift_change_request->update([
            'status' => 'approved',
            'hrd_approved_by' => Auth::id(),
            'hrd_approved_at' => now(),
        ]);
        
        // Notify both
        if ($shift_change_request->requester->user) {
            /** @var \App\Models\User $requesterUser */
            $requesterUser = $shift_change_request->requester->user;
            $requesterUser->notify(new ShiftChangeRequestNotification($shift_change_request, 'approved'));
        }
        if ($shift_change_request->target->user) {
            /** @var \App\Models\User $targetUser */
            $targetUser = $shift_change_request->target->user;
            $targetUser->notify(new ShiftChangeRequestNotification($shift_change_request, 'approved'));
        }

        return back()->with('success', 'Tukar shift disetujui oleh HRD.');
    }

    public function approveManager(Request $request, ShiftChangeRequest $shift_change_request)
    {
        $user = Auth::user();
        if (!$user->hasPermissionTo('shift-change.approve.manager')) {
            abort(403);
        }

        $requester = $shift_change_request->requester;
        if ($requester && !$user->hasAnyRole(['karu', 'manager']) && !$user->managedDepartments()->where('departments.id', $requester->department_id)->exists()) {
            abort(403, 'Anda bukan penanggung jawab departemen ini.');
        }

        $shift_change_request->update([
            'status' => 'pending_hrd',
            'manager_approved_by' => Auth::id(),
            'manager_approved_at' => now(),
        ]);

        // Notify HRD
        $hrAdmins = \App\Models\User::permission('shift-change.approve.hrd')->get();
        /** @var \App\Models\User $hr */
        foreach ($hrAdmins as $hr) {
            $hr->notify(new ShiftChangeRequestNotification($shift_change_request, 'pending_hrd'));
        }

        return back()->with('success', 'Tukar shift disetujui oleh Kepala Ruangan, menunggu persetujuan HRD.');
    }

    public function reject(Request $request, ShiftChangeRequest $shift_change_request)
    {
        $user = Auth::user();
        
        $isHrd = $user->hasPermissionTo('shift-change.approve.hrd');
        $isManager = $user->hasPermissionTo('shift-change.approve.manager');

        if (!$isHrd && !$isManager) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'notes' => 'required|string|max:500'
        ]);

        $updateData = [
            'status' => 'rejected',
            'notes' => $validated['notes']
        ];

        if ($isHrd && $shift_change_request->status === 'pending_hrd') {
            $updateData['hrd_approved_by'] = $user->id;
            $updateData['hrd_approved_at'] = now();
        } elseif ($isManager && $shift_change_request->status === 'pending_manager') {
            $updateData['manager_approved_by'] = $user->id;
            $updateData['manager_approved_at'] = now();
        }

        $shift_change_request->update($updateData);

        // Notify requester
        if ($shift_change_request->requester->user) {
            /** @var \App\Models\User $requesterUser */
            $requesterUser = $shift_change_request->requester->user;
            $requesterUser->notify(new ShiftChangeRequestNotification($shift_change_request, 'rejected'));
        }

        return back()->with('success', 'Permintaan tukar shift ditolak.');
    }
}
