import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    FileText,
    Hourglass,
    UserCircle,
    X,
} from 'lucide-react';
import { useState } from 'react';
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

type OvertimeRequestData = {
    id: number;
    employee_id: number;
    date: string;
    start_time: string;
    end_time: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    employee?: {
        full_name: string;
        position?: { name: string };
        department?: { name: string };
    };
    approver?: { employee?: { full_name: string } };
};

export default function Show({
    overtimeRequest,
    canApprove,
}: {
    overtimeRequest: OvertimeRequestData;
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
        }[overtimeRequest.status] ||
        'bg-gray-100 text-gray-800 border-gray-200';

    const statusLabel =
        {
            pending: 'Menunggu',
            approved: 'Disetujui',
            rejected: 'Ditolak',
        }[overtimeRequest.status] || overtimeRequest.status;

    const statusIcon =
        {
            pending: '⏳',
            approved: '✅',
            rejected: '❌',
        }[overtimeRequest.status] || '▶️';

    // Calculate duration
    const calculateDuration = (startTime: string, endTime: string) => {
        if (!startTime || !endTime) return { hours: 0, minutes: 0, label: '-' };
        const [h1, m1] = startTime.split(':').map(Number);
        const [h2, m2] = endTime.split(':').map(Number);
        let totalMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
        if (totalMinutes < 0) totalMinutes += 24 * 60; // handle overnight
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        let label = '';
        if (hours > 0) label += `${hours} jam `;
        if (minutes > 0) label += `${minutes} menit`;
        if (!label) label = '0 menit';
        return { hours, minutes, label: label.trim() };
    };

    const duration = calculateDuration(
        overtimeRequest.start_time,
        overtimeRequest.end_time,
    );

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

    const formatTime = (time: string) => {
        if (!time) return '-';
        const [h, m] = time.split(':');
        return `${h}:${m}`;
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
            `/overtime-requests/${overtimeRequest.id}/status`,
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
                { title: 'Pengajuan Lembur', href: '/overtime-requests' },
                {
                    title: 'Detail Pengajuan',
                    href: `/overtime-requests/${overtimeRequest.id}`,
                },
            ]}
        >
            <Head title="Detail Pengajuan Lembur" />
            <div className="mx-auto flex h-full w-full max-w-3xl flex-1 flex-col gap-6 p-4 lg:p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/overtime-requests">
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
                                Detail Lembur #{overtimeRequest.id}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Informasi lengkap terkait pengajuan lembur.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canApprove && overtimeRequest.status === 'pending' && (
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
                            {formatDatetime(overtimeRequest.created_at)}
                        </p>
                    </div>
                    {overtimeRequest.status !== 'pending' &&
                        overtimeRequest.approver && (
                            <div className="flex items-center gap-2 text-sm opacity-90">
                                <UserCircle className="h-4 w-4" />
                                <span>
                                    {overtimeRequest.status === 'approved'
                                        ? 'Disetujui'
                                        : 'Ditolak'}{' '}
                                    oleh{' '}
                                    <span className="font-semibold">
                                        {overtimeRequest.approver.employee
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
                            {getInitials(overtimeRequest.employee?.full_name)}
                        </div>
                        <div>
                            <p className="text-base font-semibold">
                                {overtimeRequest.employee?.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {overtimeRequest.employee?.position?.name ??
                                    'Posisi tidak diketahui'}{' '}
                                —{' '}
                                {overtimeRequest.employee?.department?.name ??
                                    'Departemen tidak diketahui'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detail Card */}
                <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="border-b bg-muted/40 px-6 py-3">
                        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                            Detail Lembur
                        </h3>
                    </div>

                    <div className="grid gap-6 p-6 sm:grid-cols-2">
                        {/* Date */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                <Calendar className="h-3.5 w-3.5" />
                                Tanggal Lembur
                            </div>
                            <p className="text-base font-medium">
                                {formatDate(overtimeRequest.date)}
                            </p>
                        </div>

                        {/* Duration — highlighted */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                <Hourglass className="h-3.5 w-3.5" />
                                Durasi Lembur
                            </div>
                            <p className="text-xl font-bold">
                                {duration.label}
                            </p>
                        </div>

                        {/* Time Range Summary */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                <Clock className="h-3.5 w-3.5" />
                                Waktu Lembur
                            </div>
                            <div className="mt-1 inline-flex items-center gap-3 rounded-md border bg-muted/30 px-4 py-2">
                                <span className="text-base font-semibold">
                                    {formatTime(overtimeRequest.start_time)}
                                </span>
                                <span className="text-muted-foreground">→</span>
                                <span className="text-base font-semibold">
                                    {formatTime(overtimeRequest.end_time)}
                                </span>
                            </div>
                        </div>

                        {/* Description Card */}
                        <div className="mt-2 space-y-1.5 sm:col-span-2">
                            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                <FileText className="h-3.5 w-3.5" />
                                Deskripsi / Tugas
                            </div>
                            <div className="rounded-md border-l-4 border-l-primary/50 bg-muted/30 p-4 text-sm leading-relaxed">
                                {overtimeRequest.description || (
                                    <span className="text-muted-foreground italic">
                                        Tidak ada deskripsi.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Update Confirmation Dialog */}
                <Dialog
                    open={!!confirmAction}
                    onOpenChange={(open) => !open && setConfirmAction(null)}
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
