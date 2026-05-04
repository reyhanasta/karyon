<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;

class LeaveRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('leave-request.view');
    }

    public function view(User $user, LeaveRequest $leaveRequest): bool
    {
        if ($user->can('leave-request.approve.hrd') || $user->can('leave-request.approve.director') || $user->hasAnyRole(['karu', 'manager'])) {
            return true;
        }

        return $user->employee && $user->employee->id === $leaveRequest->employee_id;
    }

    public function create(User $user): bool
    {
        return $user->can('leave-request.create') || $user->can('leave-request.create.any');
    }

    public function update(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->can('leave-request.edit');
    }

    public function updateStatus(User $user, LeaveRequest $leaveRequest): bool
    {
        if ($user->can('leave-request.approve.hrd') || $user->can('leave-request.approve.director') || $user->hasAnyRole(['karu', 'manager'])) {
            return true;
        }

        return false;
    }
}
