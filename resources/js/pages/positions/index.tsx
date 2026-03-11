import { Head, router, useForm } from '@inertiajs/react';
import { Briefcase, Edit2, Plus, Search, Trash2, Users } from 'lucide-react';
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
    positions,
    filters,
}: {
    positions: any;
    filters: { search?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editPosition, setEditPosition] = useState<any>(null);
    const [positionToDelete, setPositionToDelete] = useState<number | null>(
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
                '/positions',
                { search: value },
                { preserveState: true, replace: true },
            );
        }, 350);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/positions', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (position: any) => {
        setEditPosition(position);
        setData({
            name: position.name,
            description: position.description || '',
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/positions/${editPosition?.id}`, {
            onSuccess: () => {
                setEditPosition(null);
                reset();
            },
        });
    };

    const handleCloseEdit = () => {
        setEditPosition(null);
        reset();
    };

    const handleDelete = () => {
        if (!positionToDelete) return;
        router.delete(`/positions/${positionToDelete}`, {
            preserveScroll: true,
            onSuccess: () => setPositionToDelete(null),
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
                { title: 'Jabatan', href: '/positions' },
            ]}
        >
            <Head title="Jabatan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Jabatan
                        </h2>
                        <p className="text-muted-foreground">
                            Kelola jabatan klinik Anda di sini.
                        </p>
                    </div>

                    <Dialog
                        open={isCreateOpen}
                        onOpenChange={handleCloseCreate}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Jabatan
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Jabatan</DialogTitle>
                                <DialogDescription>
                                    Buat jabatan baru di sistem.
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                id="create-position-form"
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
                        placeholder="Cari jabatan..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Card Grid */}
                {positions.data.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-md border border-dashed py-16 text-muted-foreground">
                        Tidak ada jabatan yang ditemukan.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {positions.data.map((position: any) => (
                            <div
                                key={position.id}
                                className="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                            >
                                {/* Card header */}
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate leading-tight font-semibold">
                                            {position.name}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                                            {position.description ||
                                                'Tidak ada deskripsi.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Employee count */}
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4 shrink-0" />
                                    <span>
                                        <span className="font-medium text-foreground">
                                            {position.employees_count}
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
                                        onClick={() => handleEdit(position)}
                                    >
                                        <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex-1"
                                        disabled={position.employees_count > 0}
                                        onClick={() =>
                                            setPositionToDelete(position.id)
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

                <Pagination links={positions.links} />

                {/* Edit Dialog */}
                <Dialog
                    open={!!editPosition}
                    onOpenChange={(open) => !open && handleCloseEdit()}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Jabatan</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi {editPosition?.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <form id="edit-position-form" onSubmit={handleUpdate}>
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
                    open={!!positionToDelete}
                    onOpenChange={(open) => !open && setPositionToDelete(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Jabatan?</DialogTitle>
                            <DialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Ini akan
                                menghapus jabatan secara permanen.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setPositionToDelete(null)}
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
