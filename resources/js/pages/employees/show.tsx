import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Briefcase,
    BuildingIcon,
    Calendar,
    ChevronLeft,
    Download,
    Mail,
    Upload,
    UserCircle,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';

type DocumentType = {
    id: number;
    name: string;
    description: string | null;
    is_required: boolean;
};

type EmployeeDocument = {
    id: number;
    document_type_id: number;
    file_name: string;
    file_path: string;
    created_at: string;
};

type EmployeeData = {
    id: number;
    full_name: string;
    join_date: string;
    leave_quota: number;
    user: {
        id: number;
        nip: string;
        email: string;
        roles: { id: number; name: string }[];
    };
    position?: { name: string };
    department?: { name: string };
    documents?: EmployeeDocument[];
};

type LeaveStats = {
    totalQuota: number;
    usedThisYear: number;
    remainingQuota: number;
    usedThisMonth: number;
    monthlyLimit: number;
};

export default function Show({
    employee,
    documentTypes,
    leaveStats,
}: {
    employee: EmployeeData;
    documentTypes: DocumentType[];
    leaveStats: LeaveStats;
}) {
    const { can } = usePermissions();

    // Local states for Document actions
    const [docToDelete, setDocToDelete] = useState<number | null>(null);
    const [uploadFormOpen, setUploadFormOpen] = useState<number | null>(null);

    const {
        data: uploadData,
        setData: setUploadData,
        post: postUpload,
        errors: uploadErrors,
        processing: uploadProcessing,
        reset: resetUpload,
    } = useForm<{
        document_type_id: number | null;
        file: File | null;
        notes: string;
    }>({
        document_type_id: null,
        file: null,
        notes: '',
    });

    const handleOpenUploadForm = (typeId: number) => {
        setUploadData('document_type_id', typeId);
        setUploadFormOpen(typeId);
    };

    const handleCloseUploadForm = () => {
        setUploadFormOpen(null);
        resetUpload();
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadData.document_type_id || !uploadData.file) return;

        postUpload(`/employees/${employee.id}/documents`, {
            preserveScroll: true,
            onSuccess: handleCloseUploadForm,
        });
    };

    const handleDeleteDocument = () => {
        if (!docToDelete) return;

        router.delete(`/employees/${employee.id}/documents/${docToDelete}`, {
            preserveScroll: true,
            onSuccess: () => setDocToDelete(null),
        });
    };

    // Calculate percentage for the progress bar. We want the bar to represent
    // the remaining quota out of the default total (12).
    const defaultTotal = 12;
    const remainingPercentage =
        defaultTotal > 0 ? (leaveStats.remainingQuota / defaultTotal) * 100 : 0;

    const getUsedThisMonthColorClass = (used: number) => {
        if (used === 0) return 'text-green-600 dark:text-green-500';
        if (used === 1 || used === 2) return 'text-foreground';
        if (used === 3 || used === 4)
            return 'text-yellow-600 dark:text-yellow-500';
        if (used >= 5) return 'text-red-600 dark:text-red-500';
        return 'text-foreground';
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Karyawan', href: '/employees' },
                {
                    title: employee.full_name,
                    href: `/employees/${employee.id}`,
                },
            ]}
        >
            <Head title={`Employee: ${employee.full_name}`} />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-6 p-4 lg:p-8">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Link href="/employees">
                        <Button variant="outline" size="sm">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Kembali ke
                            Direktori
                        </Button>
                    </Link>
                    {can('employee.edit') && (
                        <Link href={`/employees/${employee.id}/edit`}>
                            <Button size="sm">Edit Karyawan</Button>
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Left Column: Profile Card */}
                    <Card className="md:col-span-1">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <UserCircle className="h-16 w-16" />
                            </div>
                            <CardTitle className="text-xl">
                                {employee.full_name}
                            </CardTitle>
                            <CardDescription className="font-mono text-sm">
                                {employee.user?.nip || 'NIP tidak ditetapkan'}
                            </CardDescription>
                            <div className="mt-2 flex flex-wrap justify-center gap-1">
                                {employee.user?.roles?.map((role) => (
                                    <Badge key={role.id} variant="secondary">
                                        {role.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{employee.user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Bergabung {employee.join_date}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column: Work & Leave Details */}
                    <div className="flex flex-col gap-6 md:col-span-2">
                        {/* Employment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detail Pekerjaan</CardTitle>
                                <CardDescription>
                                    Pemetaan jabatan dan departemen saat ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Briefcase className="h-4 w-4" />{' '}
                                        Jabatan
                                    </span>
                                    <span className="text-base font-semibold">
                                        {employee.position?.name ||
                                            'Belum Ditetapkan'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <BuildingIcon className="h-4 w-4" />{' '}
                                        Departemen
                                    </span>
                                    <span className="text-base font-semibold">
                                        {employee.department?.name ||
                                            'Belum Ditetapkan'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leave Quota Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status Kuota Cuti</CardTitle>
                                <CardDescription>
                                    Jatah cuti tahunan dan bulanan untuk tahun
                                    ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Annual Quota Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-muted-foreground">
                                            Sisa Kuota Tahunan
                                        </span>
                                        <span className="font-bold">
                                            {leaveStats.remainingQuota} /{' '}
                                            {leaveStats.totalQuota} hari
                                        </span>
                                    </div>
                                    <Progress
                                        value={remainingPercentage}
                                        className="h-3 w-full"
                                        // A custom class could be added here to colorize based on percentage (e.g., green if high, orange if low)
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {leaveStats.usedThisYear} hari telah
                                        digunakan atau diajukan tahun ini dari
                                        total anggaran sebanyak{' '}
                                        {leaveStats.totalQuota} hari.
                                    </p>
                                </div>

                                {/* Monthly Usage */}
                                <div className="rounded-md border bg-muted/50 p-4">
                                    <h4 className="mb-2 text-sm font-medium">
                                        Penggunaan Bulan Ini
                                    </h4>
                                    <div className="flex items-baseline gap-2">
                                        <span
                                            className={`text-2xl font-bold ${getUsedThisMonthColorClass(leaveStats.usedThisMonth)}`}
                                        >
                                            {leaveStats.usedThisMonth}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            / {leaveStats.monthlyLimit} hari
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employee Documents Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Dokumen Karyawan</CardTitle>
                                <CardDescription>
                                    Kelola berkas dan dokumen penting karyawan.
                                    Maks 5MB (PDF/JPG/PNG).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {documentTypes.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        Belum ada jenis dokumen yang ditetapkan.
                                    </p>
                                ) : (
                                    <div className="grid gap-3">
                                        {documentTypes.map(
                                            (type: DocumentType) => {
                                                const existingDoc =
                                                    employee.documents?.find(
                                                        (d: EmployeeDocument) =>
                                                            d.document_type_id ===
                                                            type.id,
                                                    );
                                                return (
                                                    <div
                                                        key={type.id}
                                                        className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-3"
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold">
                                                                    {type.name}
                                                                </span>
                                                                {type.is_required && (
                                                                    <Badge
                                                                        variant="destructive"
                                                                        className="h-4 text-[10px]"
                                                                    >
                                                                        Wajib
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {type.description ||
                                                                    'Tidak ada deskripsi'}
                                                            </span>
                                                            {existingDoc && (
                                                                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                                                    Diunggah
                                                                    pada{' '}
                                                                    {new Date(
                                                                        existingDoc.created_at,
                                                                    ).toLocaleDateString(
                                                                        'id-ID',
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {existingDoc ? (
                                                                <>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        asChild
                                                                    >
                                                                        <a
                                                                            href={`/employees/${employee.id}/documents/${existingDoc.id}/download`}
                                                                            target="_blank"
                                                                        >
                                                                            <Download className="mr-2 h-4 w-4" />{' '}
                                                                            Unduh
                                                                        </a>
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            setDocToDelete(
                                                                                existingDoc.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Dialog
                                                                    open={
                                                                        uploadFormOpen ===
                                                                        type.id
                                                                    }
                                                                    onOpenChange={(
                                                                        open: boolean,
                                                                    ) =>
                                                                        !open &&
                                                                        handleCloseUploadForm()
                                                                    }
                                                                >
                                                                    <DialogTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            size="sm"
                                                                            variant="secondary"
                                                                            onClick={() =>
                                                                                handleOpenUploadForm(
                                                                                    type.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Upload className="mr-2 h-4 w-4" />{' '}
                                                                            Unggah
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent>
                                                                        <DialogHeader>
                                                                            <DialogTitle>
                                                                                Unggah{' '}
                                                                                {
                                                                                    type.name
                                                                                }
                                                                            </DialogTitle>
                                                                            <DialogDescription>
                                                                                Pilih
                                                                                file
                                                                                dokumen
                                                                                untuk
                                                                                diunggah
                                                                                (PDF,
                                                                                JPG,
                                                                                PNG).
                                                                                Maks
                                                                                5MB.
                                                                            </DialogDescription>
                                                                        </DialogHeader>
                                                                        <form
                                                                            onSubmit={
                                                                                handleUploadSubmit
                                                                            }
                                                                        >
                                                                            <div className="grid gap-4 py-4">
                                                                                <div className="grid gap-2">
                                                                                    <Label
                                                                                        htmlFor="file"
                                                                                        required
                                                                                    >
                                                                                        File
                                                                                    </Label>
                                                                                    <Input
                                                                                        id="file"
                                                                                        type="file"
                                                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                                                        onChange={(
                                                                                            e: React.ChangeEvent<HTMLInputElement>,
                                                                                        ) =>
                                                                                            setUploadData(
                                                                                                'file',
                                                                                                e
                                                                                                    .target
                                                                                                    .files?.[0] ||
                                                                                                    null,
                                                                                            )
                                                                                        }
                                                                                        required
                                                                                    />
                                                                                    {uploadErrors.file && (
                                                                                        <p className="text-sm text-destructive">
                                                                                            {
                                                                                                uploadErrors.file
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <div className="grid gap-2">
                                                                                    <Label htmlFor="notes">
                                                                                        Catatan
                                                                                        (opsional)
                                                                                    </Label>
                                                                                    <Textarea
                                                                                        id="notes"
                                                                                        value={
                                                                                            uploadData.notes
                                                                                        }
                                                                                        onChange={(
                                                                                            e: React.ChangeEvent<HTMLTextAreaElement>,
                                                                                        ) =>
                                                                                            setUploadData(
                                                                                                'notes',
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        placeholder="Tambahkan catatan jika perlu..."
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <DialogFooter>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    onClick={
                                                                                        handleCloseUploadForm
                                                                                    }
                                                                                >
                                                                                    Batal
                                                                                </Button>
                                                                                <Button
                                                                                    type="submit"
                                                                                    disabled={
                                                                                        uploadProcessing
                                                                                    }
                                                                                >
                                                                                    Unggah{' '}
                                                                                    {uploadProcessing &&
                                                                                        '...'}
                                                                                </Button>
                                                                            </DialogFooter>
                                                                        </form>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Document Delete Confirmation Dialog */}
                <Dialog
                    open={!!docToDelete}
                    onOpenChange={(open) => !open && setDocToDelete(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Dokumen?</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus dokumen ini?
                                File fisik beserta datanya akan dihapus
                                permanen.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDocToDelete(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteDocument}
                            >
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
