<?php

namespace App\Notifications;

use App\Models\ShiftChangeRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class ShiftChangeRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public ShiftChangeRequest $shiftChangeRequest,
        public string $action, // 'submitted', 'target_approved', 'approved', 'rejected'
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $requesterName = $this->shiftChangeRequest->requester->full_name;
        $targetName = $this->shiftChangeRequest->target->full_name;
        $date = \Carbon\Carbon::parse($this->shiftChangeRequest->request_date)->format('d/m/Y');

        $messages = [
            'submitted' => "{$requesterName} mengajukan tukar shift dengan {$targetName} pada tanggal {$date}.",
            'pending_manager' => "Tukar shift {$requesterName} & {$targetName} tgl {$date} menunggu persetujuan Kepala Ruangan.",
            'pending_hrd' => "Tukar shift {$requesterName} & {$targetName} tgl {$date} menunggu persetujuan HRD.",
            'approved'  => "Tukar shift antara {$requesterName} & {$targetName} tgl {$date} telah disetujui.",
            'rejected'  => "Pengajuan tukar shift {$requesterName} & {$targetName} tgl {$date} telah ditolak.",
        ];

        return [
            'type' => 'shift_change_request',
            'action' => $this->action,
            'shift_change_request_id' => $this->shiftChangeRequest->id,
            'requester_name' => $requesterName,
            'target_name' => $targetName,
            'date' => $date,
            'message' => $messages[$this->action] ?? '',
            'url' => '/shift-change-requests/' . $this->shiftChangeRequest->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
