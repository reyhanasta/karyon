import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import {
    User,
    ArrowLeft,
    Save,
    Briefcase,
    Calendar,
    Mail,
    Fingerprint,
    ShieldCheck,
    Stethoscope,
    Lock,
    PieChart,
    UserCog,
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
import { usePermissions } from '@/hooks/use-permissions';

export default function Edit({
    employee,
    roles,
    positions,
    departments,
}: {
    employee: any;
    roles: any[];
    positions: any[];
    departments: any[];
}) {
    const { data, setData, put, processing, errors } = useInertiaForm({
        nip: employee.user?.nip || '',
        full_name: employee.full_name || '',
        email: employee.user?.email || '',
        password: '',
        position_id: employee.position_id?.toString() || '',
        department_id: employee.department_id?.toString() || '',
        employee_sip: employee.employee_sip || '',
        employee_status: employee.employee_status || 'orientasi',
        join_date: employee.join_date || '',
        leave_quota: employee.leave_quota || 12,
        role: employee.user?.roles?.[0]?.name || '',
    });

    const { can } = usePermissions();

    const submit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (can('employee.edit')) {
            put(`/employees/${employee.id}`);
        } else {
            put('/my-profile');
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Karyawan', href: '/employees' },
                {
                    title: 'Edit Karyawan',
                    href: `/employees/${employee.id}/edit`,
                },
            ]}
        >
            <Head title={`Edit Karyawan - ${employee.full_name}`} />

            <div className="mx-auto w-full max-w-4xl p-4 lg:p-8">
                {/* Header Section */}
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                                <UserCog className="h-6 w-6" />
                            </div>
                            <h2 className="bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold tracking-tight">
                                Edit Karyawan
                            </h2>
                        </div>
                        <p className="ml-12 text-sm text-muted-foreground">
                            Perbarui data profil dan pengaturan akses untuk{' '}
                            <span className="font-semibold text-foreground">
                                {employee.full_name}
                            </span>
                            .
                        </p>
                    </div>

                    <Link
                        href={
                            can('employee.edit')
                                ? `/employees/${employee.id}`
                                : '/my-profile'
                        }
                    >
                        <Button
                            variant="ghost"
                            className="group gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {/* Section 1: Informasi Identitas & Akun */}
                    <div className="relative">
                        <div className="relative rounded-2xl border bg-card p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-2 border-b pb-4">
                                <User className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">
                                    Identitas & Akun
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2.5">
                                    <Label
                                        htmlFor="full_name"
                                        required
                                        className="font-medium"
                                    >
                                        Nama Lengkap
                                    </Label>
                                    <Input
                                        id="full_name"
                                        value={data.full_name}
                                        onChange={(e) =>
                                            setData('full_name', e.target.value)
                                        }
                                        placeholder="Masukkan nama lengkap"
                                        className={cn(
                                            'focus-visible:ring-primary/30',
                                            errors.full_name &&
                                                'border-destructive',
                                        )}
                                        required
                                    />
                                    {errors.full_name && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.full_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <Label
                                        htmlFor="email"
                                        required
                                        className="flex items-center gap-1.5 font-medium"
                                    >
                                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                        Email Perusahaan
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        className={cn(
                                            'focus-visible:ring-primary/30',
                                            errors.email &&
                                                'border-destructive',
                                        )}
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <Label
                                        htmlFor="nip"
                                        className="flex items-center gap-1.5 font-medium"
                                    >
                                        <Fingerprint className="h-3.5 w-3.5 text-muted-foreground" />
                                        NIP / Nomor Induk
                                    </Label>
                                    <Input
                                        id="nip"
                                        value={data.nip}
                                        onChange={(e) =>
                                            setData('nip', e.target.value)
                                        }
                                        className="focus-visible:ring-primary/30"
                                    />
                                    {errors.nip && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.nip}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <Label
                                        htmlFor="employee_sip"
                                        className="flex items-center gap-1.5 font-medium"
                                    >
                                        <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                                        Nomor SIP
                                    </Label>
                                    <Input
                                        id="employee_sip"
                                        value={data.employee_sip}
                                        onChange={(e) =>
                                            setData(
                                                'employee_sip',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Jika ada"
                                        className="focus-visible:ring-primary/30"
                                    />
                                </div>

                                <div className="space-y-2.5 md:col-span-2">
                                    <Label
                                        htmlFor="password"
                                        className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400"
                                    >
                                        <Lock className="h-3.5 w-3.5" />
                                        Ubah Kata Sandi
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder="Kosongkan jika tidak ingin diubah"
                                        className="border-amber-500/20 focus-visible:ring-amber-500/30"
                                    />
                                    <p className="text-[11px] text-muted-foreground italic">
                                        Biarkan kosong untuk mempertahankan kata
                                        sandi saat ini.
                                    </p>
                                    {errors.password && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Informasi Pekerjaan & Akses */}
                    {can('employee.create') && (
                        <div className="relative">
                            <div className="relative rounded-2xl border bg-card p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-2 border-b pb-4">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">
                                        Detail Pekerjaan
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="position_id"
                                            required
                                            className="font-medium"
                                        >
                                            Jabatan
                                        </Label>
                                        <Select
                                            value={data.position_id}
                                            onValueChange={(v) =>
                                                setData('position_id', v)
                                            }
                                            required
                                        >
                                            <SelectTrigger className="focus:ring-primary/30">
                                                <SelectValue placeholder="Pilih jabatan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {positions.map((pos) => (
                                                    <SelectItem
                                                        key={pos.id}
                                                        value={pos.id.toString()}
                                                    >
                                                        {pos.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="department_id"
                                            required
                                            className="font-medium"
                                        >
                                            Departemen
                                        </Label>
                                        <Select
                                            value={data.department_id}
                                            onValueChange={(v) =>
                                                setData('department_id', v)
                                            }
                                            required
                                        >
                                            <SelectTrigger className="focus:ring-primary/30">
                                                <SelectValue placeholder="Pilih departemen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem
                                                        key={dept.id}
                                                        value={dept.id.toString()}
                                                    >
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="join_date"
                                            required
                                            className="flex items-center gap-1.5 font-medium"
                                        >
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            Tanggal Bergabung
                                        </Label>
                                        <Input
                                            id="join_date"
                                            type="date"
                                            value={data.join_date}
                                            onChange={(e) =>
                                                setData(
                                                    'join_date',
                                                    e.target.value,
                                                )
                                            }
                                            className="focus-visible:ring-primary/30"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="employee_status"
                                            required
                                            className="font-medium"
                                        >
                                            Status Pegawai
                                        </Label>
                                        <Select
                                            value={data.employee_status}
                                            onValueChange={(v) =>
                                                setData('employee_status', v)
                                            }
                                            required
                                        >
                                            <SelectTrigger className="focus:ring-primary/30">
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="orientasi">
                                                    Orientasi
                                                </SelectItem>
                                                <SelectItem value="tidak_tetap">
                                                    Tidak Tetap / Kontrak
                                                </SelectItem>
                                                <SelectItem value="tetap">
                                                    Tetap
                                                </SelectItem>
                                                <SelectItem value="keluar">
                                                    Keluar
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="leave_quota"
                                            required
                                            className="flex items-center gap-1.5 font-medium"
                                        >
                                            <PieChart className="h-3.5 w-3.5 text-muted-foreground" />
                                            Kuota Cuti Tahunan
                                        </Label>
                                        <Input
                                            id="leave_quota"
                                            type="number"
                                            value={data.leave_quota}
                                            onChange={(e) =>
                                                setData(
                                                    'leave_quota',
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                            className="focus-visible:ring-primary/30"
                                            required
                                        />
                                        {errors.leave_quota && (
                                            <p className="text-xs font-medium text-destructive">
                                                {errors.leave_quota}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="role"
                                            className="flex items-center gap-1.5 font-medium"
                                        >
                                            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                            Peran Sistem
                                        </Label>
                                        <Select
                                            value={data.role}
                                            onValueChange={(v) =>
                                                setData('role', v)
                                            }
                                        >
                                            <SelectTrigger className="focus:ring-primary/30">
                                                <SelectValue placeholder="Pilih peran akses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role: any) => (
                                                    <SelectItem
                                                        key={role.id}
                                                        value={role.name}
                                                    >
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-3 border-t pt-6 font-sans">
                        <Link
                            href={
                                can('employee.edit')
                                    ? `/employees/${employee.id}`
                                    : '/my-profile'
                            }
                        >
                            <Button
                                variant="outline"
                                type="button"
                                className="px-6"
                            >
                                Batal
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2 bg-primary px-8 font-medium text-white shadow-md shadow-primary/20"
                        >
                            {processing ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            ) : (
                                <Save className="h-4 w-4 text-white" />
                            )}
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
