import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    User,
    Briefcase,
    Calendar,
    Mail,
    Fingerprint,
    ShieldCheck,
    Stethoscope,
    Building2,
    UserCheck,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

export default function Create({
    roles,
    positions,
    departments,
}: {
    roles: any[];
    positions: any[];
    departments: any[];
}) {
    const { data, setData, post, processing, errors } = useInertiaForm({
        nip: '',
        full_name: '',
        email: '',
        position_id: '',
        department_id: '',
        employee_sip: '',
        employee_status: 'orientasi',
        join_date: '',
        leave_quota: 12,
        role: 'employee',
    });

    const submit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/employees');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Karyawan', href: '/employees' },
                { title: 'Tambah Karyawan', href: '/employees/create' },
            ]}
        >
            <Head title="Tambah Karyawan" />

            <div className="mx-auto w-full max-w-3xl p-4 lg:p-8">
                <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
                    {/* Header */}
                    <div className="mb-8 relative flex flex-col items-center">
                        <Link href="/employees" className="absolute left-0 top-0 hidden md:block">
                            <button type="button" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </button>
                        </Link>
                        
                        <div className="mt-8 md:mt-2 text-center space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Tambah Karyawan
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Lengkapi data di bawah untuk mendaftarkan anggota tim baru ke dalam sistem.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        {/* Section 1: Informasi Identitas */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-3">Informasi Identitas</h3>
                            
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2.5">
                                    <Label htmlFor="full_name" required>
                                        Nama Lengkap
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="full_name"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            placeholder="Masukkan nama lengkap"
                                            className={cn(
                                                'pl-9 focus-visible:ring-primary/30',
                                                errors.full_name && 'border-destructive'
                                            )}
                                            required
                                        />
                                    </div>
                                    {errors.full_name && (
                                        <p className="text-xs font-medium text-destructive">{errors.full_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="email" required>
                                        Email Perusahaan
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="nama@karyaone.id"
                                            className={cn(
                                                'pl-9 focus-visible:ring-primary/30',
                                                errors.email && 'border-destructive'
                                            )}
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs font-medium text-destructive">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="nip">
                                        NIP / Nomor Induk
                                    </Label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="nip"
                                            value={data.nip}
                                            onChange={(e) => setData('nip', e.target.value)}
                                            placeholder="Contoh: 2024001"
                                            className="pl-9 focus-visible:ring-primary/30"
                                        />
                                    </div>
                                    {errors.nip && (
                                        <p className="text-xs font-medium text-destructive">{errors.nip}</p>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="employee_sip">
                                        Nomor SIP (Jika Ada)
                                    </Label>
                                    <div className="relative">
                                        <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="employee_sip"
                                            value={data.employee_sip}
                                            onChange={(e) => setData('employee_sip', e.target.value)}
                                            placeholder="Masukkan nomor SIP"
                                            className="pl-9 focus-visible:ring-primary/30"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Detail Pekerjaan */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-3">Detail Pekerjaan</h3>
                            
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2.5">
                                    <Label htmlFor="position_id" required>
                                        Jabatan
                                    </Label>
                                    <Select
                                        value={data.position_id}
                                        onValueChange={(v) => setData('position_id', v)}
                                        required
                                    >
                                        <SelectTrigger id="position_id" className="focus:ring-primary/30">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder="Pilih jabatan" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {positions
                                                .filter(
                                                    (pos) =>
                                                        pos.department_id ===
                                                        parseInt(data.department_id)
                                                )
                                                .map((pos) => (
                                                    <SelectItem key={pos.id} value={pos.id.toString()}>
                                                        {pos.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.position_id && (
                                        <p className="text-xs font-medium text-destructive">{errors.position_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="department_id" required>
                                        Departemen
                                    </Label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(v) => {
                                            setData((prev) => ({
                                                ...prev,
                                                department_id: v,
                                                position_id: '',
                                            }));
                                        }}
                                        required
                                    >
                                        <SelectTrigger id="department_id" className="focus:ring-primary/30">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder="Pilih departemen" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department_id && (
                                        <p className="text-xs font-medium text-destructive">{errors.department_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="join_date" required>
                                        Tanggal Bergabung
                                    </Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                        <Input
                                            id="join_date"
                                            type="date"
                                            value={data.join_date}
                                            onChange={(e) => setData('join_date', e.target.value)}
                                            className={cn(
                                                'pl-9 focus-visible:ring-primary/30 [&::-webkit-calendar-picker-indicator]:ml-2',
                                                errors.join_date && 'border-destructive'
                                            )}
                                            required
                                        />
                                    </div>
                                    {errors.join_date && (
                                        <p className="text-xs font-medium text-destructive">{errors.join_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="employee_status" required>
                                        Status Pegawai
                                    </Label>
                                    <Select
                                        value={data.employee_status}
                                        onValueChange={(v) => setData('employee_status', v)}
                                        required
                                    >
                                        <SelectTrigger id="employee_status" className="focus:ring-primary/30">
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder="Pilih status" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="orientasi">Orientasi</SelectItem>
                                            <SelectItem value="tidak_tetap">Tidak Tetap / Kontrak</SelectItem>
                                            <SelectItem value="tetap">Tetap</SelectItem>
                                            <SelectItem value="keluar">Keluar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2.5 md:col-span-2">
                                    <Label htmlFor="role">
                                        Peran Sistem
                                    </Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(v) => setData('role', v)}
                                    >
                                        <SelectTrigger className="focus:ring-primary/30">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue placeholder="Pilih peran akses" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role: any) => (
                                                <SelectItem key={role.id} value={role.name}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Menentukan tingkat akses pengguna di dalam dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                            <Button
                                variant="secondary"
                                type="button"
                                className="w-full sm:w-1/2 bg-secondary/50 hover:bg-secondary"
                                asChild
                            >
                                <Link href="/employees">Batal</Link>
                            </Button>
                            
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-1/2 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {processing ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Simpan Data Karyawan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

