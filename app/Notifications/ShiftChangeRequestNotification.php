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
            'submitted' => "{$requesterName} mengajukan tukar shift dengan Anda pada tanggal {$date}.",
            'target_approved' => "Tukar shift {$requesterName} & {$targetName} tgl {$date} disetujui, menunggu persetujuan Anda (HRD).",
            'approved'  => "Tukar shift antara {$requesterName} & {$targetName} tgl {$date} telah disetujui HRD.",
            'rejected'  => "Pengajuan tukar shift Anda tgl {$date} telah ditolak.",
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
