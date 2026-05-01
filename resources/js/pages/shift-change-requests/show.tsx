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
    X,
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
import { cn } from '@/lib/utils';

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

export default function Show({ request }: { request: ShiftChangeRequest }) {
    const { can } = usePermissions();
    const { auth } = usePage().props as any;
    const currentUser = auth.user;

    console.log(request);

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

    const statusLabel =
        {
            pending_target: 'Menunggu Pengganti',
            pending_hrd: 'Menunggu HRD',
            pending_manager: 'Menunggu Karu',
            approved: 'Disetujui',
            rejected: 'Ditolak',
        }[request.status] || request.status;

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const UserCard = ({
        employee,
        label,
        isActive = false,
        status
    }: {
        employee: Employee,
        label: string,
        isActive?: boolean,
        status?: string
    }) => (
        <div className={cn(
            "relative flex flex-1 items-center gap-4 rounded-3xl p-6 transition-all duration-300",
            isActive
                ? "bg-blue-600/10 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                : "bg-zinc-900/40 border border-white/5"
        )}>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-zinc-400">
                {getInitials(employee.full_name)}
            </div>
            <div className="flex flex-col gap-0.5">
                <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    {label}
                </p>
                <h3 className="text-lg font-bold text-white">
                    {employee.full_name}
                </h3>
                <p className="text-xs text-zinc-400">
                    {employee.position?.name ?? 'Apoteker'}
                </p>
                <p className="text-xs text-zinc-500">
                    {employee.department?.name ?? 'Departemen tidak tersedia'}
                </p>
                {status && (
                    <div className="mt-2">
                        <Badge className={cn(
                            "px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            status === 'DIAJUKAN' ? "bg-blue-600 hover:bg-blue-600" : "bg-zinc-700 hover:bg-zinc-700"
                        )}>
                            {status}
                        </Badge>
                    </div>
                )}
            </div>
        </div>
    );

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
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-800">
                            <ArrowLeft className="h-5 w-5 text-zinc-400" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-semibold text-white">Detail Pengajuan Shift</h1>
                </div>

                {/* Top Section: Requester & Substitute */}
                <div className="flex flex-col items-center gap-4 md:flex-row">
                    <UserCard
                        employee={request.requester}
                        label="PEMOHON"
                        isActive={true}
                        status="DIAJUKAN"
                    />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/50">
                        <ArrowLeftRight className="h-5 w-5 text-zinc-500" />
                    </div>

                    <UserCard
                        employee={request.target}
                        label="PENGGANTI"
                        status={request.target_approved_at ? "DISETUJUI" : "STATUS"}
                    />
                </div>

                {/* Middle Content Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* Details Column */}
                    <div className="space-y-6 md:col-span-7">
                        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-8">
                            <h2 className="mb-6 text-sm font-bold tracking-widest text-white uppercase">
                                DETAIL PENGGANTIAN
                            </h2>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                                        <Calendar className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                                            TANGGAL PENGGANTIAN
                                        </p>
                                        <p className="text-sm font-bold text-white">
                                            {format(parseISO(request.request_date), 'dd MMMM yyyy', { locale: id })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-500/20 bg-zinc-500/10">
                                        <Clock className="h-6 w-6 text-zinc-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                                            SHIFT
                                        </p>
                                        <p className="text-sm font-bold text-white">
                                            {request.requester_shift?.name ?? '-'}
                                            {request.requester_shift && ` (${request.requester_shift.start_time.slice(0, 5)} - ${request.requester_shift.end_time.slice(0, 5)})`}
                                            {request.targetShift && (
                                                <span className="mx-2 text-zinc-500 font-normal">⇄</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h2 className="mb-4 text-sm font-bold tracking-widest text-white uppercase">
                                    ALASAN & CATATAN
                                </h2>
                                <div className="rounded-2xl bg-zinc-800/50 p-6">
                                    <p className="mb-4 text-sm font-medium text-zinc-300 italic">
                                        &quot;{request.reason || 'Tidak ada alasan yang diberikan.'}&quot;
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700">
                                            <User className="h-3 w-3" />
                                        </div>
                                        <span>
                                            Diajukan pada {format(parseISO(request.created_at), 'd MMMM yyyy', { locale: id })} pukul {format(parseISO(request.created_at), 'HH.mm')}
                                        </span>
                                    </div>
                                </div>

                                {request.notes && (
                                    <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                                        <p className="text-xs font-bold tracking-widest text-red-500 uppercase mb-2">CATATAN PENOLAKAN</p>
                                        <p className="text-sm font-medium text-red-400/90 italic">
                                            &quot;{request.notes}&quot;
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline Column */}
                    <div className="md:col-span-5">
                        <div className="h-full rounded-3xl border border-white/5 bg-zinc-900/40 p-8">
                            <h2 className="mb-8 text-sm font-bold tracking-widest text-zinc-500 uppercase">
                                RIWAYAT PERSETUJUAN
                            </h2>

                            <div className="relative space-y-8">
                                {/* Vertical Line */}
                                <div className="absolute left-3 top-3 h-[calc(100%-24px)] w-0.5 bg-zinc-800"></div>

                                {/* Step 1: Created */}
                                <div className="relative flex items-center gap-6">
                                    <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-zinc-900">
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <p className="text-sm font-medium text-white">Pengajuan dibuat</p>
                                </div>

                                {/* Step 2: Manager */}
                                <div className="relative flex items-center gap-6">
                                    <div className={cn(
                                        "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                                        request.manager_approved_at ? "bg-green-500 text-zinc-900" : "bg-zinc-800 text-zinc-500"
                                    )}>
                                        {request.manager_approved_at ? <Check className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                                    </div>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        request.manager_approved_at ? "text-white" : "text-zinc-500"
                                    )}>
                                        Persetujuan Kepala Ruangan
                                    </p>
                                </div>

                                {/* Step 3: HRD */}
                                <div className="relative flex items-center gap-6">
                                    <div className={cn(
                                        "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                                        request.hrd_approved_at || request.status === 'approved' ? "bg-green-500 text-zinc-900" :
                                            request.status === 'pending_hrd' ? "bg-orange-500 text-zinc-900" : "bg-zinc-800 text-zinc-500"
                                    )}>
                                        {request.hrd_approved_at || request.status === 'approved' ? <Check className="h-4 w-4" /> :
                                            request.status === 'pending_hrd' ? <Clock className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                                    </div>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        request.hrd_approved_at || request.status === 'approved' || request.status === 'pending_hrd' ? "text-white" : "text-zinc-500"
                                    )}>
                                        {request.status === 'pending_hrd' ? "Menunggu Persetujuan HRD" : "Persetujuan HRD"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                {request.status !== 'approved' && request.status !== 'rejected' && (
                    <div className="mt-4 flex gap-4">
                        {/* Reject Button */}
                        {(isHrd || (isManager && request.status === 'pending_manager')) && (
                            <Button
                                variant="destructive"
                                onClick={() => setConfirmAction({ type: 'reject', notes: '' })}
                                className="h-14 flex-1 rounded-2xl text-lg font-bold bg-red-600 hover:bg-red-700"
                            >
                                <X className="mr-2 h-6 w-6" /> Tolak
                            </Button>
                        )}

                        {/* Approve Buttons */}
                        {isHrd && (request.status === 'pending_hrd' || request.status === 'pending_manager') && (
                            <Button
                                onClick={() => setConfirmAction({ type: 'approve_hrd' })}
                                className="h-14 flex-1 rounded-2xl text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
                            >
                                <UserCheck className="mr-2 h-6 w-6" />
                                {request.status !== 'pending_hrd' ? 'Bypass & Setujui (HRD)' : 'Setujui (HRD)'}
                            </Button>
                        )}

                        {isManager && request.status === 'pending_manager' && !isHrd && (
                            <Button
                                onClick={() => setConfirmAction({ type: 'approve_manager' })}
                                className="h-14 flex-1 rounded-2xl text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
                            >
                                <UserCheck className="mr-2 h-6 w-6" /> Setujui (Karu)
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Confirmation Dialogs remain largely the same in logic but styled to match */}
            <Dialog open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}>
                <DialogContent className="border-white/5 bg-zinc-900 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {confirmAction?.type === 'reject' ? 'Konfirmasi Penolakan' : 'Konfirmasi Persetujuan'}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm text-zinc-400">
                            {confirmAction?.type === 'reject' ? (
                                <>
                                    Apakah Anda yakin ingin menolak pengajuan ini? Tindakan ini tidak dapat dibatalkan.
                                    <div className="mt-4 space-y-2">
                                        <Label htmlFor="notes" className="text-white">Alasan Penolakan</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Masukkan alasan penolakan..."
                                            value={confirmAction.notes}
                                            onChange={(e) => setConfirmAction({ ...confirmAction, notes: e.target.value })}
                                            className="min-h-20 bg-zinc-800 border-white/10 text-white"
                                        />
                                    </div>
                                </>
                            ) : (
                                "Apakah Anda yakin ingin menyetujui pengajuan ini? Tindakan ini tidak dapat dibatalkan."
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 border-white/10 hover:bg-zinc-800 text-white"
                            onClick={() => setConfirmAction(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant={confirmAction?.type === 'reject' ? 'destructive' : 'default'}
                            className={cn(
                                "flex-1",
                                confirmAction?.type !== 'reject' ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                            )}
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
