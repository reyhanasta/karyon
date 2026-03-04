<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');

        $employees = Employee::with(['user.roles', 'position', 'department'])
            ->when($search, function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhereHas('position', fn ($q2) => $q2->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('department', fn ($q2) => $q2->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('user', fn ($q2) => $q2->where('nip', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        $positions = Position::all();
        $departments = Department::all();
        return Inertia::render('employees/create', [
            'roles' => $roles,
            'positions' => $positions,
            'departments' => $departments,
        ]);
    }

    public function store(StoreEmployeeRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'nip' => $validated['nip'] ?? null,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password'] ?? '12345678'),
        ]);

        $user->assignRole($validated['role']);

        Employee::create([
            'user_id' => $user->id,
            'full_name' => $validated['full_name'],
            'position_id' => $validated['position_id'],
            'department_id' => $validated['department_id'],
            'join_date' => $validated['join_date'],
            'leave_quota' => $validated['leave_quota'],
        ]);

        return redirect()->route('employees.index')->with('success', 'Employee created successfully.');
    }

    public function edit(Employee $employee)
    {
        $employee->load('user.roles');
        $roles = Role::all();
        $positions = Position::all();
        $departments = Department::all();
        
        return Inertia::render('employees/edit', [
            'employee' => $employee,
            'roles' => $roles,
            'positions' => $positions,
            'departments' => $departments,
        ]);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $user = $employee->user;
        $validated = $request->validated();

        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }
        
        $user->update([
            'nip' => $validated['nip'],
            'email' => $validated['email'],
        ]);

        $user->syncRoles([$validated['role']]);

        $employee->update([
            'full_name' => $validated['full_name'],
            'position_id' => $validated['position_id'],
            'department_id' => $validated['department_id'],
            'join_date' => $validated['join_date'],
            'leave_quota' => $validated['leave_quota'],
        ]);

        return redirect()->route('employees.index')->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        if (!Auth::user()->can('employee.delete')) {
            abort(403, 'Unauthorized action.');
        }
        // Deleting the user will cascade to delete the employee relation
        $employee->user->delete();

        return redirect()->route('employees.index')->with('success', 'Employee deleted successfully.');
    }
}
