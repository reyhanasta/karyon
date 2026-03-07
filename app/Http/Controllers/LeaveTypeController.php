<?php

namespace App\Http\Controllers;

use App\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveTypeController extends Controller
{
    public function index()
    {
        $leaveTypes = LeaveType::orderBy('name')->get();

        return Inertia::render('leave-types/index', [
            'leaveTypes' => $leaveTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:leave_types,name',
            'max_days_per_year' => 'required|integer|min:1',
            'is_paid' => 'boolean',
            'requires_attachment' => 'boolean',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:500',
        ]);

        LeaveType::create($validated);

        return redirect()->route('leave-types.index')
            ->with('success', 'Jenis cuti berhasil ditambahkan.');
    }

    public function update(Request $request, LeaveType $leaveType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:leave_types,name,' . $leaveType->id,
            'max_days_per_year' => 'required|integer|min:1',
            'is_paid' => 'boolean',
            'requires_attachment' => 'boolean',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:500',
        ]);

        $leaveType->update($validated);

        return redirect()->route('leave-types.index')
            ->with('success', 'Jenis cuti berhasil diperbarui.');
    }

    public function destroy(LeaveType $leaveType)
    {
        // Don't delete if there are leave requests using this type
        if ($leaveType->leaveRequests()->exists()) {
            return redirect()->route('leave-types.index')
                ->with('error', 'Jenis cuti tidak bisa dihapus karena masih digunakan. Nonaktifkan saja.');
        }

        $leaveType->delete();

        return redirect()->route('leave-types.index')
            ->with('success', 'Jenis cuti berhasil dihapus.');
    }
}
