import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CalendarDays,
    Check,
    Clock,
    FileText,
    Paperclip,
    UserCircle,
    X,
} from 'lucide-react';
import { useState } from 'react';
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
            approved: 'Disetujui',
            rejected: 'Ditolak',
        }[leaveRequest.status] || leaveRequest.status;

    const statusIcon =
        {
            pending: '⏳',
            approved: '✅',
            rejected: '❌',
        }[leaveRequest.status] || '▶️';

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
            <div className="mx-auto flex h-full w-full max-w-3xl flex-1 flex-col gap-6 p-4 lg:p-8">
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
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Detail Cuti #{leaveRequest.id}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Informasi lengkap pengajuan cuti.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canApprove && leaveRequest.status === 'pending' && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        handleStatusUpdate('approved')
                                    }
                                    className="border-green-600 text-green-600 hover:border-green-700 hover:text-green-700"
                                >
                                    <Check className="mr-2 h-4 w-4" /> Setujui
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        handleStatusUpdate('rejected')
                                    }
                                >
                                    <X className="mr-2 h-4 w-4" /> Tolak
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Status Banner */}
                <div
                    className={`flex items-center gap-4 rounded-lg border px-5 py-4 ${statusColor} bg-opacity-50`}
                >
                    <span className="text-3xl">{statusIcon}</span>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold tracking-wider uppercase">
                            Status: {statusLabel}
                        </p>
                        <p className="text-sm opacity-90">
                            Diajukan pada{' '}
                            {formatDatetime(leaveRequest.created_at)}
                        </p>
                    </div>
                    {leaveRequest.status !== 'pending' &&
                        leaveRequest.approver && (
                            <div className="flex items-center gap-2 text-sm opacity-90">
                                <UserCircle className="h-4 w-4" />
                                <span>
                                    {leaveRequest.status === 'approved'
                                        ? 'Disetujui'
                                        : 'Ditolak'}{' '}
                                    oleh{' '}
                                    <span className="font-semibold">
                                        {leaveRequest.approver.employee
                                            ?.full_name ?? 'Sistem'}
                                    </span>
                                </span>
                            </div>
                        )}
                </div>

                {/* Employee Info Card */}
                <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="border-b bg-muted/40 px-6 py-3">
                        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                            Informasi Karyawan
                        </h3>
                    </div>
                    <div className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {getInitials(leaveRequest.employee?.full_name)}
                        </div>
                        <div>
                            <p className="text-base font-semibold">
                                {leaveRequest.employee?.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {leaveRequest.employee?.position?.name ??
                                    'Posisi tidak diketahui'}{' '}
                                —{' '}
                                {leaveRequest.employee?.department?.name ??
                                    'Departemen tidak diketahui'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detail Information Grid */}
                <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="border-b bg-muted/40 px-6 py-3">
                        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                            Detail Pengajuan
                        </h3>
                    </div>

                    <div className="grid gap-6 p-6 sm:grid-cols-2">
                        {/* Leave Type */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                <FileText className="h-3.5 w-3.5" />
                                Jenis Cuti
                            </div>
                            <div>
                                <Badge
                                    variant="secondary"
                                    className="px-3 py-1 text-sm font-medium"
                                >
                                    {leaveRequest.leave_type?.name ?? '-'}
                                </Badge>
                            </div>
                        </div>

                        {/* Total Days */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Total Hari
                            </div>
                            <p className="text-xl font-bold">
                                {totalDays}{' '}
                                <span className="text-sm font-normal text-muted-foreground">
                                    hari
                                </span>
                            </p>
                        </div>

                        {/* Dates range */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                <Calendar className="h-3.5 w-3.5" />
                                Jangka Waktu
                            </div>
                            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                <div className="rounded-md border bg-muted/30 px-4 py-2 text-sm font-medium">
                                    {formatDate(leaveRequest.start_date)}
                                </div>
                                <span className="hidden text-muted-foreground sm:inline">
                                    →
                                </span>
                                <div className="rounded-md border bg-muted/30 px-4 py-2 text-sm font-medium">
                                    {formatDate(leaveRequest.end_date)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-2 space-y-1.5 sm:col-span-2">
                            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                <Clock className="h-3.5 w-3.5" />
                                Alasan Cuti
                            </div>
                            <div className="rounded-md border-l-4 border-l-primary/50 bg-muted/30 p-4 text-sm leading-relaxed">
                                {leaveRequest.reason || (
                                    <span className="text-muted-foreground italic">
                                        Tidak ada alasan diberikan.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attachment Card */}
                {leaveRequest.attachment_path && (
                    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="border-b bg-muted/40 px-6 py-3">
                            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Lampiran
                            </h3>
                        </div>
                        <div className="p-6">
                            <a
                                href={`/storage/${leaveRequest.attachment_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-md border bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                            >
                                <Paperclip className="h-4 w-4" />
                                Lihat Berkas Lampiran
                            </a>
                        </div>
                    </div>
                )}

                {/* Confirmation Dialog */}
                <Dialog
                    open={!!confirmAction}
                    onOpenChange={(o) => !o && setConfirmAction(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Persetujuan</DialogTitle>
                            <DialogDescription>
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
                                untuk pengajuan ini?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
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
