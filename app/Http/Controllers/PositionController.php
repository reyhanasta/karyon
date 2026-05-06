<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PositionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $positions = Position::with(['department'])
            ->withCount('employees')
            ->when($search, function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(8)
            ->withQueryString();

        $departments = Department::orderBy('name')->get(['id', 'name']);

        return Inertia::render('positions/index', [
            'positions' => $positions,
            'departments' => $departments,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('positions')->where('department_id', $request->department_id),
            ],
            'description' => 'nullable|string|max:500',
            'department_id' => 'required|exists:departments,id',
        ]);

        DB::transaction(function () use ($validated) {
            Position::create($validated);
        });

        return redirect()->back()->with('success', 'Position created successfully.');
    }

    public function update(Request $request, Position $position)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('positions')->where('department_id', $request->department_id)->ignore($position->id),
            ],
            'description' => 'nullable|string|max:500',
            'department_id' => 'required|exists:departments,id',
        ]);

        DB::transaction(function () use ($position, $validated) {
            $position->update($validated);
        });

        return redirect()->back()->with('success', 'Position updated successfully.');
    }

    public function destroy(Position $position)
    {
        if ($position->employees()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete position with active employees.');
        }

        DB::transaction(function () use ($position) {
            $position->delete();
        });

        return redirect()->back()->with('success', 'Position deleted successfully.');
    }
}
