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
type LeaveTypeOption = { id: number; name: string };

export default function Index({
    leaveRequests,
    leaveTypes,
    filters,
}: {
    leaveRequests: any;
    leaveTypes: LeaveTypeOption[];
    filters: {
        status?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
        leave_type_id?: string;
    };
}) {
    const { can } = usePermissions();
    const canApproveHRD = can('leave.approve.hrd');
    const canApproveManager = can('leave.approve.manager');
    const canApproveDirector = can('leave.approve.director');
    const canApprove = canApproveHRD || canApproveManager || canApproveDirector;
    const canCreateAny = can('leave.create.any');
    const canCreate = can('leave.create') || canCreateAny;
    const canEdit = can('leave.edit');

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
            `/leave-requests/${confirmAction.id}/status`,
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
                '/leave-requests',
                { ...filters, search: value || undefined },
                { preserveState: true, replace: true },
            );
        }, 350);
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            '/leave-requests',
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

    const showActions = true; // Everyone can at least view details

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
                    <div className="flex items-center gap-2">
                        {canCreate && (
                            <Link href="/leave-requests/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Ajukan
                                    Cuti
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
                    <div className="flex flex-wrap items-center gap-4">
                        <Select
                            value={filters.leave_type_id ?? 'all'}
                            onValueChange={(val) =>
                                handleFilterChange('leave_type_id', val)
                            }
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Semua Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jenis</SelectItem>
                                {leaveTypes.map((type) => (
                                    <SelectItem
                                        key={type.id}
                                        value={String(type.id)}
                                    >
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                <TableHead>Jenis Cuti</TableHead>
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
                                            (canApprove ? 6 : 5) +
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
                                    <TableCell>
                                        <Badge variant="outline">
                                            {request.leave_type?.name ?? '-'}
                                        </Badge>
                                    </TableCell>
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
                                                    href={`/leave-requests/${request.id}`}
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
