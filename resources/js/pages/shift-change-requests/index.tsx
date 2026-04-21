import { Head, Link } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus, Eye, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

type Shift = { id: number; name: string };
type Employee = { id: number; full_name: string };
type ShiftChangeRequest = {
    id: number;
    requester: Employee;
    target: Employee;
    request_date: string;
    requesterShift: Shift;
    status:
        | 'pending_target'
        | 'pending_hrd'
        | 'pending_manager'
        | 'approved'
        | 'rejected';
    created_at: string;
};

export default function Index({
    requests,
}: {
    requests: { data: ShiftChangeRequest[] };
}) {
    const { can } = usePermissions();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_target':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                    >
                        Menunggu Konfirmasi Pengganti
                    </Badge>
                );
            case 'pending_hrd':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                    >
                        Menunggu HRD
                    </Badge>
                );
            case 'pending_manager':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800"
                    >
                        Menunggu Kepala Ruangan
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                    >
                        Disetujui
                    </Badge>
                );
            case 'rejected':
                return <Badge variant="destructive">Ditolak</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const canCreate =
        can('shift-change.create') || can('shift-change.create.any');

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Penggantian Shift', href: '/shift-change-requests' },
            ]}
        >
            <Head title="Penggantian Shift" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Penggantian Shift
                        </h2>
                        <p className="text-muted-foreground">
                            Daftar pengajuan penggantian shift karyawan.
                        </p>
                    </div>
                    {canCreate && (
                        <Button asChild>
                            <Link href="/shift-change-requests/create">
                                <Plus className="mr-2 h-4 w-4" /> Ajukan
                                Penggantian
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tgl Pengajuan</TableHead>
                                <TableHead>Tgl Shift</TableHead>
                                <TableHead>Pemohon</TableHead>
                                <TableHead>Karyawan Pengganti</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        Belum ada data pengajuan penggantian
                                        shift.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.data.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                {format(
                                                    parseISO(req.created_at),
                                                    'dd MMM yyyy',
                                                    { locale: id },
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {format(
                                                parseISO(req.request_date),
                                                'dd MMMM yyyy',
                                                { locale: id },
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {req.requester.full_name}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {req.target.full_name}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(req.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/shift-change-requests/${req.id}`}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />{' '}
                                                    Detail
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
