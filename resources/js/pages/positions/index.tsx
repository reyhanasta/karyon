import { Head, Link, router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
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
    positions,
    filters,
}: {
    positions: any;
    filters: { search?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editPosition, setEditPosition] = useState<any>(null);
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
                                        <Label htmlFor="name">Nama</Label>
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

                <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Jumlah Karyawan</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {positions.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-24 text-center"
                                    >
                                        Tidak ada jabatan yang ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                            {positions.data.map((position: any) => (
                                <TableRow key={position?.id}>
                                    <TableCell className="font-medium">
                                        {position.name}
                                    </TableCell>
                                    <TableCell>
                                        {position.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {position.employees_count}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    handleEdit(position)
                                                }
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>

                                            <Link
                                                href={`/positions/${position?.id}`}
                                                method="delete"
                                                as="button"
                                            >
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    disabled={
                                                        position.employees_count >
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
                                    <Label htmlFor="edit-name">Nama</Label>
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
            </div>
        </AppLayout>
    );
}
