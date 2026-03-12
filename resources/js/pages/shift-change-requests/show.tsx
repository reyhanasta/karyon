import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    CalendarDays,
    Clock,
    User2,
    UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';

type Shift = { id: number; name: string; start_time: string; end_time: string };
type Employee = { id: number; full_name: string; user_id: number };
type ShiftChangeRequest = {
    id: number;
    requester: Employee;
    target: Employee;
    request_date: string;
    requesterShift: Shift;
    reason: string;
    status: 'pending_target' | 'pending_hrd' | 'approved' | 'rejected';
    target_approved_at: string | null;
    targetApprovedBy?: { name: string };
    hrd_approved_at: string | null;
    hrdApprovedBy?: { name: string };
    notes: string | null;
    created_at: string;
};

export default function Show({ request }: { request: ShiftChangeRequest }) {
    const { can } = usePermissions();
    const { auth } = usePage().props as any;
    const currentUser = auth.user;

    const isTarget = request.target.user_id === currentUser.id;
    const isHrd = can('shift-change.approve.hrd');

    const handleApproveTarget = () => {
        if (confirm('Konfirmasi bahwa Anda bersedia menggantikan shift ini?')) {
            router.post(
                `/shift-change-requests/${request.id}/approve-target`,
                {},
                { preserveScroll: true },
            );
        }
    };

    const handleApproveHrd = () => {
        if (confirm('Setujui pengajuan penggantian shift ini secara final?')) {
            router.post(
                `/shift-change-requests/${request.id}/approve-hrd`,
                {},
                { preserveScroll: true },
            );
        }
    };

    const handleReject = () => {
        const notes = prompt('Masukkan alasan penolakan:');
        if (notes) {
            router.post(
                `/shift-change-requests/${request.id}/reject`,
                { notes },
                { preserveScroll: true },
            );
        }
    };

    const statusConfig: Record<string, { label: string; className: string }> = {
        pending_target: {
            label: 'Menunggu Konfirmasi Pengganti',
            className: 'bg-yellow-100 text-yellow-800',
        },
        pending_hrd: {
            label: 'Menunggu Persetujuan HRD',
            className: 'bg-blue-100 text-blue-800',
        },
        approved: {
            label: 'Disetujui',
            className: 'bg-green-100 text-green-800',
        },
        rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusConfig[request.status] ?? {
        label: request.status,
        className: '',
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Penggantian Shift', href: '/shift-change-requests' },
                {
                    title: 'Detail',
                    href: `/shift-change-requests/${request.id}`,
                },
            ]}
        >
            <Head title="Detail Penggantian Shift" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 lg:p-8">
                <Button variant="ghost" className="-ml-2 w-fit" asChild>
                    <Link href="/shift-change-requests">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Detail Penggantian Shift
                    </h2>
                    <Badge variant="secondary" className={statusInfo.className}>
                        {statusInfo.label}
                    </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Info utama */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Informasi Pengajuan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Tanggal Penggantian
                                    </p>
                                    <p className="font-semibold">
                                        {format(
                                            parseISO(request.request_date),
                                            'EEEE, dd MMMM yyyy',
                                            { locale: id },
                                        )}
                                    </p>
                                </div>
                            </div>
                            {/* <div className="flex items-start gap-3">
                                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Shift yang Digantikan
                                    </p>
                                    <p className="font-semibold">
                                        {request.requesterShift?.name ?? '-'}
                                        {request.requesterShift && (
                                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                (
                                                {request.requesterShift.start_time?.slice(
                                                    0,
                                                    5,
                                                )}{' '}
                                                –{' '}
                                                {request.requesterShift.end_time?.slice(
                                                    0,
                                                    5,
                                                )}
                                                )
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div> */}
                            <div className="flex items-start gap-3">
                                <User2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Pemohon
                                    </p>
                                    <p className="font-semibold">
                                        {request.requester.full_name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <UserCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Karyawan Pengganti
                                    </p>
                                    <p className="font-semibold">
                                        {request.target.full_name}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alasan & Catatan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Alasan & Catatan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">
                                    Alasan
                                </p>
                                <p className="rounded-md bg-muted p-3 leading-relaxed">
                                    {request.reason}
                                </p>
                            </div>
                            {request.notes && (
                                <div>
                                    <p className="mb-1 text-xs font-medium text-destructive">
                                        Catatan Penolakan
                                    </p>
                                    <p className="rounded-md bg-destructive/10 p-3 leading-relaxed text-destructive">
                                        {request.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Approval timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Riwayat Persetujuan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
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

                            {/* Step 2: Konfirmasi Pengganti */}
                            <li className="ms-6">
                                <span
                                    className={`absolute -inset-s-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${request.target_approved_at ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}
                                >
                                    {request.status === 'rejected' &&
                                    !request.target_approved_at ? (
                                        <XCircle className="h-3.5 w-3.5" />
                                    ) : (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    )}
                                </span>
                                <h3 className="text-sm font-medium">
                                    Konfirmasi oleh {request.target.full_name}{' '}
                                    (Pengganti)
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {request.target_approved_at
                                        ? `Dikonfirmasi · ${format(parseISO(request.target_approved_at), 'dd MMM yyyy, HH:mm', { locale: id })}`
                                        : request.status === 'rejected'
                                          ? 'Ditolak'
                                          : 'Menunggu konfirmasi…'}
                                </p>
                            </li>

                            {/* Step 3: HRD */}
                            <li className="ms-6">
                                <span
                                    className={`absolute -inset-s-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${request.hrd_approved_at ? (request.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600') : 'bg-muted text-muted-foreground'}`}
                                >
                                    {request.status === 'approved' ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    ) : (
                                        <XCircle className="h-3.5 w-3.5" />
                                    )}
                                </span>
                                <h3 className="text-sm font-medium">
                                    Persetujuan HRD / Manajemen
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {request.hrd_approved_at
                                        ? `${request.status === 'approved' ? 'Disetujui' : 'Ditolak'} oleh ${request.hrdApprovedBy?.name ?? 'HRD'} · ${format(parseISO(request.hrd_approved_at), 'dd MMM yyyy, HH:mm', { locale: id })}`
                                        : 'Menunggu persetujuan HRD…'}
                                </p>
                            </li>
                        </ol>
                    </CardContent>
                </Card>

                {/* Action buttons */}
                {request.status !== 'approved' &&
                    request.status !== 'rejected' && (
                        <div className="flex justify-end gap-3">
                            {/* Reject: bisa dilakukan target (saat pending_target) atau HRD */}
                            {(isTarget &&
                                request.status === 'pending_target') ||
                            isHrd ? (
                                <Button
                                    variant="destructive"
                                    onClick={handleReject}
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Tolak
                                </Button>
                            ) : null}

                            {/* Target approve */}
                            {isTarget &&
                                request.status === 'pending_target' && (
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={handleApproveTarget}
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />{' '}
                                        Saya Bersedia Menggantikan
                                    </Button>
                                )}

                            {/* HRD approve (dengan bypass jika masih pending_target) */}
                            {isHrd &&
                                (request.status === 'pending_hrd' ||
                                    request.status === 'pending_target') && (
                                    <Button onClick={handleApproveHrd}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        {request.status === 'pending_target'
                                            ? 'Bypass & Setujui'
                                            : 'Setujui (HRD)'}
                                    </Button>
                                )}
                        </div>
                    )}
            </div>
        </AppLayout>
    );
}
