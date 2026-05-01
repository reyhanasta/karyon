import { Head, Link, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    ArrowLeft,
    Calendar,
    CalendarDays,
    CheckCircle,
    CheckCircle2,
    Clock,
    FileText,
    User2,
    UserCheck,
    XCircle,
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';

type Shift = { id: number; name: string; start_time: string; end_time: string };
type Employee = {
    id: number;
    full_name: string;
    user_id: number;
    department?: { name: string };
    position?: { name: string };
};
type ShiftChangeRequest = {
    id: number;
    requester: Employee;
    target: Employee;
    request_date: string;
    requesterShift: Shift;
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

export default function Show({ request }: { request: ShiftChangeRequest }) {
    const { can } = usePermissions();
    const { auth } = usePage().props as any;
    const currentUser = auth.user;

    const isHrd = can('shift-change.approve.hrd');
    const isManager = can('shift-change.approve.manager');

    const [confirmAction, setConfirmAction] = useState<{
        type: 'approve_hrd' | 'approve_manager' | 'reject';
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
        }

        router.post(url, data, {
            preserveScroll: true,
            onSuccess: () => setConfirmAction(null),
        });
    };

    const statusColor =
        {
            pending_target:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800/40',
            pending_hrd:
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500 border-blue-200 dark:border-blue-800/40',
            pending_manager:
                'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500 border-purple-200 dark:border-purple-800/40',
            approved:
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 border-green-200 dark:border-green-800/40',
            rejected:
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500 border-red-200 dark:border-red-800/40',
        }[request.status] || 'bg-gray-100 text-gray-800 border-gray-200';

    const statusLabel =
        {
            pending_target: 'Menunggu Pengganti',
            pending_hrd: 'Menunggu HRD',
            pending_manager: 'Menunggu Karu',
            approved: 'Disetujui',
            rejected: 'Ditolak',
        }[request.status] || request.status;

    const statusIcon = request.status.startsWith('pending') ? (
        <Clock className="h-6 w-6" />
    ) : request.status === 'approved' ? (
        <CheckCircle className="h-6 w-6" />
    ) : (
        <XCircle className="h-6 w-6" />
    );

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
            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-6 p-4 lg:p-8">
                {/* Header Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/shift-change-requests">
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
                                Detail Penggantian Shift
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
                <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-12">
                    {/* Left Column: Sidebar Cards */}
                    <div className="space-y-4 md:col-span-4">
                        {/* Requester Card */}
                        <div className="space-y-4 overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="border-b bg-muted/30 px-6 py-2">
                                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    Pemohon
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-primary/10 text-2xl font-bold text-primary shadow-sm">
                                        {getInitials(request.requester.full_name)}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold">
                                            {request.requester.full_name}
                                        </p>
                                        <div className="flex flex-col items-center gap-1">
                                            <Badge
                                                variant="outline"
                                                className="font-medium"
                                            >
                                                {request.requester.position?.name ??
                                                    'Posisi tidak diketahui'}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {request.requester.department?.name ??
                                                    'Departemen tidak diketahui'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Target Card */}
                        <div className="space-y-4 overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="border-b bg-muted/30 px-6 py-2">
                                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    Pengganti
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-secondary/10 text-2xl font-bold text-secondary-foreground shadow-sm">
                                        {getInitials(request.target.full_name)}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold">
                                            {request.target.full_name}
                                        </p>
                                        <div className="flex flex-col items-center gap-1">
                                            <Badge
                                                variant="outline"
                                                className="font-medium"
                                            >
                                                {request.target.position?.name ??
                                                    'Posisi tidak diketahui'}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {request.target.department?.name ??
                                                    'Departemen tidak diketahui'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Approval History */}
                        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="border-b bg-muted/30 px-6 py-4">
                                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    Riwayat Persetujuan
                                </h3>
                            </div>
                            <div className="p-6">
                                <ol className="relative ms-3 space-y-6 border-s border-muted-foreground/20">
                                    {/* Step 1 */}
                                    <li className="ms-6">
                                        <span className="absolute -inset-s-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 ring-4 ring-background">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        </span>
                                        <h3 className="text-sm font-medium">
                                            Pengajuan dibuat
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {request.requester.full_name} ·{' '}
                                            {format(
                                                parseISO(request.created_at),
                                                'dd MMM yyyy, HH:mm',
                                                { locale: id },
                                            )}
                                        </p>
                                    </li>

                                    {/* Step 2: Karu / Manager */}
                                    <li className="ms-6">
                                        <span
                                            className={`absolute -inset-s-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${request.manager_approved_at ? 'bg-green-100 text-green-600' : request.status === 'rejected' && !!request.managerApprovedBy ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'}`}
                                        >
                                            {request.manager_approved_at ? (
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            ) : request.status === 'rejected' &&
                                              !!request.managerApprovedBy ? (
                                                <XCircle className="h-3.5 w-3.5" />
                                            ) : (
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            )}
                                        </span>
                                        <h3 className="text-sm font-medium">
                                            Persetujuan Kepala Ruangan
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {request.manager_approved_at
                                                ? `Disetujui oleh ${request.managerApprovedBy?.name ?? 'Kepala Ruangan'} · ${format(parseISO(request.manager_approved_at), 'dd MMM yyyy, HH:mm', { locale: id })}`
                                                : request.status === 'rejected' &&
                                                    !!request.managerApprovedBy
                                                  ? 'Ditolak oleh Kepala Ruangan'
                                                  : request.status === 'pending_manager'
                                                    ? 'Sedang diproses…'
                                                    : 'Menunggu…'}
                                        </p>
                                    </li>

                                    {/* Step 3: HRD */}
                                    <li className="ms-6">
                                        <span
                                            className={`absolute -inset-s-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${request.hrd_approved_at || request.status === 'approved' ? 'bg-green-100 text-green-600' : request.status === 'rejected' && !!request.hrdApprovedBy ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'}`}
                                        >
                                            {request.hrd_approved_at ||
                                            request.status === 'approved' ? (
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            ) : request.status === 'rejected' &&
                                              !!request.hrdApprovedBy ? (
                                                <XCircle className="h-3.5 w-3.5" />
                                            ) : (
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            )}
                                        </span>
                                        <h3 className="text-sm font-medium">
                                            Persetujuan HRD
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {request.hrd_approved_at ||
                                            request.status === 'approved'
                                                ? `Disetujui oleh ${request.hrdApprovedBy?.name ?? 'HRD'} · ${request.hrd_approved_at ? format(parseISO(request.hrd_approved_at), 'dd MMM yyyy, HH:mm', { locale: id }) : '-'}`
                                                : request.status === 'rejected' &&
                                                    !!request.hrdApprovedBy
                                                  ? 'Ditolak oleh HRD'
                                                  : request.status === 'pending_hrd'
                                                    ? 'Sedang diproses…'
                                                    : 'Menunggu…'}
                                        </p>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detail Content */}
                    <div className="space-y-8 pb-10 md:col-span-8">
                        {/* Summary Details */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Date Info */}
                            <div className="flex items-center justify-between rounded-xl border bg-card p-6 shadow-sm">
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Tanggal Penggantian
                                    </p>
                                    <p className="text-lg font-bold">
                                        {format(
                                            parseISO(request.request_date),
                                            'dd MMMM yyyy',
                                            { locale: id },
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
                                    <CalendarDays className="h-6 w-6 text-primary" />
                                </div>
                            </div>

                            {/* Shift Info */}
                            <div className="flex items-center justify-between rounded-xl border bg-card p-6 shadow-sm">
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Shift
                                    </p>
                                    <p className="text-lg font-bold">
                                        {request.requesterShift?.name ?? '-'}
                                        {request.requesterShift && (
                                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                                ({request.requesterShift.start_time?.slice(0, 5)} – {request.requesterShift.end_time?.slice(0, 5)})
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
                                    <Clock className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Main Detail Card */}
                        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                            <div className="border-b bg-muted/30 px-6 py-4">
                                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    Alasan & Catatan
                                </h3>
                            </div>
                            <div className="space-y-10 p-8">
                                {/* Reason Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase">
                                        <FileText className="h-3.5 w-3.5" />
                                        Alasan Pengajuan
                                    </div>
                                    <div className="relative overflow-hidden rounded-xl border border-primary/10 bg-primary/2 p-6">
                                        <div className="absolute top-0 left-0 h-full w-1.5 bg-primary/40"></div>
                                        <p className="text-base leading-relaxed font-medium text-foreground/90 italic">
                                            &quot;
                                            {request.reason ||
                                                'Tidak ada alasan yang diberikan.'}
                                            &quot;
                                        </p>
                                    </div>
                                </div>

                                {/* Notes Section (if rejected) */}
                                {request.notes && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-destructive/80 uppercase">
                                            <XCircle className="h-3.5 w-3.5 text-destructive" />
                                            Catatan Penolakan
                                        </div>
                                        <div className="relative overflow-hidden rounded-xl border border-destructive/10 bg-destructive/5 p-6">
                                            <div className="absolute top-0 left-0 h-full w-1.5 bg-destructive/40"></div>
                                            <p className="text-base leading-relaxed font-medium text-destructive italic">
                                                &quot;{request.notes}&quot;
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 border-t border-dashed pt-4 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                        Diajukan pada{' '}
                                        {formatDatetime(request.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        {request.status !== 'approved' &&
                            request.status !== 'rejected' && (
                                <div className="flex justify-end gap-3 pt-4">
                                    {/* Reject: bisa dilakukan Karu (saat pending_manager) atau HRD */}
                                    {isHrd ||
                                    (isManager &&
                                        request.status === 'pending_manager') ? (
                                        <Button
                                            variant="destructive"
                                            onClick={() => setConfirmAction({ type: 'reject', notes: '' })}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" /> Tolak
                                        </Button>
                                    ) : null}

                                    {/* HRD approve (dengan bypass) */}
                                    {isHrd &&
                                        (request.status === 'pending_hrd' ||
                                            request.status === 'pending_manager') && (
                                            <Button
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => setConfirmAction({ type: 'approve_hrd' })}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                {request.status !== 'pending_hrd'
                                                    ? 'Bypass & Setujui (HRD)'
                                                    : 'Setujui (HRD)'}
                                            </Button>
                                        )}

                                    {/* Manager approve */}
                                    {isManager &&
                                        request.status === 'pending_manager' && (
                                            <Button
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => setConfirmAction({ type: 'approve_manager' })}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Setujui (Karu)
                                            </Button>
                                        )}
                                </div>
                            )}
                    </div>
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
                            {confirmAction?.type === 'reject' ? 'Konfirmasi Penolakan' : 'Konfirmasi Persetujuan'}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm">
                            {confirmAction?.type === 'reject' ? (
                                <>
                                    Apakah Anda yakin ingin menolak pengajuan ini? Tindakan ini tidak dapat dibatalkan.
                                    <div className="mt-4 space-y-2">
                                        <Label htmlFor="notes">Alasan Penolakan</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Masukkan alasan penolakan..."
                                            value={confirmAction.notes}
                                            onChange={(e) => setConfirmAction({ ...confirmAction, notes: e.target.value })}
                                            className="min-h-20"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    Apakah Anda yakin ingin menyetujui pengajuan ini? Tindakan ini tidak dapat dibatalkan.
                                </>
                            )}
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
                            variant={confirmAction?.type === 'reject' ? 'destructive' : 'default'}
                            className={`flex-1 ${confirmAction?.type !== 'reject' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            onClick={executeAction}
                        >
                            Ya, Lanjutkan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
