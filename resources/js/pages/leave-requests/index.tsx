import { router } from '@inertiajs/react';
import { Head, Link } from '@inertiajs/react';
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
import AppLayout from '@/layouts/app-layout';

type Status = 'pending' | 'approved' | 'rejected';

export default function Index({
    leaveRequests,
    isManagerOrAdmin,
    filters,
}: {
    leaveRequests: any;
    isManagerOrAdmin: boolean;
    filters: { status?: string };
}) {
    const handleStatusUpdate = (id: number, status: Status) => {
        if (confirm(`Are you sure you want to ${status} this request?`)) {
            router.post(`/leave-requests/${id}/status`, { status });
        }
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

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Leave Requests', href: '/leave-requests' },
            ]}
        >
            <Head title="Leave Requests" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Leave Requests
                        </h2>
                        <p className="text-muted-foreground">
                            {isManagerOrAdmin
                                ? 'Manage employee leave requests here.'
                                : 'View and submit your leave requests.'}
                        </p>
                    </div>
                    {!isManagerOrAdmin && (
                        <Link href="/leave-requests/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Request Leave
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
                                {isManagerOrAdmin && (
                                    <TableHead>Employee</TableHead>
                                )}
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                {isManagerOrAdmin && (
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveRequests.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={isManagerOrAdmin ? 6 : 4}
                                        className="h-24 text-center"
                                    >
                                        No leave requests found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {leaveRequests.data.map((request: any) => (
                                <TableRow key={request.id}>
                                    {isManagerOrAdmin && (
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
                                        >
                                            {request.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                request.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    {isManagerOrAdmin && (
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
