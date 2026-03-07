<?php

namespace App\Notifications;

use App\Models\OvertimeRequest;
use App\Models\Employee;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class OvertimeRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public OvertimeRequest $overtimeRequest,
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
            'submitted' => "{$this->employee->full_name} mengajukan lembur tanggal {$this->overtimeRequest->date} ({$this->overtimeRequest->start_time} - {$this->overtimeRequest->end_time})",
            'approved'  => "Pengajuan lembur Anda tanggal {$this->overtimeRequest->date} telah disetujui",
            'rejected'  => "Pengajuan lembur Anda tanggal {$this->overtimeRequest->date} telah ditolak",
        ];

        return [
            'type' => 'overtime_request',
            'action' => $this->action,
            'overtime_request_id' => $this->overtimeRequest->id,
            'employee_id' => $this->employee->id,
            'employee_name' => $this->employee->full_name,
            'message' => $messages[$this->action] ?? '',
            'url' => '/overtime-requests',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
