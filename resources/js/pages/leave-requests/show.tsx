import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Check,
    FileText,
    Paperclip,
    User,
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
    employee?: { full_name: string };
    leave_type?: { name: string };
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
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
            approved:
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
            rejected:
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
        }[leaveRequest.status] || 'bg-gray-100 text-gray-800';

    const statusLabel =
        {
            pending: 'Menunggu',
            approved: 'Disetujui',
            rejected: 'Ditolak',
        }[leaveRequest.status] || leaveRequest.status;

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
            <div className="mx-auto flex h-full w-full max-w-3xl flex-1 flex-col gap-4 p-4 lg:p-8">
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
                                Detail Pengajuan Cuti
                            </h2>
                            <p className="text-muted-foreground">
                                Informasi lengkap terkait pengajuan cuti.
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

                <div className="overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm">
                    <div className="border-b px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                Informasi Cuti
                            </h3>
                            <Badge className={statusColor} variant="outline">
                                {statusLabel}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid gap-4 p-6 sm:grid-cols-2">
                        <div className="space-y-1">
                            <div className="flex items-center text-sm font-medium text-muted-foreground">
                                <User className="mr-2 h-4 w-4" />
                                Karyawan
                            </div>
                            <p className="font-medium">
                                {leaveRequest.employee?.full_name}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center text-sm font-medium text-muted-foreground">
                                <FileText className="mr-2 h-4 w-4" />
                                Jenis Cuti
                            </div>
                            <p className="font-medium">
                                {leaveRequest.leave_type?.name ?? '-'}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center text-sm font-medium text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4" />
                                Tanggal Mulai
                            </div>
                            <p className="font-medium">
                                {leaveRequest.start_date}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center text-sm font-medium text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4" />
                                Tanggal Selesai
                            </div>
                            <p className="font-medium">
                                {leaveRequest.end_date}
                            </p>
                        </div>

                        <div className="col-span-1 mt-2 space-y-1 sm:col-span-2">
                            <div className="flex items-center text-sm font-medium text-muted-foreground">
                                <FileText className="mr-2 h-4 w-4" />
                                Alasan Cuti
                            </div>
                            <div className="rounded-md bg-muted/50 p-3 text-sm">
                                {leaveRequest.reason || '-'}
                            </div>
                        </div>

                        {leaveRequest.attachment_path && (
                            <div className="col-span-1 mt-2 space-y-1 sm:col-span-2">
                                <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <Paperclip className="mr-2 h-4 w-4" />
                                    Lampiran
                                </div>
                                <div>
                                    <a
                                        href={`/storage/${leaveRequest.attachment_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                                    >
                                        <Paperclip className="mr-1 h-3 w-3" />
                                        Lihat Lampiran
                                    </a>
                                </div>
                            </div>
                        )}
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
                                {confirmAction?.status === 'approved'
                                    ? 'Setujui'
                                    : 'Tolak'}{' '}
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
