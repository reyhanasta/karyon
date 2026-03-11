import { Head, router, useForm } from '@inertiajs/react';
import { Building2, Edit2, Plus, Search, Trash2, Users } from 'lucide-react';
import { useRef, useState } from 'react';
import { Pagination } from '@/components/pagination';
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
    const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(
        null,
    );
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        description: '',
    });

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            router.get(
                '/departments',
                { search: value },
                { preserveState: true, replace: true },
            );
        }, 350);
    };

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

    const handleDelete = () => {
        if (!departmentToDelete) return;
        router.delete(`/departments/${departmentToDelete}`, {
            preserveScroll: true,
            onSuccess: () => setDepartmentToDelete(null),
        });
    };

    const handleCloseCreate = (isOpen: boolean) => {
        setIsCreateOpen(isOpen);
        if (!isOpen) reset();
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Departemen', href: '/departments' },
            ]}
        >
            <Head title="Departemen" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Departemen
                        </h2>
                        <p className="text-muted-foreground">
                            Kelola departemen klinik Anda di sini.
                        </p>
                    </div>

                    <Dialog
                        open={isCreateOpen}
                        onOpenChange={handleCloseCreate}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Tambah
                                Departemen
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Departemen</DialogTitle>
                                <DialogDescription>
                                    Buat departemen baru di sistem.
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                id="create-department-form"
                                onSubmit={handleCreate}
                            >
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" required>
                                            Nama
                                        </Label>
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
                                            Deskripsi
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
                                        Simpan
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
                        placeholder="Cari departemen..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Card Grid */}
                {departments.data.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-md border border-dashed py-16 text-muted-foreground">
                        Tidak ada departemen yang ditemukan.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {departments.data.map((department: any) => (
                            <div
                                key={department.id}
                                className="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                            >
                                {/* Card header */}
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate leading-tight font-semibold">
                                            {department.name}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                                            {department.description ||
                                                'Tidak ada deskripsi.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Employee count */}
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4 shrink-0" />
                                    <span>
                                        <span className="font-medium text-foreground">
                                            {department.employees_count}
                                        </span>{' '}
                                        karyawan
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 border-t pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEdit(department)}
                                    >
                                        <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex-1"
                                        disabled={
                                            department.employees_count > 0
                                        }
                                        onClick={() =>
                                            setDepartmentToDelete(department.id)
                                        }
                                    >
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination links={departments.links} />

                {/* Edit Dialog */}
                <Dialog
                    open={!!editDepartment}
                    onOpenChange={(open) => !open && handleCloseEdit()}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Departemen</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi {editDepartment?.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <form id="edit-department-form" onSubmit={handleUpdate}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name" required>
                                        Nama
                                    </Label>
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
                                        Deskripsi
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
                                    Perbarui
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={!!departmentToDelete}
                    onOpenChange={(open) =>
                        !open && setDepartmentToDelete(null)
                    }
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Departemen?</DialogTitle>
                            <DialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Ini akan
                                menghapus departemen secara permanen.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDepartmentToDelete(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
