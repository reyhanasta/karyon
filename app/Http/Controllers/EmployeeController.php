<?php

namespace App\Http\Controllers;

use App\Exports\EmployeeExport;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Imports\EmployeeImport;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Role;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $departmentId = $request->input('department_id');
        $positionId = $request->input('position_id');
        $roleName = $request->input('role');

        $employees = Employee::with(['user.roles', 'position', 'department'])
            ->when($search, function ($q) use ($search) {
                $q->where(function($q3) use ($search) {
                    $q3->where('full_name', 'like', "%{$search}%")
                      ->orWhereHas('user', fn ($q2) => $q2->where('nip', 'like', "%{$search}%"));
                });
            })
            ->when($departmentId, function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            })
            ->when($positionId, function ($q) use ($positionId) {
                $q->where('position_id', $positionId);
            })
            ->when($roleName, function ($q) use ($roleName) {
                $q->whereHas('user.roles', function ($q2) use ($roleName) {
                    $q2->where('name', $roleName);
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'filters' => [
                'search' => $search,
                'department_id' => $departmentId,
                'position_id' => $positionId,
                'role' => $roleName,
            ],
            'departments' => Department::all(['id', 'name']),
            'positions' => Position::all(['id', 'name']),
            'roles' => Role::all(['id', 'name']),
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

        DB::transaction(function () use ($validated) {
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
        });

        return redirect()->route('employees.index')->with('success', 'Employee created successfully.');
    }

    public function show(Employee $employee)
    {
        $employee->load(['user.roles', 'position', 'department']);
        
        $currentYear = now()->year;
        $monthlyUsage = $employee->getMonthlyLeaveUsage($currentYear);
        $usedThisMonth = $monthlyUsage[now()->format('Y-m')] ?? 0;
        
        // In this system, $employee->leave_quota represents the current REMAINING quota
        $remainingQuota = $employee->leave_quota ?? 0;
        $totalQuota = 12; // Default system total quota
        
        // Calculate total days used this year based on all the monthly usages
        $totalUsedThisYear = array_sum($monthlyUsage);

        return Inertia::render('employees/show', [
            'employee' => $employee,
            'leaveStats' => [
                'totalQuota' => $totalQuota,
                'usedThisYear' => $totalUsedThisYear,
                'remainingQuota' => $remainingQuota,
                'usedThisMonth' => $usedThisMonth,
                'monthlyLimit' => Employee::MONTHLY_LEAVE_LIMIT,
            ]
        ]);
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

        DB::transaction(function () use ($user, $employee, $validated) {
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
        });

        return redirect()->route('employees.index')->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        $this->authorize('delete', $employee);

        DB::transaction(function () use ($employee) {
            $employee->delete();
        });

        return redirect()->route('employees.index')->with('success', 'Employee deleted successfully.');
    }

    public function export(Request $request)
    {
        $format = $request->input('format', 'xlsx');
        $filename = 'employees_' . now()->format('Y-m-d');

        if ($format === 'csv') {
            return Excel::download(new EmployeeExport, $filename . '.csv', \Maatwebsite\Excel\Excel::CSV);
        }

        return Excel::download(new EmployeeExport, $filename . '.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv,xls|max:5120',
        ]);

        $import = new EmployeeImport;
        DB::transaction(function () use ($import, $request) {
            Excel::import($import, $request->file('file'));
        });

        $imported = $import->getImportedCount();
        $errors = $import->getErrors();

        if ($imported === 0 && count($errors) > 0) {
            return back()->with('error', 'Import failed. ' . implode(' | ', array_slice($errors, 0, 5)));
        }

        $message = "{$imported} employee(s) imported successfully.";
        if (count($errors) > 0) {
            $message .= ' ' . count($errors) . ' row(s) skipped.';
        }

        return back()->with('success', $message);
    }
}
