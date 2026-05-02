import { Head, Link, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    ArrowLeft,
    ArrowLeftRight,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    User,
    UserCheck,
    Edit,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { ApprovalHistory } from '@/components/approval-history';
import { UserCard } from '@/components/user-card';
import type { Employee } from '@/components/user-card';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

// ... (types)
type Shift = { id: number; name: string; start_time: string; end_time: string };
type ShiftChangeRequest = {
    id: number;
    requester: Employee;
    target: Employee;
    request_date: string;
    requester_shift: Shift;
    targetShift?: Shift;
    reason: string;
    status:
        | 'pending_target'
        | 'pending_hrd'
        | 'pending_manager'
        | 'approved'
        | 'rejected';
    target_approved_at: string | null;
    targetApprovedBy?: { name: string };
    hrd_approved_at: string | null;
    hrdApprovedBy?: { name: string };
    manager_approved_at: string | null;
    managerApprovedBy?: { name: string };
    notes: string | null;
    created_at: string;
};

export default function Show({
    request,
    canEdit,
}: {
    request: ShiftChangeRequest;
    canEdit?: boolean;
}) {
    const { can } = usePermissions();
    const { auth } = usePage().props as any;

    console.log(request);

    const isHrd = can('shift-change.approve.hrd');
    const isManager = can('shift-change.approve.manager');

    const [confirmAction, setConfirmAction] = useState<{
        type: 'approve_hrd' | 'approve_manager' | 'reject' | 'cancel';
        notes?: string;
    } | null>(null);

    const executeAction = () => {
        if (!confirmAction) return;

        let url = '';
        let data = {};

        if (confirmAction.type === 'approve_hrd') {
            url = `/shift-change-requests/${request.id}/approve-hrd`;
        } else if (confirmAction.type === 'approve_manager') {
            url = `/shift-change-requests/${request.id}/approve-manager`;
        } else if (confirmAction.type === 'reject') {
            url = `/shift-change-requests/${request.id}/reject`;
            data = { notes: confirmAction.notes };
            if (!confirmAction.notes) {
                alert('Alasan penolakan wajib diisi.');
                return;
            }
        } else if (confirmAction.type === 'cancel') {
            url = `/shift-change-requests/${request.id}/cancel`;
        }

        router.post(url, data, {
            preserveScroll: true,
            onSuccess: () => setConfirmAction(null),
        });
    };

    const cancelRequest = () => {
        setConfirmAction({ type: 'cancel' });
    };

    const mappedRequest = {
        ...request,
        employee: { full_name: request.requester.full_name },
        target_approver: request.target_approved_at
            ? { employee: { full_name: request.target.full_name } }
            : null,
        manager_approver: request.managerApprovedBy
            ? { employee: { full_name: request.managerApprovedBy.name } }
            : null,
        hrd_approver: request.hrdApprovedBy
            ? { employee: { full_name: request.hrdApprovedBy.name } }
            : null,
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Penggantian Shift', href: '/shift-change-requests' },
                {
                    title: 'Detail Pengajuan',
                    href: `/shift-change-requests/${request.id}`,
                },
            ]}
        >
            <Head title="Detail Penggantian Shift" />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 lg:p-10">
                {/* Back Button & Title (Minimalist) */}
                <div className="flex items-center gap-4">
                    <Link href="/shift-change-requests">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full transition-colors hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Detail Pengajuan Shift
                        </h1>
                        <p className="text-xs font-medium text-muted-foreground">
                            Informasi lengkap penggantian jadwal kerja antar
                            karyawan
                        </p>
                    </div>

                    <div className="ml-auto flex gap-2">
                        {request.status.startsWith('pending') && (
                            <>
                                {(request.requester.id ===
                                    auth.user.employee?.id ||
                                    canEdit) && (
                                    <Link
                                        href={`/shift-change-requests/${request.id}/edit`}
                                    >
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="rounded-xl shadow-sm hover:bg-accent"
                                        >
                                            <Edit className="h-4 w-4" /> Edit
                                        </Button>
                                    </Link>
                                )}
                                {request.requester.id ===
                                    auth.user.employee?.id && (
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="rounded-xl border-destructive/20 bg-destructive/5 text-destructive transition-colors hover:bg-destructive/10"
                                        onClick={cancelRequest}
                                    >
                                        <X className="h-4 w-4" /> Batalkan
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Top Section: Requester & Substitute */}
                <div className="flex flex-col items-center gap-6 md:flex-row md:items-stretch">
                    <UserCard
                        employee={request.requester}
                        label="PEMOHON"
                        isActive={true}
                        status="DIAJUKAN"
                    />

                    <div className="flex items-center justify-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-background shadow-sm dark:bg-muted/30">
                            <ArrowLeftRight className="h-5 w-5 animate-pulse text-primary" />
                        </div>
                    </div>

                    <UserCard
                        employee={request.target}
                        label="PENGGANTI"
                        status={
                            request.target_approved_at
                                ? 'DISETUJUI'
                                : 'MENUNGGU'
                        }
                    />
                </div>

                {/* Middle Content Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* Details Column */}
                    <div className="space-y-6 md:col-span-7">
                        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm dark:shadow-none">
                            <h2 className="mb-8 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                                Detail Penggantian
                            </h2>

                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary shadow-inner">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                                            Tanggal Penggantian
                                        </p>
                                        <p className="text-base font-bold text-foreground">
                                            {format(
                                                parseISO(request.request_date),
                                                'dd MMMM yyyy',
                                                { locale: id },
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/5 text-orange-600 shadow-inner dark:text-orange-400">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                                            Shift Kerja
                                        </p>
                                        <p className="text-base font-bold text-foreground">
                                            {request.requester_shift?.name ??
                                                '-'}
                                            <span className="ml-1 text-xs font-medium text-muted-foreground">
                                                (
                                                {request.requester_shift?.start_time.slice(
                                                    0,
                                                    5,
                                                )}{' '}
                                                -{' '}
                                                {request.requester_shift?.end_time.slice(
                                                    0,
                                                    5,
                                                )}
                                                )
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 space-y-6">
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                                        Alasan Pengajuan
                                    </h3>
                                    <div className="relative rounded-[1.5rem] bg-muted/30 p-6 dark:bg-muted/10">
                                        <p className="text-sm leading-relaxed font-medium text-foreground italic">
                                            &quot;
                                            {request.reason ||
                                                'Tidak ada alasan yang diberikan.'}
                                            &quot;
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-4 text-[10px] font-medium tracking-tight text-muted-foreground uppercase">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm">
                                                <User className="h-3 w-3" />
                                            </div>
                                            <span>
                                                Diajukan{' '}
                                                {format(
                                                    parseISO(
                                                        request.created_at,
                                                    ),
                                                    'd MMM yyyy',
                                                    { locale: id },
                                                )}{' '}
                                                •{' '}
                                                {format(
                                                    parseISO(
                                                        request.created_at,
                                                    ),
                                                    'HH.mm',
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {request.notes && (
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-destructive uppercase">
                                            Catatan Penolakan
                                        </h3>
                                        <div className="rounded-[1.5rem] border border-destructive/10 bg-destructive/5 p-6 shadow-sm shadow-destructive/5">
                                            <p className="text-sm leading-relaxed font-semibold text-destructive/90 italic">
                                                &quot;{request.notes}&quot;
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline Column */}
                    <div className="md:col-span-5">
                        <ApprovalHistory
                            request={mappedRequest}
                            showDirectorStep={false}
                            showTargetStep={true}
                            canApprove={
                                isHrd ||
                                (isManager &&
                                    request.status === 'pending_manager')
                            }
                            onApprove={() =>
                                setConfirmAction({
                                    type: isHrd
                                        ? 'approve_hrd'
                                        : 'approve_manager',
                                })
                            }
                            onReject={() =>
                                setConfirmAction({ type: 'reject', notes: '' })
                            }
                        />
                    </div>
                </div>

                {/* Bottom Actions */}
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={executeAction}
                title={
                    confirmAction?.type === 'reject'
                        ? 'Konfirmasi Penolakan'
                        : confirmAction?.type === 'cancel'
                          ? 'Konfirmasi Pembatalan'
                          : 'Konfirmasi Persetujuan'
                }
                description={
                    confirmAction?.type === 'reject'
                        ? 'Apakah Anda yakin ingin menolak pengajuan ini?'
                        : confirmAction?.type === 'cancel'
                          ? 'Apakah Anda yakin ingin membatalkan pengajuan ini? Tindakan ini tidak dapat dibatalkan.'
                          : 'Apakah Anda yakin ingin menyetujui pengajuan ini? Tindakan ini akan memproses jadwal shift karyawan terkait secara otomatis.'
                }
                confirmText={
                    confirmAction?.type === 'reject'
                        ? 'Ya, Tolak Pengajuan'
                        : confirmAction?.type === 'cancel'
                          ? 'Ya, Batalkan Pengajuan'
                          : 'Ya, Setujui Sekarang'
                }
                variant={
                    confirmAction?.type === 'reject' || confirmAction?.type === 'cancel'
                        ? 'destructive'
                        : 'default'
                }
            >
                {confirmAction?.type === 'reject' && (
                    <div className="space-y-3">
                        <Label
                            htmlFor="notes"
                            className="text-xs font-bold tracking-widest text-foreground uppercase"
                        >
                            Alasan Penolakan
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Berikan alasan yang jelas untuk penolakan ini..."
                            value={confirmAction.notes}
                            onChange={(e) =>
                                setConfirmAction({
                                    ...confirmAction,
                                    notes: e.target.value,
                                })
                            }
                            className="min-h-32 resize-none rounded-2xl border-border/50 bg-background transition-all focus:border-destructive focus:ring-destructive/20"
                        />
                    </div>
                )}
            </ConfirmationModal>
        </AppLayout>
    );
}
