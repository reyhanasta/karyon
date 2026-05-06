import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    Hourglass,
    XCircle,
    Edit,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { ApprovalHistory } from '@/components/approval-history';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type OvertimeRequestData = {
    id: number;
    employee_id: number;
    date: string;
    start_time: string;
    end_time: string;
    description: string;
    status: string;
    is_display_export: boolean;
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
};

export default function Show({
    overtimeRequest,
    canApprove,
    canEdit,
}: {
    overtimeRequest: OvertimeRequestData;
    canApprove: boolean;
    canEdit?: boolean;
}) {
    const { auth } = usePage().props as any;
    const currentUser = auth.user;
    const statusColor =
        {
            pending_hrd:
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 border-amber-200 dark:border-amber-800/40',
            pending_manager:
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 border-amber-200 dark:border-amber-800/40',
            pending:
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 border-amber-200 dark:border-amber-800/40',
            approved:
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500 border-emerald-200 dark:border-emerald-800/40',
            rejected:
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500 border-red-200 dark:border-red-800/40',
            canceled:
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500 border-red-200 dark:border-red-800/40',
        }[overtimeRequest.status] ||
        'bg-gray-100 text-gray-800 border-gray-200';

    const statusLabel =
        {
            pending: 'Menunggu',
            pending_hrd: 'Menunggu HRD',
            pending_manager: 'Menunggu Karu',
            approved: 'Disetujui',
            rejected: 'Ditolak',
            canceled: 'Dibatalkan',
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
        status: 'approved' | 'rejected' | 'cancel';
    } | null>(null);

    const handleStatusUpdate = (status: 'approved' | 'rejected') => {
        setConfirmAction({ status });
    };

    const executeStatusUpdate = () => {
        if (!confirmAction) return;

        if (confirmAction.status === 'cancel') {
            router.post(
                `/overtime-requests/${overtimeRequest.id}/cancel`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => setConfirmAction(null),
                }
            );
            return;
        }

        router.post(
            `/overtime-requests/${overtimeRequest.id}/status`,
            { status: confirmAction.status },
            {
                preserveScroll: true,
                onSuccess: () => setConfirmAction(null),
            },
        );
    };

    const handleCancel = () => {
        setConfirmAction({ status: 'cancel' });
    };

    const handleToggleExport = () => {
        router.post(`/overtime-requests/${overtimeRequest.id}/toggle-export`, {}, {
            preserveScroll: true,
        });
    };

    const isHRD = currentUser.roles.includes('hr-admin') || currentUser.roles.includes('super-admin');

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
                    <div className="flex flex-row items-center justify-between gap-2">
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
                        <div
                            className={`inline-flex items-center gap-3 rounded-sm border px-4 py-2 ${statusColor} bg-opacity-10 shadow-sm`}
                        >
                            <div className="opacity-80">{statusIcon}</div>
                            <div>
                                <p className="text-sm font-extrabold uppercase">
                                    {statusLabel}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {(overtimeRequest.status.startsWith('pending') && !overtimeRequest.manager_approver) && (
                            <>
                                {(overtimeRequest.employee_id ===
                                    currentUser.employee?.id ||
                                    canEdit) && (
                                        <Link
                                            href={`/overtime-requests/${overtimeRequest.id}/edit`}
                                        >
                                            <Button variant="outline" size="lg">
                                                <Edit className="h-4 w-4" /> Edit
                                            </Button>
                                        </Link>
                                    )}
                                {overtimeRequest.employee_id ===
                                    currentUser.employee?.id && (
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
                                            onClick={handleCancel}
                                        >
                                            <X className="h-4 w-4" /> Batalkan
                                        </Button>
                                    )}
                            </>
                        )}
                    </div>

                    {/* Status Badge in Header */}
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
                            showDirectorStep={false}
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
                        {isHRD && (
                            <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                                <div className="space-y-0.5">
                                    <Label htmlFor="export-toggle" className="text-sm font-bold tracking-tight">
                                        Tampilkan di Export Data
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Jika diaktifkan, data lembur ini akan muncul saat melakukan export Excel/PDF.
                                    </p>
                                </div>
                                <Checkbox
                                    id="export-toggle"
                                    checked={overtimeRequest.is_display_export}
                                    onCheckedChange={handleToggleExport}
                                    className="h-5 w-5 cursor-pointer"
                                />
                            </div>
                        )}
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
                <ConfirmationModal
                    isOpen={!!confirmAction}
                    onClose={() => setConfirmAction(null)}
                    onConfirm={executeStatusUpdate}
                    title={
                        confirmAction?.status === 'cancel'
                            ? 'Konfirmasi Pembatalan'
                            : 'Konfirmasi Persetujuan'
                    }
                    description={
                        confirmAction?.status === 'cancel' ? (
                            'Apakah Anda yakin ingin membatalkan pengajuan ini? Tindakan ini tidak dapat dibatalkan.'
                        ) : (
                            <>
                                Apakah Anda yakin ingin melakukan aksi{' '}
                                <strong
                                    className={
                                        confirmAction?.status === 'approved'
                                            ? 'text-primary'
                                            : 'text-destructive'
                                    }
                                >
                                    {confirmAction?.status === 'approved'
                                        ? 'Setujui'
                                        : 'Tolak'}
                                </strong>{' '}
                                untuk pengajuan ini? Selesai instruksi ini,
                                status tidak dapat diubah kembali.
                            </>
                        )
                    }
                    confirmText={
                        confirmAction?.status === 'cancel'
                            ? 'Ya, Batalkan'
                            : 'Ya, Lanjutkan'
                    }
                    variant={
                        confirmAction?.status === 'rejected' ||
                            confirmAction?.status === 'cancel'
                            ? 'destructive'
                            : 'default'
                    }
                />
            </div>
        </AppLayout>
    );
}
