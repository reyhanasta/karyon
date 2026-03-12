<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Shift::class);

        $shifts = Shift::with('department')->latest()->get();
        $departments = Department::all();

        return Inertia::render('shifts/index', [
            'shifts' => $shifts,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Shift::class);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'department_id' => 'nullable|exists:departments,id',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'is_active' => 'boolean',
        ]);

        Shift::create($validated);

        return redirect()->back()->with('success', 'Shift berhasil dibuat.');
    }

    public function update(Request $request, Shift $shift)
    {
        $this->authorize('update', $shift);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'department_id' => 'nullable|exists:departments,id',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'is_active' => 'boolean',
        ]);

        $shift->update($validated);

        return redirect()->back()->with('success', 'Shift berhasil diperbarui.');
    }

    public function destroy(Shift $shift)
    {
        $this->authorize('delete', $shift);

        // Check if there are associated assignments or change requests
        if ($shift->assignments()->exists()) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus shift yang sudah memiliki jadwal.');
        }

        $shift->delete();

        return redirect()->back()->with('success', 'Shift berhasil dihapus.');
    }
}
