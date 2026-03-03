<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
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
            'nip'      => ['required', 'string', 'max:20', 'unique:users,nip'],
            'email'    => $this->emailRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return User::create([
            'nip'      => $input['nip'],
            'email'    => $input['email'],
            'password' => $input['password'],
        ]);
    }
}
