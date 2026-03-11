import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

type LeaveType = {
    id: number;
    name: string;
    max_days_per_year: number | null;
    is_paid: boolean;
    requires_attachment: boolean;
    is_active: boolean;
    description: string | null;
};

export default function Index({ leaveTypes }: { leaveTypes: LeaveType[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState<LeaveType | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        max_days_per_year: 12 as number | null,
        is_paid: true,
        requires_attachment: false,
        is_active: true,
        description: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/leave-types', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (item: LeaveType) => {
        setEditItem(item);
        setData({
            name: item.name,
            max_days_per_year: item.max_days_per_year,
            is_paid: item.is_paid,
            requires_attachment: item.requires_attachment,
            is_active: item.is_active,
            description: item.description || '',
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/leave-types/${editItem?.id}`, {
            onSuccess: () => {
                setEditItem(null);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(`/leave-types/${deleteId}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    };

    const handleCloseCreate = (isOpen: boolean) => {
        setIsCreateOpen(isOpen);
        if (!isOpen) reset();
    };

    const formFields = (prefix: string) => (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor={`${prefix}-name`} required>
                    Nama Jenis Cuti
                </Label>
                <Input
                    id={`${prefix}-name`}
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="contoh: Cuti Tahunan"
                    required
                />
                {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                )}
            </div>
            <div className="grid gap-2">
                <Label
                    htmlFor={`${prefix}-max-days`}
                    required={data.max_days_per_year !== null}
                >
                    Maks Hari / Tahun
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <Input
                        id={`${prefix}-max-days`}
                        type="number"
                        min={1}
                        value={data.max_days_per_year ?? ''}
                        disabled={data.max_days_per_year === null}
                        onChange={(e) =>
                            setData(
                                'max_days_per_year',
                                parseInt(e.target.value) || 1,
                            )
                        }
                        required={data.max_days_per_year !== null}
                        className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`${prefix}-unlimited`}
                            checked={data.max_days_per_year === null}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setData('max_days_per_year', null);
                                } else {
                                    setData('max_days_per_year', 12);
                                }
                            }}
                        />
                        <Label
                            htmlFor={`${prefix}-unlimited`}
                            className="font-normal whitespace-nowrap"
                        >
                            Tanpa Batas
                        </Label>
                    </div>
                </div>
                {errors.max_days_per_year && (
                    <p className="text-sm text-destructive">
                        {errors.max_days_per_year}
                    </p>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`${prefix}-desc`}>Deskripsi</Label>
                <Textarea
                    id={`${prefix}-desc`}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="min-h-16"
                    placeholder="Keterangan opsional..."
                />
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`${prefix}-paid`}
                        checked={data.is_paid}
                        onCheckedChange={(checked) =>
                            setData('is_paid', !!checked)
                        }
                    />
                    <Label htmlFor={`${prefix}-paid`} className="font-normal">
                        Dibayar (tidak potong gaji)
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`${prefix}-attachment`}
                        checked={data.requires_attachment}
                        onCheckedChange={(checked) =>
                            setData('requires_attachment', !!checked)
                        }
                    />
                    <Label
                        htmlFor={`${prefix}-attachment`}
                        className="font-normal"
                    >
                        Disarankan lampiran
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`${prefix}-active`}
                        checked={data.is_active}
                        onCheckedChange={(checked) =>
                            setData('is_active', !!checked)
                        }
                    />
                    <Label htmlFor={`${prefix}-active`} className="font-normal">
                        Aktif (bisa dipilih karyawan)
                    </Label>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Jenis Cuti', href: '/leave-types' },
            ]}
        >
            <Head title="Jenis Cuti" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Jenis Cuti
                        </h2>
                        <p className="text-muted-foreground">
                            Kelola jenis-jenis cuti yang tersedia.
                        </p>
                    </div>

                    <Dialog
                        open={isCreateOpen}
                        onOpenChange={handleCloseCreate}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Jenis
                                Cuti
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Jenis Cuti</DialogTitle>
                                <DialogDescription>
                                    Buat jenis cuti baru di sistem.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate}>
                                {formFields('create')}
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead className="text-center">
                                    Maks Hari/Tahun
                                </TableHead>
                                <TableHead className="text-center">
                                    Dibayar
                                </TableHead>
                                <TableHead className="text-center">
                                    Lampiran
                                </TableHead>
                                <TableHead className="text-center">
                                    Status
                                </TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveTypes.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center"
                                    >
                                        Belum ada jenis cuti.
                                    </TableCell>
                                </TableRow>
                            )}
                            {leaveTypes.map((type) => (
                                <TableRow key={type.id}>
                                    <TableCell className="font-medium">
                                        <div>
                                            {type.name}
                                            {type.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {type.description}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {type.max_days_per_year !== null
                                            ? `${type.max_days_per_year} hari`
                                            : 'Tanpa Batas'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {type.is_paid ? 'Ya' : 'Tidak'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {type.requires_attachment
                                            ? 'Disarankan'
                                            : '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={
                                                type.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className={
                                                type.is_active
                                                    ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                                                    : ''
                                            }
                                        >
                                            {type.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleEdit(type)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() =>
                                                    setDeleteId(type.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit Dialog */}
                <Dialog
                    open={!!editItem}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditItem(null);
                            reset();
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Jenis Cuti</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi {editItem?.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate}>
                            {formFields('edit')}
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    Perbarui
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <Dialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Jenis Cuti?</DialogTitle>
                            <DialogDescription>
                                Jenis cuti yang masih digunakan tidak bisa
                                dihapus. Nonaktifkan saja jika ingin
                                menyembunyikannya.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteId(null)}
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
