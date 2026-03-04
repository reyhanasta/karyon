import { Head, Link, router } from '@inertiajs/react';
import { Check, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    const canCreate = can('overtime.create');

    const handleStatusUpdate = (id: number, status: Status) => {
        if (confirm(`Are you sure you want to ${status} this request?`)) {
            router.post(`/overtime-requests/${id}/status`, { status });
        }
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

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Overtime Requests', href: '/overtime-requests' },
            ]}
        >
            <Head title="Overtime Requests" />
            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Overtime Requests
                        </h2>
                        <p className="text-muted-foreground">
                            {canApprove
                                ? 'Manage employee overtime requests here.'
                                : 'View and submit your overtime requests.'}
                        </p>
                    </div>
                    {canCreate && (
                        <Link href="/overtime-requests/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Request
                                Overtime
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                        Filter by status:
                    </span>
                    <Select
                        defaultValue={filters.status ?? 'all'}
                        onValueChange={handleFilterChange}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {canApprove && <TableHead>Employee</TableHead>}
                                <TableHead>Date</TableHead>
                                <TableHead>Start Time</TableHead>
                                <TableHead>End Time</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                {canApprove && (
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overtimeRequests.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={canApprove ? 8 : 6}
                                        className="h-24 text-center"
                                    >
                                        No overtime requests found.
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
                                        hrs
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
                                            {request.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                request.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    {canApprove && (
                                        <TableCell className="text-right">
                                            {request.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
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
                                                        Approve
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
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
