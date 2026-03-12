<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use App\Models\ShiftAssignment;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ShiftAssignmentController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Shift::class);

        $month = $request->query('month', now()->format('Y-m'));
        $startOfMonth = Carbon::parse($month)->startOfMonth();
        $endOfMonth = Carbon::parse($month)->endOfMonth();

        $employees = Employee::with([
            'shiftAssignments' => function ($query) use ($startOfMonth, $endOfMonth) {
                $query->whereBetween('date', [$startOfMonth, $endOfMonth])
                      ->with('shift');
            },
            'position',
            'department'
        ])->get();

        $shifts = Shift::where('is_active', true)->get();

        return Inertia::render('shift-assignments/index', [
            'employees' => $employees,
            'shifts' => $shifts,
            'currentMonth' => $month,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Shift::class);

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'shift_id' => 'required|exists:shifts,id',
            'date' => 'required|date',
        ]);

        ShiftAssignment::updateOrCreate(
            ['employee_id' => $validated['employee_id'], 'date' => $validated['date']],
            ['shift_id' => $validated['shift_id']]
        );

        return redirect()->back()->with('success', 'Jadwal shift berhasil disimpan.');
    }

    public function bulkStore(Request $request)
    {
        $this->authorize('create', Shift::class);

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'shift_id' => 'required|exists:shifts,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);

        for ($date = clone $start; $date->lte($end); $date->addDay()) {
            ShiftAssignment::updateOrCreate(
                ['employee_id' => $validated['employee_id'], 'date' => $date->format('Y-m-d')],
                ['shift_id' => $validated['shift_id']]
            );
        }

        return redirect()->back()->with('success', 'Jadwal shift berulang berhasil disimpan.');
    }

    public function destroy(ShiftAssignment $assignment)
    {
        $this->authorize('delete', Shift::class);
        $assignment->delete();
        return redirect()->back()->with('success', 'Jadwal shift berhasil dihapus.');
    }
}
