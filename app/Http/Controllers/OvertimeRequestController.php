<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOvertimeRequest;
use App\Models\OvertimeRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OvertimeRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $status = $request->get('status');

        $query = OvertimeRequest::with('employee');

        if ($user->hasRole('employee')) {
            $query->where('employee_id', $user->employee->id ?? 0);
        }

        $query->when($status, fn ($q) => $q->where('status', $status));

        $overtimeRequests = $query->orderBy('date', 'desc')->paginate(10)->withQueryString();
        
        return Inertia::render('overtime-requests/index', [
            'overtimeRequests' => $overtimeRequests,
            'filters' => ['status' => $status],
        ]);
    }

    public function create()
    {
        $employee = Auth::user()->employee;
        if (!$employee) {
            return redirect()->back()->with('error', 'You must be registered as an employee to request overtime.');
        }

        return Inertia::render('overtime-requests/create');
    }

    public function store(StoreOvertimeRequest $request)
    {
        $employee = Auth::user()->employee;

        if (!$employee) {
            return redirect()->back()->with('error', 'You must be registered as an employee to request overtime.');
        }

        $validated = $request->validated();

        $exists = OvertimeRequest::where('employee_id', $employee->id)
            ->where('date', $validated['date'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'date' => 'You already have an overtime request for this date.'
            ]);
        }

        OvertimeRequest::create([
            'employee_id' => $employee->id,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'description' => $validated['description'],
            'status' => 'pending',
        ]);

        return redirect()->route('overtime-requests.index')->with('success', 'Overtime request submitted successfully.');
    }

    public function updateStatus(Request $request, OvertimeRequest $overtimeRequest)
    {
        if (!Auth::user()->hasRole(['super-admin', 'hr-admin', 'manager'])) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        if ($overtimeRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        $overtimeRequest->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Overtime request status updated.');
    }
}
