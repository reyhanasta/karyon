<?php

namespace App\Policies;

use App\Models\OvertimeRequest;
use App\Models\User;

class OvertimeRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('overtime.view');
    }

    public function view(User $user, OvertimeRequest $overtimeRequest): bool
    {
        if ($user->can('overtime.approve.hrd')) {
            return true;
        }

        if ($user->can('overtime.approve.manager')) {
            $emp = $overtimeRequest->employee;
            if ($emp && $user->managedDepartments()->where('departments.id', $emp->department_id)->exists()) {
                return true;
            }
        }

        return $user->employee && $user->employee->id === $overtimeRequest->employee_id;
    }

    public function create(User $user): bool
    {
        return $user->can('overtime.create') || $user->can('overtime.create.any');
    }

    public function update(User $user, OvertimeRequest $overtimeRequest): bool
    {
        return $user->can('overtime.edit');
    }

    public function updateStatus(User $user, OvertimeRequest $overtimeRequest): bool
    {
        if ($user->can('overtime.approve.hrd')) {
            return true;
        }

        if ($user->can('overtime.approve.manager')) {
            $emp = $overtimeRequest->employee;
            return $emp && $user->managedDepartments()->where('departments.id', $emp->department_id)->exists();
        }

        return false;
    }
}
