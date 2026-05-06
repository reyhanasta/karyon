import { Check, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';


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
    target_approver?: Approver | null;
}

interface ApprovalHistoryProps {
    request: RequestData;
    canApprove?: boolean;
    onApprove?: () => void;
    onReject?: () => void;
    showDirectorStep?: boolean;
    showTargetStep?: boolean;
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
        done: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 ring-background',
        rejected:
            'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 ring-background',
        current:
            'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 ring-background',
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
    showTargetStep = false,
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
    const getTargetStatus = (): StepStatus => {
        if (request.target_approver) {
            const isRejected =
                request.status === 'rejected' &&
                !request.manager_approver &&
                !request.hrd_approver;
            return isRejected ? 'rejected' : 'done';
        }
        if (request.status === 'pending_target') return 'current';
        if (request.status !== 'pending' && request.status !== 'pending_target')
            return 'done';
        return 'waiting';
    };

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

        // If status is past Karu approval, it's done (even if approver data is missing/bypassed)
        const isPastKaru =
            ['pending_hrd', 'pending_director', 'approved'].includes(
                request.status,
            ) ||
            !!request.hrd_approver ||
            !!request.director_approver;

        if (isPastKaru) return 'done';

        return 'waiting';
    };

    const getHrdStatus = (): StepStatus => {
        if (request.hrd_approver) {
            const isRejected =
                request.status === 'rejected' && !request.director_approver;
            return isRejected ? 'rejected' : 'done';
        }

        if (request.status === 'pending_hrd') return 'current';

        const isPastHrd =
            ['pending_director', 'approved'].includes(request.status) ||
            !!request.director_approver;

        if (isPastHrd) return 'done';

        return 'waiting';
    };

    const getDirectorStatus = (): StepStatus => {
        const isRejected =
            request.status === 'rejected' && !!request.director_approver;
        if (isRejected) return 'rejected';
        if (request.director_approver) return 'done';
        if (request.status === 'pending_director') return 'current';
        if (request.status === 'approved') return 'done';
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

                    {/* Step 1: Target (Optional, for Shift Change) */}
                    {showTargetStep && (
                        <TimelineStep
                            title="Karyawan Pengganti"
                            status={getTargetStatus()}
                            subtitle={
                                request.target_approver
                                    ? getTargetStatus() === 'rejected'
                                        ? `Ditolak oleh ${request.target_approver.employee?.full_name ?? 'Pengganti'}`
                                        : `Disetujui oleh ${request.target_approver.employee?.full_name ?? 'Pengganti'}`
                                    : getTargetStatus() === 'current'
                                      ? 'Menunggu persetujuan pengganti…'
                                      : getTargetStatus() === 'done'
                                        ? 'Selesai'
                                        : 'Menunggu…'
                            }
                        />
                    )}

                    {/* Step 2: Karu / Manager */}
                    <TimelineStep
                        title="Kepala Ruangan"
                        status={getKaruStatus()}
                        subtitle={
                            karuApprover
                                ? getKaruStatus() === 'rejected'
                                    ? `Ditolak oleh ${karuApprover.employee?.full_name ?? 'Kepala Ruangan'}`
                                    : `Disetujui oleh ${karuApprover.employee?.full_name ?? 'Kepala Ruangan'}`
                                : getKaruStatus() === 'done'
                                  ? `Dilewati (Bypass oleh ${request.hrd_approver?.employee?.full_name ?? 'HRD'})`
                                  : getKaruStatus() === 'current'
                                    ? 'Sedang diproses…'
                                    : 'Menunggu…'
                        }
                    />

                    {/* Step 3: HRD */}
                    <TimelineStep
                        title="HRD"
                        status={getHrdStatus()}
                        subtitle={
                            request.hrd_approver
                                ? getHrdStatus() === 'rejected'
                                    ? `Ditolak oleh ${request.hrd_approver.employee?.full_name ?? 'HRD'}`
                                    : `Disetujui oleh ${request.hrd_approver.employee?.full_name ?? 'HRD'}`
                                : getHrdStatus() === 'done'
                                  ? `Dilewati (Bypass oleh ${request.director_approver?.employee?.full_name ?? 'Direktur'})`
                                  : getHrdStatus() === 'current'
                                    ? 'Sedang diproses…'
                                    : 'Menunggu…'
                        }
                    />

                    {/* Step 4: Direktur */}
                    {showDirectorStep && (
                        <TimelineStep
                            title="Direktur"
                            status={getDirectorStatus()}
                            subtitle={
                                request.director_approver
                                    ? getDirectorStatus() === 'rejected'
                                        ? `Ditolak oleh ${request.director_approver.employee?.full_name ?? 'Direktur'}`
                                        : `Disetujui oleh ${request.director_approver.employee?.full_name ?? 'Direktur'}`
                                    : getDirectorStatus() === 'done'
                                      ? `Dilewati (Bypass oleh ${request.hrd_approver?.employee?.full_name ?? 'HRD'})`
                                      : getDirectorStatus() === 'current'
                                        ? 'Sedang diproses…'
                                        : 'Menunggu…'
                            }
                        />
                    )}
                </ol>

                {canApprove && request.status.startsWith('pending') && (
                    <div className="mt-8 flex flex-col gap-3 border-t border-border/50 pt-6">
                        <Button
                            variant="default"
                            className="h-12 w-full rounded-2xl bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:bg-emerald-700 active:scale-[0.98]"
                            onClick={onApprove}
                        >
                            <Check className="mr-2 h-4 w-4" /> Setujui Sekarang
                        </Button>
                        <Button
                            variant="destructive"
                            className="h-12 w-full rounded-2xl font-bold transition-all duration-300 active:scale-[0.98]"
                            onClick={onReject}
                        >
                            <X className="mr-2 h-4 w-4" /> Tolak Pengajuan
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
