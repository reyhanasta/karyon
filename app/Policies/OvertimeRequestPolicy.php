<?php

namespace App\Policies;

use App\Models\OvertimeRequest;
use App\Models\User;

class OvertimeRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('overtime-request.view');
    }

    public function view(User $user, OvertimeRequest $overtimeRequest): bool
    {
        if ($user->can('overtime-request.approve.hrd') || $user->hasAnyRole(['karu', 'manager'])) {
            return true;
        }

        return $user->employee && $user->employee->id === $overtimeRequest->employee_id;
    }

    public function create(User $user): bool
    {
        return $user->can('overtime-request.create') || $user->can('overtime-request.create.any');
    }

    public function update(User $user, OvertimeRequest $overtimeRequest): bool
    {
        return $user->can('overtime-request.edit');
    }

    public function updateStatus(User $user, OvertimeRequest $overtimeRequest): bool
    {
        if ($user->can('overtime-request.approve.hrd') || $user->hasAnyRole(['karu', 'manager'])) {
            return true;
        }

        return false;
    }
}
