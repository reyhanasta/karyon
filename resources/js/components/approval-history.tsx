import { Check, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import leaveRequests from '@/routes/leave-requests';

interface Approver {
    employee?: { full_name: string };
}

interface RequestData {
    status: string;
    created_at?: string;
    employee?: { full_name: string };
    hrd_approver?: Approver | null;
    manager_approver?: Approver | null;
    kepala_ruangan_approver?: Approver | null;
    director_approver?: Approver | null;
}

interface ApprovalHistoryProps {
    request: RequestData;
    canApprove?: boolean;
    onApprove?: () => void;
    onReject?: () => void;
    showDirectorStep?: boolean;
}

type StepStatus = 'done' | 'rejected' | 'current' | 'waiting';

function TimelineStep({
    title,
    subtitle,
    status,
}: {
    title: string;
    subtitle: string;
    status: StepStatus;
}) {
    const iconMap: Record<StepStatus, React.ReactNode> = {
        done: <Check className="h-3.5 w-3.5" />,
        rejected: <X className="h-3.5 w-3.5" />,
        current: <Clock className="h-3.5 w-3.5" />,
        waiting: <Clock className="h-3.5 w-3.5" />,
    };

    const colorMap: Record<StepStatus, string> = {
        done: 'bg-green-100 text-green-600 ring-background',
        rejected: 'bg-red-100 text-red-600 ring-background',
        current: 'bg-blue-100 text-blue-600 ring-background',
        waiting: 'bg-muted text-muted-foreground ring-background',
    };

    return (
        <li className="ms-6">
            <span
                className={`absolute -inset-s-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ${colorMap[status]}`}
            >
                {iconMap[status]}
            </span>
            <h3 className="text-sm leading-tight font-medium">{title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </li>
    );
}

export function ApprovalHistory({
    request,
    canApprove,
    onApprove,
    onReject,
    showDirectorStep = true,
}: ApprovalHistoryProps) {
    const formatDatetime = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Determine step status for each approver level
    const getKaruStatus = (): StepStatus => {
        const approver =
            request.manager_approver ?? request.kepala_ruangan_approver;
        if (approver) {
            const isRejected =
                request.status === 'rejected' &&
                !request.hrd_approver &&
                !request.director_approver;
            return isRejected ? 'rejected' : 'done';
        }
        if (
            request.status === 'pending_manager' ||
            request.status === 'pending_kepala_ruangan'
        )
            return 'current';
        if (
            request.status === 'pending_hrd' ||
            request.status === 'pending_director' ||
            request.status === 'approved'
        )
            return 'done';
        return 'waiting';
    };

    console.log(request.status);
    const getHrdStatus = (): StepStatus => {
        if (request.hrd_approver) {
            const isRejected =
                request.status === 'rejected' && !request.director_approver;
            return isRejected ? 'rejected' : 'done';
        }
        if (request.status === 'pending_hrd') return 'current';
        if (
            request.status === 'pending_director' ||
            request.status === 'approved'
        )
            return 'done';
        return 'waiting';
    };

    const getDirectorStatus = (): StepStatus => {
        const isRejected =
            request.status === 'rejected' && !!request.director_approver;
        if (isRejected) return 'rejected';
        if (request.director_approver) return 'done';
        if (request.status === 'pending_director') return 'current';
        return 'waiting';
    };

    const karuApprover =
        request.kepala_ruangan_approver ?? request.manager_approver;

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="border-b bg-muted/30 px-6 py-4">
                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    Riwayat Persetujuan
                </h3>
            </div>
            <div className="p-6">
                <ol className="relative ms-3 space-y-5 border-s border-muted-foreground/20">
                    {/* Step 0: Submission */}
                    <TimelineStep
                        title="Pengajuan Dibuat"
                        subtitle={`${request.employee?.full_name ?? 'Karyawan'} · ${formatDatetime(request.created_at)}`}
                        status="done"
                    />

                    {/* Step 1: Karu / Manager */}
                    <TimelineStep
                        title="Kepala Ruangan"
                        status={getKaruStatus()}
                        subtitle={
                            karuApprover
                                ? request.status === 'rejected' &&
                                  !request.hrd_approver &&
                                  !request.director_approver
                                    ? `Ditolak oleh ${karuApprover.employee?.full_name ?? 'Kepala Ruangan'}`
                                    : `Disetujui oleh ${karuApprover.employee?.full_name ?? 'Kepala Ruangan'}`
                                : request.status === 'approved' ||
                                    request.director_approver
                                  ? 'Dilewati (Bypass)'
                                  : request.status === 'pending_manager' ||
                                      request.status ===
                                          'pending_kepala_ruangan'
                                    ? 'Sedang diproses…'
                                    : 'Menunggu…'
                        }
                    />

                    {/* Step 2: HRD */}
                    <TimelineStep
                        title="HRD"
                        status={getHrdStatus()}
                        subtitle={
                            request.hrd_approver
                                ? request.status === 'rejected' &&
                                  !request.director_approver
                                    ? `Ditolak oleh ${request.hrd_approver.employee?.full_name ?? 'HRD'}`
                                    : `Disetujui oleh ${request.hrd_approver.employee?.full_name ?? 'HRD'}`
                                : request.status === 'approved' ||
                                    request.director_approver
                                  ? 'Dilewati (Bypass)'
                                  : request.status === 'pending_hrd'
                                    ? 'Sedang diproses…'
                                    : 'Menunggu…'
                        }
                    />

                    {/* Step 3: Direktur */}
                    {showDirectorStep && (
                        <TimelineStep
                            title="Direktur"
                            status={getDirectorStatus()}
                            subtitle={
                                request.director_approver
                                    ? request.status === 'rejected'
                                        ? `Ditolak oleh ${request.director_approver.employee?.full_name ?? 'Direktur'}`
                                        : `Disetujui oleh ${request.director_approver.employee?.full_name ?? 'Direktur'}`
                                    : request.status === 'pending_director'
                                      ? 'Sedang diproses…'
                                      : 'Menunggu…'
                            }
                        />
                    )}
                </ol>

                {canApprove && request.status.startsWith('pending') && (
                    <div className="mt-6 space-y-2 border-t pt-4">
                        <Button
                            variant="default"
                            className="w-full bg-green-600 font-semibold text-white hover:bg-green-700"
                            onClick={onApprove}
                        >
                            <Check className="mr-2 h-4 w-4" /> Setujui
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-destructive text-destructive hover:bg-destructive/10"
                            onClick={onReject}
                        >
                            <X className="mr-2 h-4 w-4" /> Tolak
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
