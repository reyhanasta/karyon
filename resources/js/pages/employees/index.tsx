import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Download,
    Edit2,
    Eye,
    FileSpreadsheet,
    Plus,
    Search,
    Trash2,
    Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    const [importOpen, setImportOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const importForm = useForm<{ file: File | null }>({ file: null });

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            router.get(
                '/employees',
                { search: value },
                { preserveState: true, replace: true },
            );
        }, 350);
    };

    const handleImport = () => {
        if (!importForm.data.file) return;

        const formData = new FormData();
        formData.append('file', importForm.data.file);

        router.post('/employees/import', formData as any, {
            forceFormData: true,
            onSuccess: () => {
                setImportOpen(false);
                importForm.reset();
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Karyawan', href: '/employees' },
            ]}
        >
            <Head title="Employees" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Karyawan
                        </h2>
                        <p className="text-muted-foreground">
                            Kelola data karyawan klinik Anda di sini.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Export dropdown */}
                        {can('employee.view') && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Download className="mr-2 h-4 w-4" />{' '}
                                        Ekspor
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <a href="/employees/export?format=xlsx">
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />{' '}
                                            Ekspor sebagai .xlsx
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href="/employees/export?format=csv">
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />{' '}
                                            Ekspor sebagai .csv
                                        </a>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Import button */}
                        {can('employee.create') && (
                            <Button
                                variant="outline"
                                onClick={() => setImportOpen(true)}
                            >
                                <Upload className="mr-2 h-4 w-4" /> Impor
                            </Button>
                        )}

                        {/* Create button */}
                        {can('employee.create') && (
                            <Link href="/employees/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Tambah
                                    Karyawan
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari berdasarkan nama, NIP, jabatan..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>NIP</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Jabatan</TableHead>
                                <TableHead>Departemen</TableHead>
                                <TableHead>Peran</TableHead>
                                <TableHead>Kuota Cuti</TableHead>
                                {(can('employee.edit') ||
                                    can('employee.delete')) && (
                                    <TableHead className="text-right">
                                        Aksi
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
                                        Karyawan tidak ditemukan.
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
                                        {employee.leave_quota} hari
                                    </TableCell>
                                    {(can('employee.edit') ||
                                        can('employee.delete')) && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/employees/${employee.id}`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
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

                <Pagination links={employees.links} />
            </div>

            {/* Import Dialog */}
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Impor Karyawan</DialogTitle>
                        <DialogDescription>
                            Unggah file .xlsx atau .csv yang berisi data
                            karyawan. Kolom wajib: <strong>Full Name</strong>,{' '}
                            <strong>Email</strong>. Opsional: NIP, Position,
                            Department, Role, Join Date, Leave Quota.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.csv,.xls"
                            onChange={(e) =>
                                importForm.setData(
                                    'file',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                        />
                        {importForm.errors.file && (
                            <p className="text-sm font-medium text-destructive">
                                {importForm.errors.file}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setImportOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={
                                !importForm.data.file || importForm.processing
                            }
                        >
                            <Upload className="mr-2 h-4 w-4" /> Impor
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
