import { Head, Link, router } from '@inertiajs/react';
import { Check, Eye, Pencil, Plus, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
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
import { Input } from '@/components/ui/input';
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
    filters: {
        status?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
    };
}) {
    const { can } = usePermissions();
    const canApproveHRD = can('overtime.approve.hrd');
    const canApproveManager = can('overtime.approve.manager');
    const canApproveDirector = can('overtime.approve.director');
    const canApprove = canApproveHRD || canApproveManager || canApproveDirector;
    const canCreateAny = can('overtime.create.any');
    const canCreate = can('overtime.create') || canCreateAny;
    const canEdit = can('overtime.edit');

    const [search, setSearch] = useState(filters.search ?? '');
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            router.get(
                '/overtime-requests',
                { ...filters, search: value || undefined },
                { preserveState: true, replace: true },
            );
        }, 350);
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            '/overtime-requests',
            {
                ...filters,
                search,
                [key]: value === 'all' || !value ? undefined : value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const calculateDuration = (start: string, end: string) => {
        if (!start || !end) return '0';
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        let diffMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
        if (diffMinutes < 0) diffMinutes += 24 * 60;
        return (diffMinutes / 60).toFixed(1);
    };

    const showActions = true; // Everyone can at least view details

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
                    <div className="flex items-center gap-2">
                        {canCreate && (
                            <Link href="/overtime-requests/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Ajukan
                                    Lembur
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {canApprove && (
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama karyawan..."
                                value={search}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                className="pl-9"
                            />
                        </div>
                    )}
                    <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
                        <Select
                            value={filters.status ?? 'all'}
                            onValueChange={(val) =>
                                handleFilterChange('status', val)
                            }
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="pending">
                                    Menunggu
                                </SelectItem>
                                <SelectItem value="approved">
                                    Disetujui
                                </SelectItem>
                                <SelectItem value="rejected">
                                    Ditolak
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {/* <Input
                            type="date"
                            className="w-40"
                            placeholder="Dari"
                            value={filters.date_from ?? ''}
                            onChange={(e) =>
                                handleFilterChange('date_from', e.target.value)
                            }
                        />
                        <Input
                            type="date"
                            className="w-40"
                            placeholder="Sampai"
                            value={filters.date_to ?? ''}
                            onChange={(e) =>
                                handleFilterChange('date_to', e.target.value)
                            }
                        /> */}
                    </div>
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
                                            className={
                                                request.status === 'approved'
                                                    ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                                                    : request.status.startsWith(
                                                            'pending',
                                                        )
                                                      ? 'border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-500'
                                                      : ''
                                            }
                                        >
                                            {request.status === 'approved'
                                                ? 'Disetujui'
                                                : request.status === 'rejected'
                                                  ? 'Ditolak'
                                                  : request.status ===
                                                      'pending_hrd'
                                                    ? 'Menunggu HRD'
                                                    : request.status ===
                                                        'pending_manager'
                                                      ? 'Menunggu Karu'
                                                      : request.status ===
                                                          'pending_director'
                                                        ? 'Menunggu Direktur'
                                                        : 'Menunggu'}
                                        </Badge>
                                    </TableCell>
                                    {showActions && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/overtime-requests/${request.id}`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Eye className="mr-1 h-3 w-3" />{' '}
                                                        Detail
                                                    </Button>
                                                </Link>
                                                {canEdit &&
                                                    request.status ===
                                                        'pending' && (
                                                        <Link
                                                            href={`/overtime-requests/${request.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-mauve-700"
                                                            >
                                                                <Pencil className="mr-1 h-3 w-3" />{' '}
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                    )}
                                                {((request.status ===
                                                    'pending_hrd' &&
                                                    canApproveHRD) ||
                                                    (request.status ===
                                                        'pending_manager' &&
                                                        canApproveManager) ||
                                                    (request.status ===
                                                        'pending_director' &&
                                                        canApproveDirector)) && (
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
