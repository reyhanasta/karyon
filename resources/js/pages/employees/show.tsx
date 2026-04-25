import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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
    FileText,
    ShieldCheck,
    Clock,
    Phone,
    MapPin,
    Trophy,
    Pencil,
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { editMyProfile } from '@/actions/App/Http/Controllers/EmployeeController';

type DocumentType = {
    id: number;
    name: string;
    description: string | null;
    positions?: { pivot: { is_required: boolean } }[];
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
    employee_status: string;
    employee_sip: string; // Corrected from 'sip' to 'employee_sip' based on DB schema
};

type LeaveStats = {
    totalQuota: number;
    usedThisYear: number;
    remainingQuota: number;
    usedThisMonth: number;
    monthlyQuota: number;
    monthlyLimit: number;
};

type LeaveHistory = {
    id: number;
    type_name: string;
    date_string: string;
    days: number;
    reason: string | null;
};

export default function Show({
    employee,
    documentTypes,
    leaveStats,
    leaveHistories,
}: {
    employee: EmployeeData;
    documentTypes: DocumentType[];
    leaveStats: LeaveStats;
    leaveHistories: LeaveHistory[];
}) {
    const { auth } = usePage().props as any;
    const { can } = usePermissions();

    // Local states for Document actions
    const [docToDelete, setDocToDelete] = useState<number | null>(null);
    const [uploadFormOpen, setUploadFormOpen] = useState<number | null>(null);

    // States for progress bar mount animations
    const [displayAnnualProgress, setDisplayAnnualProgress] = useState(0);
    const [displayMonthlyProgress, setDisplayMonthlyProgress] = useState(0);

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

    const defaultTotal = 12;
    const annualPercentage =
        defaultTotal > 0 ? (leaveStats.remainingQuota / defaultTotal) * 100 : 0;

    // Updated logic: Match the "Available / Limit" text by showing remaining quota portion
    const monthlyPercentage =
        leaveStats.monthlyLimit > 0
            ? (leaveStats.monthlyQuota / leaveStats.monthlyLimit) * 100
            : 0;

    // Trigger mount animations
    useEffect(() => {
        setTimeout(() => {
            setDisplayAnnualProgress(annualPercentage);
            setDisplayMonthlyProgress(monthlyPercentage);
        }, 300);
    }, [annualPercentage, monthlyPercentage]);

    const calculateTenure = (joinDateStr: string): string => {
        const join = new Date(joinDateStr);
        const now = new Date();
        let years = now.getFullYear() - join.getFullYear();
        let months = now.getMonth() - join.getMonth();
        if (months < 0) {
            years--;
            months += 12;
        }
        const parts = [];
        if (years > 0) parts.push(`${years} tahun`);
        if (months > 0) parts.push(`${months} bulan`);
        return parts.length > 0 ? parts.join(' ') : 'Kurang dari 1 bulan';
    };

    const formatDate = (dateStr: string): string => {
        const d = new Date(dateStr);
        return d
            .toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
            .replace(/\//g, '-');
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
            <Head title={`Profil Karyawan: ${employee.full_name}`} />

            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 lg:p-8">
                {/* Back Button */}
                {/* <div>
                    <Link href="/employees">
                        <Button variant="ghost" size="sm" className="-ml-2">
                            <ChevronLeft className="mr-1 h-4 w-4" /> Kembali ke
                            Direktori
                        </Button>
                    </Link>
                </div> */}

                {/* header profile section */}
                <div className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserCircle className="h-16 w-16" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {employee.full_name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                                <span className="font-medium">
                                    {employee.position?.name ||
                                        'Jabatan Belum Diatur'}
                                </span>
                                <span className="hidden text-border sm:inline">
                                    •
                                </span>
                                <span className="font-mono text-sm">
                                    ID: {employee.user?.nip || 'N/A'}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {employee.user?.roles?.map((role) => (
                                    <Badge
                                        key={role.id}
                                        variant="secondary"
                                        className="capitalize"
                                    >
                                        {role.name}
                                    </Badge>
                                ))}
                                {/* <Badge variant="outline" className="capitalize bg-primary/5 text-primary border-primary/20">
                                    {employee.employee_status?.replace('_', ' ')}
                                </Badge> */}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={
                                can('employee.edit')
                                    ? `/employees/${employee.id}/edit`
                                    : editMyProfile().url
                            }
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-md"
                            >
                                <Pencil className="mr-1 mb-0.5 h-4 w-4" />
                                Edit Profil
                            </Button>
                        </Link>
                        {/* <Button size="sm">
                            <Download className="mr-2 h-4 w-4" /> Download
                            Resume
                        </Button> */}
                    </div>
                </div>

                {/* Tabs Navigation */}
                <Tabs defaultValue="informasi" className="w-full">
                    <TabsList className="mb-6 w-full justify-start rounded-none border-b bg-transparent p-0">
                        <TabsTrigger
                            value="informasi"
                            className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Informasi Umum
                        </TabsTrigger>
                        <TabsTrigger
                            value="job"
                            className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Detail Pekerjaan
                        </TabsTrigger>
                        <TabsTrigger
                            value="dokumen"
                            className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Dokumen Pendukung
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Pane: Informasi Umum & Cuti */}
                    <TabsContent value="informasi" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Personal Details Card */}
                            <Card className="shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Personal Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-muted p-2">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Email
                                            </p>
                                            <p className="text-base font-semibold">
                                                {employee.user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-muted p-2">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Join Date
                                            </p>
                                            <p className="text-base font-semibold">
                                                {formatDate(employee.join_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-muted p-2">
                                            <Clock className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Lama Kerja
                                            </p>
                                            <p className="text-base font-semibold">
                                                {calculateTenure(
                                                    employee.join_date,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {employee.employee_sip && (
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-full bg-muted p-2">
                                                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    No SIP
                                                </p>
                                                <p className="text-base font-semibold">
                                                    {employee.employee_sip}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-4 opacity-50">
                                        <div className="rounded-full bg-muted p-2">
                                            <Phone className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Phone
                                            </p>
                                            <p className="text-base">
                                                Belum ditambahkan
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Leave Status Card Redesign */}
                            <Card className="shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Leave Quota
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold">
                                            Status Cuti
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-muted-foreground">
                                                    Cuti Tahunan Tersisa
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {leaveStats.remainingQuota}{' '}
                                                    dari {leaveStats.totalQuota}{' '}
                                                    hari
                                                </span>
                                            </div>
                                            <Progress
                                                value={displayAnnualProgress}
                                                className="h-2"
                                                indicatorColor="bg-orange-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-muted-foreground">
                                                    Jatah Cuti Bulanan
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {leaveStats.monthlyQuota}{' '}
                                                    dari{' '}
                                                    {leaveStats.monthlyLimit}{' '}
                                                    hari
                                                </span>
                                            </div>
                                            <Progress
                                                value={displayMonthlyProgress}
                                                className="h-2"
                                                indicatorColor="bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                            />
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold">
                                            Riwayat Cuti
                                        </h4>
                                        {leaveHistories &&
                                        leaveHistories.length > 0 ? (
                                            <div className="space-y-4">
                                                {leaveHistories.map((leave) => (
                                                    <div
                                                        key={leave.id}
                                                        className="grid grid-cols-1 gap-2 border-b pb-4 text-sm last:border-0 last:pb-0 sm:grid-cols-3 sm:gap-4"
                                                    >
                                                        <div className="font-medium text-muted-foreground">
                                                            {leave.type_name}
                                                        </div>
                                                        <div className="text-foreground">
                                                            {leave.date_string}{' '}
                                                            <br />
                                                            <span className="text-xs text-muted-foreground">
                                                                ({leave.days}{' '}
                                                                hari)
                                                            </span>
                                                        </div>
                                                        <div className="text-foreground">
                                                            Deskripsi: <br />
                                                            <span className="text-muted-foreground">
                                                                {leave.reason ||
                                                                    '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="py-2 text-sm text-muted-foreground">
                                                Belum ada riwayat pengajuan cuti
                                                yang disetujui.
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab Pane: Detail Pekerjaan */}
                    <TabsContent value="job">
                        <Card className="shadow-none">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">
                                        Detail Pekerjaan (Job Details)
                                    </CardTitle>
                                    <CardDescription>
                                        Informasi struktural dan tanggung jawab
                                        karyawan.
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y border-t">
                                    <div className="grid grid-cols-1 gap-1 p-6 sm:grid-cols-3 sm:gap-4">
                                        <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <BuildingIcon className="h-4 w-4" />{' '}
                                            Departemen
                                        </dt>
                                        <dd className="text-sm font-semibold sm:col-span-2">
                                            {employee.department?.name || 'N/A'}
                                        </dd>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1 p-6 sm:grid-cols-3 sm:gap-4">
                                        <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Briefcase className="h-4 w-4" />{' '}
                                            Jabatan (Position)
                                        </dt>
                                        <dd className="text-sm font-semibold sm:col-span-2">
                                            {employee.position?.name || 'N/A'}
                                        </dd>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1 p-6 sm:grid-cols-3 sm:gap-4">
                                        <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <ShieldCheck className="h-4 w-4" />{' '}
                                            Status Pegawai
                                        </dt>
                                        <dd className="text-sm sm:col-span-2">
                                            <Badge
                                                variant="secondary"
                                                className="border-none bg-green-100 text-green-700 capitalize dark:bg-green-900/20 dark:text-green-400"
                                            >
                                                {employee.employee_status?.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </Badge>
                                        </dd>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1 p-6 opacity-50 sm:grid-cols-3 sm:gap-4">
                                        <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <UserCircle className="h-4 w-4" />{' '}
                                            Reporting Manager
                                        </dt>
                                        <dd className="text-sm italic sm:col-span-2">
                                            Data belum tersedia
                                        </dd>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab Pane: Dokumen Pendukung */}
                    <TabsContent value="dokumen">
                        <Card className="shadow-none">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Dokumen Karyawan
                                </CardTitle>
                                <CardDescription>
                                    Kelola berkas dan dokumen penting karyawan.
                                    Maks 5MB (PDF/JPG/PNG).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {documentTypes.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        Belum ada persyaratan jenis dokumen yang
                                        ditetapkan untuk jabatan ini.
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
                                                const isRequired =
                                                    type.positions?.[0]?.pivot
                                                        ?.is_required || false;
                                                return (
                                                    <div
                                                        key={type.id}
                                                        className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="rounded-md bg-muted p-2">
                                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold">
                                                                        {
                                                                            type.name
                                                                        }
                                                                    </span>
                                                                    {isRequired ? (
                                                                        <Badge
                                                                            variant="destructive"
                                                                            className="h-4 text-[10px]"
                                                                        >
                                                                            Wajib
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className="h-4 text-[10px]"
                                                                        >
                                                                            Opsional
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {type.description ||
                                                                        'Gunakan format scan asli.'}
                                                                </span>
                                                                {existingDoc && (
                                                                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                                                        Diperbarui
                                                                        pada{' '}
                                                                        {new Date(
                                                                            existingDoc.created_at,
                                                                        ).toLocaleDateString(
                                                                            'id-ID',
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
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
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-destructive hover:bg-destructive/10"
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
                                                                        open,
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
                                                                                        placeholder="Misal: Scan sertifikat asli..."
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
                    </TabsContent>
                </Tabs>

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
