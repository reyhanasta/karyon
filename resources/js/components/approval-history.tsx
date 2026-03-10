import { Check, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Approver {
    employee?: {
        full_name: string;
    };
}

interface RequestData {
    status: string;
    hrd_approver?: Approver | null;
    manager_approver?: Approver | null;
    director_approver?: Approver | null;
}

interface ApprovalHistoryProps {
    request: RequestData;
    canApprove?: boolean;
    onApprove?: () => void;
    onReject?: () => void;
}

export function ApprovalHistory({
    request,
    canApprove,
    onApprove,
    onReject,
}: ApprovalHistoryProps) {
    const renderApproverStep = (
        title: string,
        approver: Approver | null | undefined,
        isPendingForThisStep: boolean,
        isRejectedAtThisStep: boolean,
    ) => {
        const isApproved = !!approver && !isRejectedAtThisStep;

        let icon = <Clock className="h-4 w-4" />;
        let iconClass = 'border-muted bg-muted/50 text-muted-foreground/70';
        let statusText = 'Menunggu...';

        if (isApproved) {
            icon = <Check className="h-4 w-4" />;
            iconClass =
                'border-green-200 bg-green-100 text-green-600 dark:border-green-800/50 dark:bg-green-900/40 dark:text-green-400';
            statusText = `Disetujui oleh ${approver?.employee?.full_name ?? 'Sistem'}`;
        } else if (isRejectedAtThisStep) {
            icon = <X className="h-4 w-4" />;
            iconClass =
                'border-red-200 bg-red-100 text-red-600 dark:border-red-800/50 dark:bg-red-900/40 dark:text-red-400';
            statusText = `Ditolak oleh ${approver?.employee?.full_name ?? 'Sistem'}`;
        } else if (isPendingForThisStep) {
            iconClass =
                'border-blue-200 bg-blue-100 text-blue-600 dark:border-blue-800/50 dark:bg-blue-900/40 dark:text-blue-400';
            statusText = 'Sedang Diproses...';
        }

        return (
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${iconClass}`}
                >
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs opacity-70">{statusText}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all">
            <div className="border-b bg-muted/30 px-6 py-4">
                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    Riwayat Persetujuan
                </h3>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                    {renderApproverStep(
                        'HRD',
                        request.hrd_approver,
                        request.status === 'pending_hrd',
                        request.status === 'rejected' &&
                            !!request.hrd_approver &&
                            !request.manager_approver,
                    )}
                    {renderApproverStep(
                        'Kepala Ruangan',
                        request.manager_approver,
                        request.status === 'pending_manager',
                        request.status === 'rejected' &&
                            !!request.manager_approver &&
                            !request.director_approver,
                    )}
                    {renderApproverStep(
                        'Direktur',
                        request.director_approver,
                        request.status === 'pending_director',
                        request.status === 'rejected' &&
                            !!request.director_approver,
                    )}
                </div>

                {canApprove && request.status.startsWith('pending') && (
                    <div className="mt-8 space-y-3">
                        <Button
                            variant="default"
                            className="w-full bg-green-600 font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-green-700 active:scale-[0.98]"
                            onClick={onApprove}
                        >
                            <Check className="mr-2 h-4 w-4" /> Setujui
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-destructive text-destructive transition-all hover:bg-destructive/10 hover:text-destructive active:scale-[0.98]"
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
