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

type Department = { id: number; name: string };

type Shift = {
    id: number;
    name: string;
    department_id: number | null;
    start_time: string;
    end_time: string;
    is_active: boolean;
    department?: Department;
};

export default function Index({
    shifts,
    departments,
}: {
    shifts: Shift[];
    departments: Department[];
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editShift, setEditShift] = useState<Shift | null>(null);
    const [shiftToDelete, setShiftToDelete] = useState<number | null>(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        department_id: '' as string | number,
        start_time: '',
        end_time: '',
        is_active: true,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/shifts', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (shift: Shift) => {
        setEditShift(shift);
        setData({
            name: shift.name,
            department_id: shift.department_id || '',
            start_time: shift.start_time.slice(0, 5), // format to HH:mm
            end_time: shift.end_time.slice(0, 5),
            is_active: shift.is_active,
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/shifts/${editShift?.id}`, {
            onSuccess: () => {
                setEditShift(null);
                reset();
            },
        });
    };

    const handleCloseEdit = () => {
        setEditShift(null);
        reset();
    };

    const handleDelete = () => {
        if (!shiftToDelete) return;
        router.delete(`/shifts/${shiftToDelete}`, {
            preserveScroll: true,
            onSuccess: () => setShiftToDelete(null),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Manajemen Shift', href: '/shifts' },
            ]}
        >
            <Head title="Manajemen Shift" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Manajemen Shift
                        </h2>
                        <p className="text-muted-foreground">
                            Kelola jadwal shift kerja karyawan.
                        </p>
                    </div>

                    <Dialog
                        open={isCreateOpen}
                        onOpenChange={(open) => {
                            setIsCreateOpen(open);
                            if (!open) reset();
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Shift
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Shift</DialogTitle>
                                <DialogDescription>
                                    Buat shift baru untuk karyawan atau
                                    departemen tertentu.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" required>
                                            Nama Shift
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="mis. Pagi, Malam Khusus Security"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="department_id">
                                            Departemen (Opsional - Kosongkan
                                            jika berlaku global)
                                        </Label>
                                        <Select
                                            value={
                                                data.department_id
                                                    ? String(data.department_id)
                                                    : 'none'
                                            }
                                            onValueChange={(val) =>
                                                setData(
                                                    'department_id',
                                                    val === 'none'
                                                        ? ''
                                                        : Number(val),
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Departemen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    Semua Departemen
                                                </SelectItem>
                                                {departments.map((dept) => (
                                                    <SelectItem
                                                        key={dept.id}
                                                        value={String(dept.id)}
                                                    >
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.department_id && (
                                            <p className="text-sm text-destructive">
                                                {errors.department_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="start_time"
                                                required
                                            >
                                                Jam Mulai
                                            </Label>
                                            <Input
                                                id="start_time"
                                                type="time"
                                                value={data.start_time}
                                                onChange={(e) =>
                                                    setData(
                                                        'start_time',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            {errors.start_time && (
                                                <p className="text-sm text-destructive">
                                                    {errors.start_time}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="end_time" required>
                                                Jam Selesai
                                            </Label>
                                            <Input
                                                id="end_time"
                                                type="time"
                                                value={data.end_time}
                                                onChange={(e) =>
                                                    setData(
                                                        'end_time',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            {errors.end_time && (
                                                <p className="text-sm text-destructive">
                                                    {errors.end_time}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(c) =>
                                                setData('is_active', !!c)
                                            }
                                        />
                                        <Label
                                            htmlFor="is_active"
                                            className="cursor-pointer font-normal"
                                        >
                                            Aktif
                                        </Label>
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

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Shift</TableHead>
                                <TableHead>Departemen</TableHead>
                                <TableHead>Jam (Mulai - Selesai)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shifts.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        Belum ada shift yang terdaftar.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                shifts.map((shift) => (
                                    <TableRow key={shift.id}>
                                        <TableCell className="font-medium">
                                            {shift.name}
                                        </TableCell>
                                        <TableCell>
                                            {shift.department?.name ||
                                                'Semua Departemen'}
                                        </TableCell>
                                        <TableCell>
                                            {shift.start_time.slice(0, 5)} -{' '}
                                            {shift.end_time.slice(0, 5)}
                                        </TableCell>
                                        <TableCell>
                                            {shift.is_active ? (
                                                <Badge
                                                    variant="default"
                                                    className="bg-green-500"
                                                >
                                                    Aktif
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    Nonaktif
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEdit(shift)
                                                    }
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() =>
                                                        setShiftToDelete(
                                                            shift.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit Dialog */}
                <Dialog
                    open={!!editShift}
                    onOpenChange={(open) => !open && handleCloseEdit()}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Shift</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi shift.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name" required>
                                        Nama Shift
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
                                    <Label htmlFor="edit-department_id">
                                        Departemen
                                    </Label>
                                    <Select
                                        value={
                                            data.department_id
                                                ? String(data.department_id)
                                                : 'none'
                                        }
                                        onValueChange={(val) =>
                                            setData(
                                                'department_id',
                                                val === 'none'
                                                    ? ''
                                                    : Number(val),
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Departemen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Semua Departemen
                                            </SelectItem>
                                            {departments.map((dept) => (
                                                <SelectItem
                                                    key={dept.id}
                                                    value={String(dept.id)}
                                                >
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="edit-start_time"
                                            required
                                        >
                                            Jam Mulai
                                        </Label>
                                        <Input
                                            id="edit-start_time"
                                            type="time"
                                            value={data.start_time}
                                            onChange={(e) =>
                                                setData(
                                                    'start_time',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-end_time" required>
                                            Jam Selesai
                                        </Label>
                                        <Input
                                            id="edit-end_time"
                                            type="time"
                                            value={data.end_time}
                                            onChange={(e) =>
                                                setData(
                                                    'end_time',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <Checkbox
                                        id="edit-is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(c) =>
                                            setData('is_active', !!c)
                                        }
                                    />
                                    <Label
                                        htmlFor="edit-is_active"
                                        className="cursor-pointer font-normal"
                                    >
                                        Aktif
                                    </Label>
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

                {/* Delete Dialog */}
                <Dialog
                    open={!!shiftToDelete}
                    onOpenChange={(open) => !open && setShiftToDelete(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Shift?</DialogTitle>
                            <DialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Pastikan
                                tidak ada jadwal karyawan yang menggunakan shift
                                ini.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShiftToDelete(null)}
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
