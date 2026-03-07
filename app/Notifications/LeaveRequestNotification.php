<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use App\Models\Employee;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class LeaveRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public LeaveRequest $leaveRequest,
        public Employee $employee,
        public string $action, // 'submitted', 'approved', 'rejected'
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $typeName = $this->leaveRequest->leaveType?->name ?? 'Cuti';

        $messages = [
            'submitted' => "{$this->employee->full_name} mengajukan {$typeName} ({$this->leaveRequest->start_date} s/d {$this->leaveRequest->end_date})",
            'approved'  => "Pengajuan {$typeName} Anda ({$this->leaveRequest->start_date} s/d {$this->leaveRequest->end_date}) telah disetujui",
            'rejected'  => "Pengajuan {$typeName} Anda ({$this->leaveRequest->start_date} s/d {$this->leaveRequest->end_date}) telah ditolak",
        ];

        return [
            'type' => 'leave_request',
            'action' => $this->action,
            'leave_request_id' => $this->leaveRequest->id,
            'employee_id' => $this->employee->id,
            'employee_name' => $this->employee->full_name,
            'leave_type' => $typeName,
            'message' => $messages[$this->action] ?? '',
            'url' => '/leave-requests',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
