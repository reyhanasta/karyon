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
        $messages = [
            'submitted' => "{$this->employee->full_name} mengajukan cuti ({$this->leaveRequest->start_date} s/d {$this->leaveRequest->end_date})",
            'approved'  => "Pengajuan cuti Anda ({$this->leaveRequest->start_date} s/d {$this->leaveRequest->end_date}) telah disetujui",
            'rejected'  => "Pengajuan cuti Anda ({$this->leaveRequest->start_date} s/d {$this->leaveRequest->end_date}) telah ditolak",
        ];

        return [
            'type' => 'leave_request',
            'action' => $this->action,
            'leave_request_id' => $this->leaveRequest->id,
            'employee_id' => $this->employee->id,
            'employee_name' => $this->employee->full_name,
            'message' => $messages[$this->action] ?? '',
            'url' => '/leave-requests',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
