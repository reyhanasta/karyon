<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'full_name' => fake()->name(),
            'position_id' => Position::factory(),
            'department_id' => Department::factory(),
            'employee_status' => fake()->randomElement(['orientasi', 'tidak_tetap', 'tetap', 'kontrak', 'keluar']),
            'join_date' => fake()->date(),
            'leave_quota' => 12,
        ];
    }
}
