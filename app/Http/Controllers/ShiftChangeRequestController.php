<?php

namespace App\Http\Controllers;

use App\Models\ShiftChangeRequest;
use App\Models\Employee;
use App\Notifications\ShiftChangeRequestNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ShiftChangeRequestController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $query = ShiftChangeRequest::with([
            'requester', 'target', 'requesterShift', 'targetShift', 
            'targetApprovedBy', 'hrdApprovedBy'
        ])->latest();

        if ($user->hasPermissionTo('shift-change.approve.manager') && !$user->hasRole(['super-admin', 'hr-admin', 'director'])) {
            $managedDeptIds = $user->managedDepartments()->pluck('departments.id')->toArray();
            $query->whereHas('requester', function ($q) use ($managedDeptIds) {
                $q->whereIn('department_id', $managedDeptIds);
            });
        } elseif ($user->hasRole('employee') && !$user->hasRole(['super-admin', 'hr-admin', 'director'])) {
            $query->where(function ($q) use ($user) {
                $q->where('requester_id', $user->employee->id ?? 0)
                  ->orWhere('target_id', $user->employee->id ?? 0);
            });
        }


        return Inertia::render('shift-change-requests/index', [
            'requests' => $query->paginate(15)
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $canCreateAny = $user->can('shift-change.create.any');
        
        // Fetch all potential shifts and employees for filtering on frontend
        $shifts = \App\Models\Shift::where('is_active', true)->get();
        $employees = Employee::with(['department', 'position'])->orderBy('full_name')->get();

        if ($canCreateAny) {
            if ($user->hasRole(['super-admin', 'hr-admin'])) {
                $employees = Employee::with(['department', 'position'])->orderBy('full_name')->get();
            } else {
                $employees = Employee::with(['department', 'position'])
                    ->where('department_id', $user->employee->department_id ?? null)
                    ->where('id', '!=', $user->employee->id ?? 0)
                    ->orderBy('full_name')
                    ->get();
            }
            return Inertia::render('shift-change-requests/create', [
                'employees' => $employees,
                'shifts' => $shifts,
                'canCreateAny' => true,
            ]);
        }

        $employee = $user->employee;
        if (!$employee) {
            return redirect()->route('shift-change-requests.index')->with('error', 'Hanya karyawan yang dapat mengajukan tukar shift.');
        }

        $filteredShifts = $shifts->where('department_id', $employee->department_id);
        $targetEmployees = $employees->where('department_id', $employee->department_id)
            ->where('id', '!=', $employee->id);

        return Inertia::render('shift-change-requests/create', [
            'shifts' => $filteredShifts->values(),
            'targetEmployees' => $targetEmployees->values(),
            'canCreateAny' => false,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $canCreateAny = $user->can('shift-change.create.any');

        $validated = $request->validate([
            'requester_id' => $canCreateAny ? 'required|exists:employees,id' : 'nullable',
            'request_date' => 'required|date',
            'requester_shift_id' => 'required|exists:shifts,id',
            'target_id' => 'required|exists:employees,id',
            'reason' => 'required|string|max:500',
        ]);

        if ($canCreateAny && !empty($validated['requester_id'])) {
            if (!$user->hasRole(['super-admin', 'hr-admin'])) {
                $requester = Employee::where('department_id', $user->employee->department_id ?? null)
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

        $changeRequest = ShiftChangeRequest::create([
            'requester_id' => $requester->id,
            'target_id' => $targetEmployee->id,
            'request_date' => $validated['request_date'],
            'requester_shift_id' => $validated['requester_shift_id'],
            'target_shift_id' => null,
            'reason' => $validated['reason'],
            'status' => 'pending_manager',
        ]);

        // Notify Manager
        $managers = $requester->department ? $requester->department->managers : collect();
        foreach ($managers as $manager) {
            $manager->notify(new ShiftChangeRequestNotification($changeRequest, 'pending_manager'));
        }

        return redirect()->route('shift-change-requests.index')->with('success', 'Permintaan penggantian shift berhasil dikirim.');
    }

    public function show(ShiftChangeRequest $shift_change_request)
    {
        $shift_change_request->load([
            'requester.position', 'target.position', 
            'requesterShift', 'targetShift', 
            'targetApprovedBy.employee', 'hrdApprovedBy.employee', 'managerApprovedBy.employee'
        ]);

        return Inertia::render('shift-change-requests/show', [
            'request' => $shift_change_request
        ]);
    }

    public function approveTarget(Request $request, ShiftChangeRequest $shift_change_request)
    {
        $user = Auth::user();

        if ($shift_change_request->target_id !== $user->employee->id && !$user->hasRole('hr-admin')) {
            abort(403, 'Unauthorized action.');
        }

        $shift_change_request->update([
            'status' => 'pending_manager',
            'target_approved_by' => $user->id,
            'target_approved_at' => now(),
        ]);
        
        // Notify Manager
        $managers = $shift_change_request->requester->department ? $shift_change_request->requester->department->managers : collect();
        foreach ($managers as $manager) {
            $manager->notify(new ShiftChangeRequestNotification($shift_change_request, 'pending_manager'));
        }

        return back()->with('success', 'Permintaan tukar shift disetujui, menunggu persetujuan Kepala Ruangan.');
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
        if ($requester && !$user->managedDepartments()->where('departments.id', $requester->department_id)->exists()) {
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
