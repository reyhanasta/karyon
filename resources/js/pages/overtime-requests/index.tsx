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
    overtimeRequests,
    filters,
}: {
    overtimeRequests: any;
    filters: { status?: string };
}) {
    const { can } = usePermissions();
    const canApprove = can('overtime.approve');
    const canCreate = can('overtime.create') || can('overtime.create.any');
    const canEdit = can('overtime.edit');

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
            `/overtime-requests/${confirmAction.id}/status`,
            { status: confirmAction.status },
            {
                preserveScroll: true,
                onSuccess: () => setConfirmAction(null),
            },
        );
    };

    const handleFilterChange = (value: string) => {
        router.get(
            '/overtime-requests',
            { status: value === 'all' ? undefined : value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const calculateDuration = (start: string, end: string) => {
        if (!start || !end) return 0;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        return (h2 - h1 + (m2 - m1) / 60).toFixed(1);
    };

    const showActions = canApprove || canEdit;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Pengajuan Lembur', href: '/overtime-requests' },
            ]}
        >
            <Head title="Pengajuan Lembur" />
            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Pengajuan Lembur
                        </h2>
                        <p className="text-muted-foreground">
                            {canApprove
                                ? 'Kelola pengajuan lembur karyawan di sini.'
                                : 'Lihat dan buat pengajuan lembur Anda.'}
                        </p>
                    </div>
                    {canCreate && (
                        <Link href="/overtime-requests/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Ajukan Lembur
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
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Waktu Mulai</TableHead>
                                <TableHead>Waktu Selesai</TableHead>
                                <TableHead>Durasi</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Status</TableHead>
                                {showActions && (
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overtimeRequests.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={
                                            (canApprove ? 7 : 6) +
                                            (showActions ? 1 : 0)
                                        }
                                        className="h-24 text-center"
                                    >
                                        Tidak ada pengajuan lembur yang
                                        ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                            {overtimeRequests.data.map((request: any) => (
                                <TableRow key={request.id}>
                                    {canApprove && (
                                        <TableCell className="font-medium">
                                            {request.employee?.full_name}
                                        </TableCell>
                                    )}
                                    <TableCell>{request.date}</TableCell>
                                    <TableCell>{request.start_time}</TableCell>
                                    <TableCell>{request.end_time}</TableCell>
                                    <TableCell>
                                        {calculateDuration(
                                            request.start_time,
                                            request.end_time,
                                        )}{' '}
                                        jam
                                    </TableCell>
                                    <TableCell
                                        className="max-w-50 truncate"
                                        title={request.description}
                                    >
                                        {request.description}
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
                                                            href={`/overtime-requests/${request.id}/edit`}
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

                <Pagination links={overtimeRequests.links} />

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
