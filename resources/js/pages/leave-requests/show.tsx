import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CalendarDays,
    CheckCircle,
    Clock,
    FileText,
    Paperclip,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { ApprovalHistory } from '@/components/approval-history';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';

type LeaveRequestData = {
    id: number;
    employee_id: number;
    start_date: string;
    end_date: string;
    reason: string;
    attachment_path: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    employee?: {
        full_name: string;
        position?: { name: string };
        department?: { name: string };
    };
    leave_type?: { name: string };
    approver?: { employee?: { full_name: string } };
    hrd_approver?: { employee?: { full_name: string } };
    manager_approver?: { employee?: { full_name: string } };
    director_approver?: { employee?: { full_name: string } };
};

export default function Show({
    leaveRequest,
    canApprove,
}: {
    leaveRequest: LeaveRequestData;
    canApprove: boolean;
}) {
    const statusColor =
        {
            pending_hrd:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800/40',
            pending_manager:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800/40',
            pending_director:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800/40',
            pending:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800/40',
            approved:
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 border-green-200 dark:border-green-800/40',
            rejected:
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500 border-red-200 dark:border-red-800/40',
        }[leaveRequest.status] || 'bg-gray-100 text-gray-800 border-gray-200';

    const statusLabel =
        {
            pending: 'Menunggu',
            pending_hrd: 'Menunggu HRD',
            pending_manager: 'Menunggu Karu',
            pending_director: 'Menunggu Direktur',
            approved: 'Disetujui',
            rejected: 'Ditolak',
        }[leaveRequest.status] || leaveRequest.status;

    const statusIcon = leaveRequest.status.startsWith('pending') ? (
        <Clock className="h-6 w-6" />
    ) : leaveRequest.status === 'approved' ? (
        <CheckCircle className="h-6 w-6" />
    ) : (
        <XCircle className="h-6 w-6" />
    );

    // Calculate total days
    const start = new Date(leaveRequest.start_date);
    const end = new Date(leaveRequest.end_date);
    const totalDays =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;

    // Format date helper
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDatetime = (dateStr?: string) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const [confirmAction, setConfirmAction] = useState<{
        status: 'approved' | 'rejected';
    } | null>(null);

    const handleStatusUpdate = (status: 'approved' | 'rejected') => {
        setConfirmAction({ status });
    };

    const executeStatusUpdate = () => {
        if (!confirmAction) return;
        router.post(
            `/leave-requests/${leaveRequest.id}/status`,
            { status: confirmAction.status },
            {
                preserveScroll: true,
                onSuccess: () => setConfirmAction(null),
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Pengajuan Cuti', href: '/leave-requests' },
                {
                    title: 'Detail Pengajuan',
                    href: `/leave-requests/${leaveRequest.id}`,
                },
            ]}
        >
            <Head title="Detail Pengajuan Cuti" />
            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-6 p-4 lg:p-8">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/leave-requests">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div id="title">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Detail Pengajuan Cuti
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Kelola dan tinjau rincian pengajuan.
                            </p>
                        </div>
                    </div>

                    {/* Status Badge in Header */}
                    <div
                        className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 ${statusColor} bg-opacity-10 shadow-sm`}
                    >
                        <div className="opacity-80">{statusIcon}</div>
                        <div>
                            <p className="text-xs font-bold tracking-wider uppercase opacity-70">
                                Status
                            </p>
                            <p className="text-sm font-extrabold uppercase">
                                {statusLabel}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 gap-8 pt-2 md:grid-cols-12">
                    {/* Left Column: Sidebar Cards */}
                    <div className="space-y-6 md:col-span-4">
                        {/* Employee Card */}
                        <div className="space-y-4 overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="border-b bg-muted/30 px-6 py-4">
                                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    Informasi Karyawan
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-primary/10 text-2xl font-bold text-primary shadow-sm">
                                        {getInitials(
                                            leaveRequest.employee?.full_name,
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold">
                                            {leaveRequest.employee?.full_name}
                                        </p>
                                        <div className="flex flex-col items-center gap-1">
                                            <Badge
                                                variant="outline"
                                                className="font-medium"
                                            >
                                                {leaveRequest.employee?.position
                                                    ?.name ??
                                                    'Posisi tidak diketahui'}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {leaveRequest.employee
                                                    ?.department?.name ??
                                                    'Departemen tidak diketahui'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ApprovalHistory
                            request={leaveRequest}
                            canApprove={canApprove}
                            onApprove={() => handleStatusUpdate('approved')}
                            onReject={() => handleStatusUpdate('rejected')}
                        />
                    </div>

                    {/* Right Column: Detail Content */}
                    <div className="space-y-8 pb-10 md:col-span-8">
                        {/* Summary Details */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Leave Type Info */}
                            <div className="flex items-center justify-between rounded-xl border bg-card p-6 shadow-sm">
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Tipe Cuti
                                    </p>
                                    <p className="text-lg font-bold">
                                        {leaveRequest.leave_type?.name ?? '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                            </div>

                            {/* Total Days Info */}
                            <div className="flex items-center justify-between rounded-xl border bg-card p-6 shadow-sm">
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Durasi
                                    </p>
                                    <p className="text-2xl font-extrabold text-primary">
                                        {totalDays}{' '}
                                        <span className="text-base font-bold text-muted-foreground">
                                            Hari
                                        </span>
                                    </p>
                                </div>
                                <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
                                    <CalendarDays className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Main Detail Card */}
                        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="border-b bg-muted/30 px-6 py-4">
                                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    Rincian Waktu & Alasan
                                </h3>
                            </div>
                            <div className="space-y-10 p-8">
                                {/* Time Schedule */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Jadwal Cuti
                                    </div>
                                    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-7">
                                        <div className="rounded-xl border bg-muted/20 p-4 text-center sm:col-span-3">
                                            <p className="mb-1 text-xs font-semibold tracking-tighter text-muted-foreground uppercase">
                                                Mulai
                                            </p>
                                            <p className="text-md font-bold">
                                                {formatDate(
                                                    leaveRequest.start_date,
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <ArrowLeft className="hidden h-5 w-5 rotate-180 sm:block" />
                                            <span className="text-xs font-bold sm:hidden">
                                                Sampai Dengan
                                            </span>
                                        </div>
                                        <div className="rounded-xl border bg-muted/20 p-4 text-center sm:col-span-3">
                                            <p className="mb-1 text-xs font-semibold tracking-tighter text-muted-foreground uppercase">
                                                Selesai
                                            </p>
                                            <p className="text-md font-bold">
                                                {formatDate(
                                                    leaveRequest.end_date,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reason Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase">
                                        <Clock className="h-3.5 w-3.5" />
                                        Alasan Pengajuan
                                    </div>
                                    <div className="relative overflow-hidden rounded-xl border border-primary/10 bg-primary/2 p-6">
                                        <div className="absolute top-0 left-0 h-full w-1.5 bg-primary/40"></div>
                                        <p className="text-base leading-relaxed font-medium text-foreground/90 italic">
                                            &quot;
                                            {leaveRequest.reason ||
                                                'Tidak ada alasan yang diberikan.'}
                                            &quot;
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 border-t border-dashed pt-4 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                        Diajukan pada{' '}
                                        {formatDatetime(
                                            leaveRequest.created_at,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Attachments Area */}
                        {leaveRequest.attachment_path && (
                            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="border-b bg-muted/30 px-6 py-4">
                                    <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Dokumen Lampiran
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <a
                                        href={`/storage/${leaveRequest.attachment_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex items-center gap-4 rounded-xl border-2 border-primary/10 bg-primary/5 p-4 text-sm font-bold text-primary transition-all hover:border-primary/30 hover:bg-primary/10"
                                    >
                                        <div className="rounded-lg bg-background p-2 shadow-sm">
                                            <Paperclip className="h-5 w-5 transition-transform group-hover:rotate-12" />
                                        </div>
                                        <span>Lihat Berkas Lampiran</span>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Confirmation Dialog */}
                <Dialog
                    open={!!confirmAction}
                    onOpenChange={(o) => !o && setConfirmAction(null)}
                >
                    <DialogContent className="sm:max-w-106.25">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                Konfirmasi Persetujuan
                            </DialogTitle>
                            <DialogDescription className="pt-2 text-sm">
                                Apakah Anda yakin ingin melakukan aksi{' '}
                                <strong
                                    className={
                                        confirmAction?.status === 'approved'
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }
                                >
                                    {confirmAction?.status === 'approved'
                                        ? 'Setujui'
                                        : 'Tolak'}
                                </strong>{' '}
                                untuk pengajuan ini? Tindakan ini tidak dapat
                                dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-6 gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setConfirmAction(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                variant={
                                    confirmAction?.status === 'rejected'
                                        ? 'destructive'
                                        : 'default'
                                }
                                className={`flex-1 ${confirmAction?.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                onClick={executeStatusUpdate}
                            >
                                Ya, Lanjutkan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
