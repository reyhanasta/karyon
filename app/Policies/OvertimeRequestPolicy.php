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
        return $user->can('overtime.approve');
    }
}
