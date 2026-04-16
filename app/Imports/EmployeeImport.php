<?php

namespace App\Imports;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Spatie\Permission\Models\Role;

class EmployeeImport implements ToCollection, WithHeadingRow
{
    protected int $importedCount = 0;
    protected array $errors = [];

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // +2 because heading row is 1

            // Skip completely empty rows
            if (!isset($row['full_name']) && !isset($row['email'])) {
                continue;
            }

            // Manual validation
            $validator = Validator::make($row->toArray(), [
                'full_name' => 'required|string',
                'email' => 'required|email',
            ]);

            if ($validator->fails()) {
                $errorMsg = implode(', ', $validator->errors()->all());
                $this->errors[] = "Row {$rowNumber}: {$errorMsg}";
                continue;
            }

            try {
                // Look up position & department by name
                $position = !empty($row['position'])
                    ? Position::whereRaw('LOWER(name) = ?', [strtolower(trim($row['position']))])->first()
                    : null;

                $department = !empty($row['department'])
                    ? Department::whereRaw('LOWER(name) = ?', [strtolower(trim($row['department']))])->first()
                    : null;

                // Look up role
                $roleName = !empty($row['role']) ? trim($row['role']) : 'employee';
                $role = Role::where('name', $roleName)->first();
                if (!$role) {
                    $roleName = 'employee';
                }

                // Check for duplicate email/NIP
                $email = trim($row['email']);
                if (User::where('email', $email)->exists()) {
                    $this->errors[] = "Row {$rowNumber}: Email '{$email}' already exists, skipped.";
                    continue;
                }

                $nip = !empty($row['nip']) ? trim($row['nip']) : null;
                if ($nip && User::where('nip', $nip)->exists()) {
                    $this->errors[] = "Row {$rowNumber}: NIP '{$nip}' already exists, skipped.";
                    continue;
                }

                // Create user
                $user = User::create([
                    'nip' => $nip,
                    'email' => $email,
                    'password' => Hash::make('12345678'),
                ]);

                $user->assignRole($roleName);

                // Handle join date (Excel might send a string or a serialized date int)
                $joinDate = null;
                if (!empty($row['join_date'])) {
                    if (is_numeric($row['join_date'])) {
                        $joinDate = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($row['join_date'])->format('Y-m-d');
                    } else {
                        $joinDate = $row['join_date']; // assuming it's already Y-m-d
                    }
                }

                // Standardize the status values
                $allowedStatuses = ['orientasi', 'tidak_tetap', 'tetap', 'keluar'];
                $status = !empty($row['status']) ? strtolower(trim($row['status'])) : 'orientasi';
                if (!in_array($status, $allowedStatuses)) {
                    $status = 'orientasi';
                }

                // Create employee
                Employee::create([
                    'user_id' => $user->id,
                    'full_name' => trim($row['full_name']),
                    'position_id' => $position?->id,
                    'department_id' => $department?->id,
                    'employee_sip' => !empty($row['sip']) ? trim($row['sip']) : null,
                    'employee_status' => $status,
                    'join_date' => $joinDate,
                    'leave_quota' => !empty($row['leave_quota']) ? (int)$row['leave_quota'] : 12,
                ]);

                $this->importedCount++;
            } catch (\Exception $e) {
                $this->errors[] = "Row {$rowNumber}: {$e->getMessage()}";
            }
        }
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
