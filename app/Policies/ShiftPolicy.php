<?php

namespace App\Policies;

use App\Models\Shift;
use App\Models\User;

class ShiftPolicy
{
    public function viewAny(User $user)
    {
        return $user->hasPermissionTo('shift.view');
    }

    public function view(User $user, Shift $shift)
    {
        return $user->hasPermissionTo('shift.view');
    }

    public function create(User $user)
    {
        return $user->hasPermissionTo('shift.manage');
    }

    public function update(User $user, Shift $shift)
    {
        return $user->hasPermissionTo('shift.manage');
    }

    public function delete(User $user, Shift $shift)
    {
        return $user->hasPermissionTo('shift.manage');
    }
}
