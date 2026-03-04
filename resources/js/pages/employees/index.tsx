import { Head, Link, router } from '@inertiajs/react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function Index({
    employees,
    filters,
}: {
    employees: any;
    filters: { search?: string };
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');

    // Debounced Inertia visit on search change
    const doSearch = useCallback((value: string) => {
        router.get(
            '/employees',
            { search: value },
            { preserveState: true, replace: true },
        );
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => doSearch(search), 350);
        return () => clearTimeout(timer);
    }, [search, doSearch]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Employees', href: '/employees' },
            ]}
        >
            <Head title="Employees" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Employees
                        </h2>
                        <p className="text-muted-foreground">
                            Manage your clinic's employee data here.
                        </p>
                    </div>
                    {can('employee.create') && (
                        <Link href="/employees/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Employee
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, NIP, position..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>NIP</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Leave Quota</TableHead>
                                {(can('employee.edit') ||
                                    can('employee.delete')) && (
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-24 text-center"
                                    >
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {employees.data.map((employee: any) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">
                                        {employee.user?.nip}
                                    </TableCell>
                                    <TableCell>{employee.full_name}</TableCell>
                                    <TableCell>
                                        {employee.position?.name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {employee.department?.name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {employee.user?.roles?.map(
                                                (role: any) => (
                                                    <Badge
                                                        key={role.id}
                                                        variant="secondary"
                                                    >
                                                        {role.name}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {employee.leave_quota} days
                                    </TableCell>
                                    {(can('employee.edit') ||
                                        can('employee.delete')) && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {can('employee.edit') && (
                                                    <Link
                                                        href={`/employees/${employee.id}/edit`}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                {can('employee.delete') && (
                                                    <Link
                                                        href={`/employees/${employee.id}`}
                                                        method="delete"
                                                        as="button"
                                                    >
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
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
