import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    Hourglass,
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
    hrd_approver?: { employee?: { full_name: string } };
    manager_approver?: { employee?: { full_name: string } };
    director_approver?: { employee?: { full_name: string } };
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
        }[overtimeRequest.status] ||
        'bg-gray-100 text-gray-800 border-gray-200';

    const statusLabel =
        {
            pending: 'Menunggu',
            pending_hrd: 'Menunggu HRD',
            pending_manager: 'Menunggu Karu',
            pending_director: 'Menunggu Direktur',
            approved: 'Disetujui',
            rejected: 'Ditolak',
        }[overtimeRequest.status] || overtimeRequest.status;

    const statusIcon = overtimeRequest.status.startsWith('pending') ? (
        <Clock className="h-6 w-6" />
    ) : overtimeRequest.status === 'approved' ? (
        <CheckCircle className="h-6 w-6" />
    ) : (
        <XCircle className="h-6 w-6" />
    );

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
        if (minutes > 0) label += `${minutes} mnt`;
        if (!label) label = '0 mnt';
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
            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-6 p-4 lg:p-8">
                {/* Header Actions */}
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
                        <div id="title">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Detail Pengajuan Lembur
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Informasi lengkap rincian lembur karyawan.
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

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-12">
                    {/* Left Sidebar Sections */}
                    <div className="space-y-4 md:col-span-4">
                        {/* Employee Card */}
                        <div className="space-y-4 overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="border-b bg-muted/30 px-6 py-2">
                                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    Informasi Karyawan
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-primary/10 text-2xl font-bold text-primary shadow-sm">
                                        {getInitials(
                                            overtimeRequest.employee?.full_name,
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold tracking-tight uppercase">
                                            {
                                                overtimeRequest.employee
                                                    ?.full_name
                                            }
                                        </p>
                                        <div className="flex flex-col items-center gap-1">
                                            <Badge
                                                variant="outline"
                                                className="font-medium"
                                            >
                                                {overtimeRequest.employee
                                                    ?.position?.name ?? 'Admin'}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {overtimeRequest.employee
                                                    ?.department?.name ?? '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ApprovalHistory
                            request={overtimeRequest}
                            canApprove={canApprove}
                            onApprove={() => handleStatusUpdate('approved')}
                            onReject={() => handleStatusUpdate('rejected')}
                        />
                    </div>

                    {/* Right Main Sections */}
                    <div className="space-y-8 pb-10 md:col-span-8">
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Date Summary */}
                            <div className="flex items-center justify-between rounded-xl border bg-card p-6 shadow-sm">
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Tanggal Lembur
                                    </p>
                                    <p className="text-lg font-bold">
                                        {formatDate(overtimeRequest.date)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
                                    <Calendar className="h-6 w-6 text-primary" />
                                </div>
                            </div>

                            {/* Duration Summary */}
                            <div className="flex items-center justify-between rounded-xl border bg-card p-6 shadow-sm">
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Total Durasi
                                    </p>
                                    <p className="text-2xl font-extrabold text-primary">
                                        {duration.label}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
                                    <Hourglass className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Detailed Content Card */}
                        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="border-b bg-muted/30 px-6 py-4">
                                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    Rincian Waktu & Pekerjaan
                                </h3>
                            </div>
                            <div className="space-y-10 p-8">
                                {/* Time Schedule Detail */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase">
                                        <Clock className="h-3.5 w-3.5" />
                                        Waktu Pelaksanaan
                                    </div>
                                    <div className="flex flex-wrap items-center justify-around gap-4">
                                        <div className="flex items-center gap-4 rounded-xl border bg-muted/20 px-6 py-4">
                                            <div className="text-center">
                                                <p className="mb-0.5 text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">
                                                    Mulai
                                                </p>
                                                <p className="text-2xl font-extrabold tracking-tight">
                                                    {formatTime(
                                                        overtimeRequest.start_time,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="mx-2 h-10 w-[1.5px] bg-muted-foreground/20"></div>
                                            <div className="text-center">
                                                <p className="mb-0.5 text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">
                                                    Selesai
                                                </p>
                                                <p className="text-2xl font-extrabold tracking-tight">
                                                    {formatTime(
                                                        overtimeRequest.end_time,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="text-md rounded-lg border px-3 py-1.5 font-bold shadow-sm"
                                        >
                                            {duration.hours} Jam Kerja Lembur
                                        </Badge>
                                    </div>
                                </div>

                                {/* Task Description Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase">
                                        <FileText className="h-3.5 w-3.5" />
                                        Deskripsi / Tugas Pekerjaan
                                    </div>
                                    <div className="group relative overflow-hidden rounded-xl border border-primary/10 bg-primary/2 p-6">
                                        <div className="absolute top-0 left-0 h-full w-1.5 bg-primary/40 transition-colors group-hover:bg-primary"></div>
                                        <p className="text-base leading-relaxed font-medium whitespace-pre-wrap text-foreground/90">
                                            {overtimeRequest.description ||
                                                'Tidak ada deskripsi pekerjaan yang dilampirkan.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 border-t border-dashed pt-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase opacity-70">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                        Diajukan pada{' '}
                                        {formatDatetime(
                                            overtimeRequest.created_at,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Update Dialog */}
                <Dialog
                    open={!!confirmAction}
                    onOpenChange={(open) => !open && setConfirmAction(null)}
                >
                    <DialogContent className="sm:max-w-106.25">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">
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
                                untuk pengajuan ini? Selesai instruksi ini,
                                status tidak dapat diubah kembali.
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
