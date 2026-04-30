<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;

class LeaveRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('leave.view');
    }

    public function view(User $user, LeaveRequest $leaveRequest): bool
    {
        if ($user->can('leave.approve.hrd') || $user->can('leave.approve.director') || $user->hasAnyRole(['karu', 'manager'])) {
            return true;
        }

        return $user->employee && $user->employee->id === $leaveRequest->employee_id;
    }

    public function create(User $user): bool
    {
        return $user->can('leave.create') || $user->can('leave.create.any');
    }

    public function update(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->can('leave.edit');
    }

    public function updateStatus(User $user, LeaveRequest $leaveRequest): bool
    {
        if ($user->can('leave.approve.hrd') || $user->can('leave.approve.director') || $user->hasAnyRole(['karu', 'manager'])) {
            return true;
        }

        return false;
    }
}
