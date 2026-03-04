import { Head, Link, router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

export default function Index({
    departments,
    filters,
}: {
    departments: any;
    filters: { search?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editDepartment, setEditDepartment] = useState<any>(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        description: '',
    });

    // Debounced Inertia visit on search change
    const doSearch = useCallback((value: string) => {
        router.get(
            '/departments',
            { search: value },
            { preserveState: true, replace: true },
        );
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => doSearch(search), 350);
        return () => clearTimeout(timer);
    }, [search, doSearch]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/departments', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (department: any) => {
        setEditDepartment(department);
        setData({
            name: department.name,
            description: department.description || '',
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/departments/${editDepartment?.id}`, {
            onSuccess: () => {
                setEditDepartment(null);
                reset();
            },
        });
    };

    const handleCloseEdit = () => {
        setEditDepartment(null);
        reset();
    };

    const handleCloseCreate = (isOpen: boolean) => {
        setIsCreateOpen(isOpen);
        if (!isOpen) reset();
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Departments', href: '/departments' },
            ]}
        >
            <Head title="Departments" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Departments
                        </h2>
                        <p className="text-muted-foreground">
                            Manage your clinic's departments here.
                        </p>
                    </div>

                    <Dialog
                        open={isCreateOpen}
                        onOpenChange={handleCloseCreate}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Department
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Department</DialogTitle>
                                <DialogDescription>
                                    Create a new department in the system.
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                id="create-department-form"
                                onSubmit={handleCreate}
                            >
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <Input
                                            id="description"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-destructive">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        Save
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search departments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Employees Count</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departments.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-24 text-center"
                                    >
                                        No departments found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {departments.data.map((department: any) => (
                                <TableRow key={department?.id}>
                                    <TableCell className="font-medium">
                                        {department.name}
                                    </TableCell>
                                    <TableCell>
                                        {department.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {department.employees_count}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    handleEdit(department)
                                                }
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>

                                            <Link
                                                href={`/departments/${department?.id}`}
                                                method="delete"
                                                as="button"
                                            >
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    disabled={
                                                        department.employees_count >
                                                        0
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit Dialog */}
                <Dialog
                    open={!!editDepartment}
                    onOpenChange={(open) => !open && handleCloseEdit()}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Department</DialogTitle>
                            <DialogDescription>
                                Update {editDepartment?.name} information.
                            </DialogDescription>
                        </DialogHeader>
                        <form id="edit-department-form" onSubmit={handleUpdate}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-description">
                                        Description
                                    </Label>
                                    <Input
                                        id="edit-description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    Update
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
