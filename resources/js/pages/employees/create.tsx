import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
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
import {
    UserPlus,
    ArrowLeft,
    Save,
    User,
    Briefcase,
    Calendar,
    Mail,
    Fingerprint,
    ShieldCheck,
    Stethoscope,
} from 'lucide-react';
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

    const submit: FormEventHandler = (e) => {
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

            <div className="mx-auto w-full max-w-4xl animate-in p-4 duration-700 fade-in slide-in-from-bottom-4 lg:p-8">
                {/* Header Section */}
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                                <UserPlus className="h-6 w-6" />
                            </div>
                            <h2 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold tracking-tight">
                                Tambah Karyawan
                            </h2>
                        </div>
                        <p className="ml-12 text-sm text-muted-foreground">
                            Lengkapi data di bawah untuk mendaftarkan anggota
                            tim baru ke dalam sistem.
                        </p>
                    </div>

                    <Link href="/employees">
                        <Button
                            variant="ghost"
                            className="group gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {/* Section 1: Informasi Dasar */}
                    <div className="group relative">
                        <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-primary/20 to-secondary/20 opacity-25 blur transition duration-1000 group-hover:opacity-40"></div>
                        <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-2 border-b pb-4">
                                <User className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">
                                    Informasi Identitas
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2.5">
                                    <Label
                                        htmlFor="full_name"
                                        required
                                        className="flex items-center gap-1.5 font-medium"
                                    >
                                        Nama Lengkap
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="full_name"
                                            value={data.full_name}
                                            onChange={(e) =>
                                                setData(
                                                    'full_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Masukkan nama lengkap"
                                            className={cn(
                                                'pl-3 focus-visible:ring-primary/30',
                                                errors.full_name &&
                                                    'border-destructive',
                                            )}
                                            required
                                        />
                                    </div>
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
                                        placeholder="nama@karyaone.id"
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
                                        placeholder="Contoh: 2024001"
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
                                        Nomor SIP (Jika Ada)
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
                                        placeholder="Masukkan nomor SIP"
                                        className="focus-visible:ring-primary/30"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Informasi Pekerjaan */}
                    <div className="group relative">
                        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-25 blur transition duration-1000 group-hover:opacity-40"></div>
                        <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm">
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
                                        <SelectTrigger
                                            id="position_id"
                                            className="focus:ring-primary/30"
                                        >
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
                                    {errors.position_id && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.position_id}
                                        </p>
                                    )}
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
                                        <SelectTrigger
                                            id="department_id"
                                            className="focus:ring-primary/30"
                                        >
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
                                    {errors.department_id && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.department_id}
                                        </p>
                                    )}
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
                                            setData('join_date', e.target.value)
                                        }
                                        className="focus-visible:ring-primary/30"
                                        required
                                    />
                                    {errors.join_date && (
                                        <p className="text-xs font-medium text-destructive">
                                            {errors.join_date}
                                        </p>
                                    )}
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
                                        <SelectTrigger
                                            id="employee_status"
                                            className="focus:ring-primary/30"
                                        >
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

                                <div className="space-y-2.5 md:col-span-2">
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
                                    <p className="text-[11px] text-muted-foreground">
                                        Menentukan tingkat akses pengguna di
                                        dalam dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-3 border-t pt-6 font-sans">
                        <Link href="/employees">
                            <Button
                                variant="outline"
                                type="button"
                                className="rounded-xl px-6"
                            >
                                Batal
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2 rounded-xl bg-primary px-8 shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                        >
                            {processing ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Simpan Data Karyawan
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
