<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOvertimeRequest;
use App\Http\Requests\UpdateOvertimeRequest;
use App\Models\Employee;
use App\Models\OvertimeRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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

        if ($user->hasRole('employee')) {
            $query->where('employee_id', $user->employee->id ?? 0);
        }

        $query->when($status, fn ($q) => $q->where('status', $status));

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

        // Admin/HRD creating on behalf of others
        if ($canCreateAny) {
            $employees = Employee::select('id', 'full_name')->orderBy('full_name')->get();

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
            $employee = Employee::findOrFail($validated['employee_id']);
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

        DB::transaction(function () use ($employee, $validated) {
            OvertimeRequest::create([
                'employee_id' => $employee->id,
                'date' => $validated['date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'description' => $validated['description'],
                'status' => 'pending',
            ]);
        });

        return redirect()->route('overtime-requests.index')->with('success', 'Overtime request submitted successfully.');
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
        if ($overtimeRequest->status !== 'pending') {
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

        if ($overtimeRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        DB::transaction(function () use ($overtimeRequest, $validated) {
            $overtimeRequest->update(['status' => $validated['status']]);
        });

        return redirect()->back()->with('success', 'Overtime request status updated.');
    }
}
