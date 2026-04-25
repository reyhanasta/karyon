<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $departments = Department::withCount('employees')
            ->with('managers')
            ->when($search, function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(8)
            ->withQueryString();

        $availableManagers = \App\Models\User::has('employee')
            ->with('employee:id,user_id,full_name')
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->employee->full_name ?? $user->email,
                ];
            });

        return Inertia::render('departments/index', [
            'departments' => $departments,
            'availableManagers' => $availableManagers,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string|max:500',
            'manager_ids' => 'nullable|array',
            'manager_ids.*' => 'exists:users,id',
        ]);

        DB::transaction(function () use ($validated) {
            $department = Department::create($validated);
            if (isset($validated['manager_ids'])) {
                $department->managers()->sync($validated['manager_ids']);
            }
        });

        return redirect()->back()->with('success', 'Department created successfully.');
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $department->id,
            'description' => 'nullable|string|max:500',
            'manager_ids' => 'nullable|array',
            'manager_ids.*' => 'exists:users,id',
        ]);

        DB::transaction(function () use ($department, $validated) {
            $department->update($validated);
            if (isset($validated['manager_ids'])) {
                $department->managers()->sync($validated['manager_ids']);
            }
        });

        return redirect()->back()->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department)
    {
        if ($department->employees()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete department with active employees.');
        }

        DB::transaction(function () use ($department) {
            $department->delete();
        });

        return redirect()->back()->with('success', 'Department deleted successfully.');
    }
}
