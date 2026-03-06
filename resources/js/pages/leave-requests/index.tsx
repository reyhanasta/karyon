import { Head, Link, router } from '@inertiajs/react';
import { Check, Pencil, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '@/components/pagination';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';

type Status = 'pending' | 'approved' | 'rejected';

export default function Index({
    leaveRequests,
    filters,
}: {
    leaveRequests: any;
    filters: { status?: string };
}) {
    const { can } = usePermissions();
    const canApprove = can('leave.approve');
    const canCreate = can('leave.create') || can('leave.create.any');
    const canEdit = can('leave.edit');

    const [confirmAction, setConfirmAction] = useState<{
        id: number;
        status: Status;
    } | null>(null);

    const handleStatusUpdate = (id: number, status: Status) => {
        setConfirmAction({ id, status });
    };

    const executeStatusUpdate = () => {
        if (!confirmAction) return;
        router.post(
            `/leave-requests/${confirmAction.id}/status`,
            { status: confirmAction.status },
            {
                preserveScroll: true,
                onSuccess: () => setConfirmAction(null),
            },
        );
    };

    const handleFilterChange = (value: string) => {
        router.get(
            '/leave-requests',
            { status: value === 'all' ? undefined : value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const showActions = canApprove || canEdit;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Pengajuan Cuti', href: '/leave-requests' },
            ]}
        >
            <Head title="Pengajuan Cuti" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Pengajuan Cuti
                        </h2>
                        <p className="text-muted-foreground">
                            {canApprove
                                ? 'Kelola pengajuan cuti karyawan di sini.'
                                : 'Lihat dan buat pengajuan cuti Anda.'}
                        </p>
                    </div>
                    {canCreate && (
                        <Link href="/leave-requests/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Ajukan Cuti
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        Saring berdasarkan status:
                    </span>
                    <Select
                        defaultValue={filters.status ?? 'all'}
                        onValueChange={handleFilterChange}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Semua" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="pending">Menunggu</SelectItem>
                            <SelectItem value="approved">Disetujui</SelectItem>
                            <SelectItem value="rejected">Ditolak</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {canApprove && <TableHead>Karyawan</TableHead>}
                                <TableHead>Tanggal Mulai</TableHead>
                                <TableHead>Tanggal Selesai</TableHead>
                                <TableHead>Alasan</TableHead>
                                <TableHead>Status</TableHead>
                                {showActions && (
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveRequests.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={
                                            (canApprove ? 5 : 4) +
                                            (showActions ? 1 : 0)
                                        }
                                        className="h-24 text-center"
                                    >
                                        Tidak ada pengajuan cuti yang ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                            {leaveRequests.data.map((request: any) => (
                                <TableRow key={request.id}>
                                    {canApprove && (
                                        <TableCell className="font-medium">
                                            {request.employee?.full_name}
                                        </TableCell>
                                    )}
                                    <TableCell>{request.start_date}</TableCell>
                                    <TableCell>{request.end_date}</TableCell>
                                    <TableCell
                                        className="max-w-50 truncate"
                                        title={request.reason}
                                    >
                                        {request.reason}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                request.status === 'approved'
                                                    ? 'default'
                                                    : request.status ===
                                                        'rejected'
                                                      ? 'destructive'
                                                      : 'secondary'
                                            }
                                            className={
                                                request.status === 'approved'
                                                    ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                                                    : ''
                                            }
                                        >
                                            {request.status === 'pending'
                                                ? 'Menunggu'
                                                : request.status === 'approved'
                                                  ? 'Disetujui'
                                                  : 'Ditolak'}
                                        </Badge>
                                    </TableCell>
                                    {showActions && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {canEdit &&
                                                    request.status ===
                                                        'pending' && (
                                                        <Link
                                                            href={`/leave-requests/${request.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <Pencil className="mr-1 h-3 w-3" />{' '}
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                    )}
                                                {canApprove &&
                                                    request.status ===
                                                        'pending' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleStatusUpdate(
                                                                        request.id,
                                                                        'approved',
                                                                    )
                                                                }
                                                                className="text-green-600 hover:text-green-700"
                                                            >
                                                                <Check className="mr-1 h-3 w-3" />{' '}
                                                                Setujui
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleStatusUpdate(
                                                                        request.id,
                                                                        'rejected',
                                                                    )
                                                                }
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <X className="mr-1 h-3 w-3" />{' '}
                                                                Tolak
                                                            </Button>
                                                        </>
                                                    )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Pagination links={leaveRequests.links} />

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
