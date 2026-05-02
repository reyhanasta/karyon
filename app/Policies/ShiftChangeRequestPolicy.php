<?php

namespace App\Policies;

use App\Models\ShiftChangeRequest;
use App\Models\User;

class ShiftChangeRequestPolicy
{
    public function view(User $user, ShiftChangeRequest $shiftChangeRequest): bool
    {
        if ($user->can('shift-change.approve.hrd') || $user->can('shift-change.approve.manager')) {
            return true;
        }

        if (!$user->employee) {
            return false;
        }

        return $user->employee->id === $shiftChangeRequest->requester_id || 
               $user->employee->id === $shiftChangeRequest->target_id;
    }
    public function update(User $user, ShiftChangeRequest $shiftChangeRequest): bool
    {
        if ($user->can('shift-change.edit')) {
            return true;
        }
        return $user->employee->id === $shiftChangeRequest->requester_id;
    }
    public function cancel(User $user, ShiftChangeRequest $shiftChangeRequest): bool
    {
        if ($user->can('shift-change.edit')) {
            return true;
        }
        return $user->employee->id === $shiftChangeRequest->requester_id;
    }
}
