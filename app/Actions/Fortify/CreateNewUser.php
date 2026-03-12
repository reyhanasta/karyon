<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'full_name'     => ['required', 'string', 'max:255'],
            'email'         => $this->emailRules(),
            'password'      => $this->passwordRules(),
            'department_id' => ['required', 'exists:departments,id'],
            'position_id'   => ['required', 'exists:positions,id'],
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'nip'      => null,
                'email'    => $input['email'],
                'password' => $input['password'],
            ]);

            // Assign default employee role
            $user->assignRole('employee');

            // Create associated employee record
            Employee::create([
                'user_id'       => $user->id,
                'full_name'     => $input['full_name'],
                'department_id' => $input['department_id'],
                'position_id'   => $input['position_id'],
                'join_date'     => now()->toDateString(),
                'leave_quota'   => 12,
            ]);

            return $user;
        });
    }
}
