<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PositionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');

        $positions = Position::withCount('employees')
            ->when($search, function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('positions/index', [
            'positions' => $positions,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:positions,name',
            'description' => 'nullable|string|max:500',
        ]);

        Position::create($validated);

        return redirect()->back()->with('success', 'Position created successfully.');
    }

    public function update(Request $request, Position $position)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:positions,name,' . $position->id,
            'description' => 'nullable|string|max:500',
        ]);

        $position->update($validated);

        return redirect()->back()->with('success', 'Position updated successfully.');
    }

    public function destroy(Position $position)
    {
        if ($position->employees()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete position with active employees.');
        }

        $position->delete();

        return redirect()->back()->with('success', 'Position deleted successfully.');
    }
}
