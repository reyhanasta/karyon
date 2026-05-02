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

export default function Show({ request, canEdit }: { request: ShiftChangeRequest, canEdit?: boolean }) {
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

    const cancelRequest = () => {
        if (confirm('Apakah Anda yakin ingin membatalkan pengajuan ini?')) {
            router.post(`/shift-change-requests/${request.id}/cancel`);
        }
    };

    const statusLabel =
        {
            pending_target: 'Menunggu Pengganti',
            pending_hrd: 'Menunggu HRD',
            pending_manager: 'Menunggu Karu',
            approved: 'Disetujui',
            rejected: 'Ditolak',
            cancelled: 'Dibatalkan',
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
            "relative flex flex-1 items-center gap-4 rounded-3xl p-6 transition-all duration-500",
            isActive
                ? "bg-primary/5 border-2 border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
                : "bg-card border border-border/50 shadow-sm hover:shadow-md hover:border-border transition-shadow"
        )}>
            <div className={cn(
                "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold transition-transform duration-500 hover:scale-105",
                isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "bg-muted text-muted-foreground"
            )}>
                {getInitials(employee.full_name)}
            </div>
            <div className="flex flex-col gap-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    {label}
                </p>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                    {employee.full_name}
                </h3>
                <div className="flex flex-col">
                    <p className="text-xs font-medium text-muted-foreground">
                        {employee.position?.name ?? 'Apoteker'}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60">
                        {employee.department?.name ?? 'Departemen tidak tersedia'}
                    </p>
                </div>
                {status && (
                    <div className="mt-2">
                        <Badge 
                            variant={status === 'DIAJUKAN' ? 'default' : 'secondary'}
                            className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                        >
                            {status}
                        </Badge>
                    </div>
                )}
            </div>
            {isActive && (
                <div className="absolute top-4 right-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                </div>
            )}
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
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted transition-colors">
                            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">Detail Pengajuan Shift</h1>
                        <p className="text-xs text-muted-foreground font-medium">Informasi lengkap penggantian jadwal kerja antar karyawan</p>
                    </div>
                    
                    <div className="ml-auto flex gap-2">
                        {request.status.startsWith('pending') && (request.requester.id === auth.user.employee?.id || canEdit) && (
                            <>
                                <Link href={`/shift-change-requests/${request.id}/edit`}>
                                    <Button variant="outline" size="sm" className="rounded-xl shadow-sm hover:bg-accent">
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Button>
                                </Link>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-xl border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors"
                                    onClick={cancelRequest}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Batalkan
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Top Section: Requester & Substitute */}
                <div className="flex flex-col items-center gap-6 md:flex-row">
                    <UserCard
                        employee={request.requester}
                        label="PEMOHON"
                        isActive={true}
                        status="DIAJUKAN"
                    />

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-background shadow-sm dark:bg-muted/30">
                        <ArrowLeftRight className="h-5 w-5 text-primary animate-pulse" />
                    </div>

                    <UserCard
                        employee={request.target}
                        label="PENGGANTI"
                        status={request.target_approved_at ? "DISETUJUI" : "MENUNGGU"}
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
                                            {format(parseISO(request.request_date), 'dd MMMM yyyy', { locale: id })}
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
                                            {request.requester_shift?.name ?? '-'}
                                            <span className="ml-1 text-xs font-medium text-muted-foreground">
                                                ({request.requester_shift?.start_time.slice(0, 5)} - {request.requester_shift?.end_time.slice(0, 5)})
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
                                        <p className="text-sm font-medium leading-relaxed text-foreground italic">
                                            &quot;{request.reason || 'Tidak ada alasan yang diberikan.'}&quot;
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-4 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm">
                                                <User className="h-3 w-3" />
                                            </div>
                                            <span>
                                                Diajukan {format(parseISO(request.created_at), 'd MMM yyyy', { locale: id })} • {format(parseISO(request.created_at), 'HH.mm')}
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
                                            <p className="text-sm font-semibold leading-relaxed text-destructive/90 italic">
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
                        <div className="h-full rounded-[2rem] border border-border bg-card p-8 shadow-sm dark:shadow-none flex flex-col">
                            <h2 className="mb-10 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                                Riwayat Persetujuan
                            </h2>

                            <div className="relative flex-1 space-y-10 pl-2">
                                {/* Vertical Line with Gradient */}
                                <div className="absolute left-[1.15rem] top-3 h-[calc(100%-24px)] w-0.5 bg-gradient-to-b from-primary via-muted to-muted/30"></div>

                                {/* Step 1: Created */}
                                <div className="relative flex items-start gap-6">
                                    <div className="z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background">
                                        <Check className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Pengajuan Dibuat</p>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase mt-0.5 tracking-tight">Karyawan Pemohon</p>
                                    </div>
                                </div>

                                {/* Step 2: Manager */}
                                <div className="relative flex items-start gap-6">
                                    <div className={cn(
                                        "z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ring-4 ring-background",
                                        request.manager_approved_at 
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                                            : request.status === 'pending_manager' 
                                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 animate-pulse" 
                                                : "bg-muted text-muted-foreground shadow-inner"
                                    )}>
                                        {request.manager_approved_at ? <Check className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                                    </div>
                                    <div>
                                        <p className={cn(
                                            "text-sm font-bold",
                                            request.manager_approved_at || request.status === 'pending_manager' ? "text-foreground" : "text-muted-foreground/60"
                                        )}>
                                            Persetujuan Kepala Ruangan
                                        </p>
                                        {request.manager_approved_at && (
                                            <p className="text-[10px] font-bold text-primary uppercase mt-0.5 tracking-tight">Disetujui</p>
                                        )}
                                    </div>
                                </div>

                                {/* Step 3: HRD */}
                                <div className="relative flex items-start gap-6">
                                    <div className={cn(
                                        "z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ring-4 ring-background",
                                        request.hrd_approved_at || request.status === 'approved' 
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                                            : request.status === 'pending_hrd' 
                                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 animate-pulse" 
                                                : "bg-muted text-muted-foreground shadow-inner"
                                    )}>
                                        {request.hrd_approved_at || request.status === 'approved' ? <Check className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                                    </div>
                                    <div>
                                        <p className={cn(
                                            "text-sm font-bold",
                                            request.hrd_approved_at || request.status === 'approved' || request.status === 'pending_hrd' ? "text-foreground" : "text-muted-foreground/60"
                                        )}>
                                            Persetujuan HRD
                                        </p>
                                        {(request.hrd_approved_at || request.status === 'approved') && (
                                            <p className="text-[10px] font-bold text-primary uppercase mt-0.5 tracking-tight">Final Disetujui</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {request.status !== 'approved' && request.status !== 'rejected' && (
                                <div className="mt-12 flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        {/* Reject Button */}
                                        {(isHrd || (isManager && request.status === 'pending_manager')) && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setConfirmAction({ type: 'reject', notes: '' })}
                                                className="flex-1 rounded-2xl border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 font-bold h-12"
                                            >
                                                <X className="mr-2 h-4 w-4" /> Tolak
                                            </Button>
                                        )}

                                        {/* Approve Buttons */}
                                        {isHrd && (request.status === 'pending_hrd' || request.status === 'pending_manager') && (
                                            <Button
                                                onClick={() => setConfirmAction({ type: 'approve_hrd' })}
                                                className="flex-1 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 font-bold h-12"
                                            >
                                                <UserCheck className="mr-2 h-4 w-4" />
                                                {request.status !== 'pending_hrd' ? 'Bypass HRD' : 'Setujui HRD'}
                                            </Button>
                                        )}

                                        {isManager && request.status === 'pending_manager' && !isHrd && (
                                            <Button
                                                onClick={() => setConfirmAction({ type: 'approve_manager' })}
                                                className="flex-1 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 font-bold h-12"
                                            >
                                                <UserCheck className="mr-2 h-4 w-4" /> Setujui Karu
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Bottom Actions */}

            </div>

            {/* Confirmation Dialogs remain largely the same in logic but styled to match */}
            <Dialog open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}>
                <DialogContent className="rounded-[2rem] border-border bg-card text-foreground sm:max-w-[450px] p-0 overflow-hidden shadow-2xl">
                    <div className={cn(
                        "p-8",
                        confirmAction?.type === 'reject' ? "bg-destructive/5" : "bg-primary/5"
                    )}>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                {confirmAction?.type === 'reject' ? 'Konfirmasi Penolakan' : 'Konfirmasi Persetujuan'}
                            </DialogTitle>
                            <DialogDescription className="pt-2 text-base text-muted-foreground font-medium">
                                {confirmAction?.type === 'reject' ? (
                                    <>
                                        Apakah Anda yakin ingin menolak pengajuan ini? 
                                        <div className="mt-6 space-y-3">
                                            <Label htmlFor="notes" className="text-foreground font-bold text-xs uppercase tracking-widest">Alasan Penolakan</Label>
                                            <Textarea
                                                id="notes"
                                                placeholder="Berikan alasan yang jelas untuk penolakan ini..."
                                                value={confirmAction.notes}
                                                onChange={(e) => setConfirmAction({ ...confirmAction, notes: e.target.value })}
                                                className="min-h-32 bg-background border-border/50 rounded-2xl focus:ring-destructive/20 focus:border-destructive transition-all resize-none"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    "Apakah Anda yakin ingin menyetujui pengajuan ini? Tindakan ini akan memproses jadwal shift karyawan terkait secara otomatis."
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-8 gap-3 sm:flex-row flex-col">
                            <Button
                                variant="ghost"
                                className="flex-1 rounded-2xl hover:bg-muted font-bold h-12"
                                onClick={() => setConfirmAction(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                variant={confirmAction?.type === 'reject' ? 'destructive' : 'default'}
                                className={cn(
                                    "flex-1 rounded-2xl font-bold h-12 shadow-lg transition-transform active:scale-95",
                                    confirmAction?.type !== 'reject' ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'shadow-destructive/20'
                                )}
                                onClick={executeAction}
                            >
                                {confirmAction?.type === 'reject' ? 'Ya, Tolak Pengajuan' : 'Ya, Setujui Sekarang'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
