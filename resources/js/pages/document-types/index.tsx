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

type Position = { id: number; name: string };

type DocumentType = {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    positions?: { id: number; name: string; pivot: { is_required: boolean } }[];
};

export default function Index({
    documentTypes,
    positions,
}: {
    documentTypes: any;
    positions: Position[];
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editType, setEditType] = useState<DocumentType | null>(null);
    const [typeToDelete, setTypeToDelete] = useState<number | null>(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        description: '',
        is_active: true,
        positions: [] as { id: number; is_required: boolean }[],
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/document-types', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (type: DocumentType) => {
        setEditType(type);
        setData({
            name: type.name,
            description: type.description || '',
            is_active: type.is_active,
            positions:
                type.positions?.map((p) => ({
                    id: p.id,
                    is_required: p.pivot.is_required,
                })) || [],
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/document-types/${editType?.id}`, {
            onSuccess: () => {
                setEditType(null);
                reset();
            },
        });
    };

    const handleCloseEdit = () => {
        setEditType(null);
        reset();
    };

    const handleDelete = () => {
        if (!typeToDelete) return;
        router.delete(`/document-types/${typeToDelete}`, {
            preserveScroll: true,
            onSuccess: () => setTypeToDelete(null),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Jenis Dokumen', href: '/document-types' },
            ]}
        >
            <Head title="Jenis Dokumen" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Jenis Dokumen
                        </h2>
                        <p className="text-muted-foreground">
                            Kelola kategori dokumen yang dapat diunggah oleh
                            karyawan.
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
                                <Plus className="mr-2 h-4 w-4" /> Tambah Jenis
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Jenis Dokumen</DialogTitle>
                                <DialogDescription>
                                    Buat tipe dokumen baru (mis. KTP, STR, SIP).
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" required>
                                            Nama Dokumen
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
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>
                                            Berlaku untuk Posisi (Pilih & Set
                                            Wajib)
                                        </Label>
                                        <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                                            {positions.map((pos) => {
                                                const isSelected =
                                                    data.positions.some(
                                                        (p) => p.id === pos.id,
                                                    );
                                                const isRequired =
                                                    data.positions.find(
                                                        (p) => p.id === pos.id,
                                                    )?.is_required || false;

                                                return (
                                                    <div
                                                        key={pos.id}
                                                        className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                id={`pos-${pos.id}`}
                                                                checked={
                                                                    isSelected
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) => {
                                                                    if (
                                                                        checked
                                                                    ) {
                                                                        setData(
                                                                            'positions',
                                                                            [
                                                                                ...data.positions,
                                                                                {
                                                                                    id: pos.id,
                                                                                    is_required: false,
                                                                                },
                                                                            ],
                                                                        );
                                                                    } else {
                                                                        setData(
                                                                            'positions',
                                                                            data.positions.filter(
                                                                                (
                                                                                    p,
                                                                                ) =>
                                                                                    p.id !==
                                                                                    pos.id,
                                                                            ),
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            <Label
                                                                htmlFor={`pos-${pos.id}`}
                                                                className="cursor-pointer font-normal"
                                                            >
                                                                {pos.name}
                                                            </Label>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="flex shrink-0 items-center gap-2">
                                                                <Label className="text-xs text-muted-foreground">
                                                                    Wajib?
                                                                </Label>
                                                                <Checkbox
                                                                    checked={
                                                                        isRequired
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked,
                                                                    ) => {
                                                                        setData(
                                                                            'positions',
                                                                            data.positions.map(
                                                                                (
                                                                                    p,
                                                                                ) =>
                                                                                    p.id ===
                                                                                    pos.id
                                                                                        ? {
                                                                                              ...p,
                                                                                              is_required:
                                                                                                  !!checked,
                                                                                          }
                                                                                        : p,
                                                                            ),
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
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

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Berlaku Untuk</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documentTypes.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        Belum ada jenis dokumen.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                documentTypes.data.map((type: DocumentType) => (
                                    <TableRow key={type.id}>
                                        <TableCell className="font-medium">
                                            {type.name}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {type.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {type.positions?.length || 0}{' '}
                                                Posisi
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {type.is_active ? (
                                                <Badge
                                                    variant="default"
                                                    className="bg-green-500 hover:bg-green-600"
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
                                                        handleEdit(type)
                                                    }
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() =>
                                                        setTypeToDelete(type.id)
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
                    open={!!editType}
                    onOpenChange={(open) => !open && handleCloseEdit()}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Jenis Dokumen</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi jenis dokumen.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name" required>
                                        Nama Dokumen
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
                                    <Textarea
                                        id="edit-description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>
                                        Berlaku untuk Posisi (Pilih & Set Wajib)
                                    </Label>
                                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                                        {positions.map((pos) => {
                                            const isSelected =
                                                data.positions.some(
                                                    (p) => p.id === pos.id,
                                                );
                                            const isRequired =
                                                data.positions.find(
                                                    (p) => p.id === pos.id,
                                                )?.is_required || false;

                                            return (
                                                <div
                                                    key={pos.id}
                                                    className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`edit-pos-${pos.id}`}
                                                            checked={isSelected}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                if (checked) {
                                                                    setData(
                                                                        'positions',
                                                                        [
                                                                            ...data.positions,
                                                                            {
                                                                                id: pos.id,
                                                                                is_required: false,
                                                                            },
                                                                        ],
                                                                    );
                                                                } else {
                                                                    setData(
                                                                        'positions',
                                                                        data.positions.filter(
                                                                            (
                                                                                p,
                                                                            ) =>
                                                                                p.id !==
                                                                                pos.id,
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`edit-pos-${pos.id}`}
                                                            className="cursor-pointer font-normal"
                                                        >
                                                            {pos.name}
                                                        </Label>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="flex shrink-0 items-center gap-2">
                                                            <Label className="text-xs text-muted-foreground">
                                                                Wajib?
                                                            </Label>
                                                            <Checkbox
                                                                checked={
                                                                    isRequired
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) => {
                                                                    setData(
                                                                        'positions',
                                                                        data.positions.map(
                                                                            (
                                                                                p,
                                                                            ) =>
                                                                                p.id ===
                                                                                pos.id
                                                                                    ? {
                                                                                          ...p,
                                                                                          is_required:
                                                                                              !!checked,
                                                                                      }
                                                                                    : p,
                                                                        ),
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="edit-is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'is_active',
                                                checked as boolean,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="edit-is_active"
                                        className="font-normal"
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
                    open={!!typeToDelete}
                    onOpenChange={(open) => !open && setTypeToDelete(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Jenis Dokumen?</DialogTitle>
                            <DialogDescription>
                                Tindakan ini hanya berhasil bila tidak ada
                                dokumen karyawan yang menggunakan tipe ini.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setTypeToDelete(null)}
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
