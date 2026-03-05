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
        join_date: employee.join_date || '',
        leave_quota: employee.leave_quota || 12,
        role: employee.user?.roles?.[0]?.name || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/employees/${employee.id}`);
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
            <div className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col gap-4 p-4 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Edit Karyawan
                    </h2>
                    <p className="text-muted-foreground">
                        Perbarui data karyawan.
                    </p>
                </div>

                <div className="rounded-md border bg-card p-6 text-card-foreground shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nip">
                                    NIP (Nomor Induk Pegawai)
                                </Label>
                                <Input
                                    id="nip"
                                    type="text"
                                    value={data.nip}
                                    onChange={(e) =>
                                        setData('nip', e.target.value)
                                    }
                                    className="w-full"
                                />
                                {errors.nip && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.nip}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Nama Lengkap</Label>
                                <Input
                                    id="full_name"
                                    type="text"
                                    value={data.full_name}
                                    onChange={(e) =>
                                        setData('full_name', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.full_name && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.full_name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Kata Sandi (Kosongkan jika tidak ingin
                                    diubah)
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="w-full"
                                />
                                {errors.password && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="position_id">Jabatan</Label>
                                <Select
                                    value={data.position_id}
                                    onValueChange={(value) =>
                                        setData('position_id', value)
                                    }
                                    required
                                >
                                    <SelectTrigger
                                        id="position_id"
                                        className="w-full"
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
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.position_id}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department_id">
                                    Departemen
                                </Label>
                                <Select
                                    value={data.department_id}
                                    onValueChange={(value) =>
                                        setData('department_id', value)
                                    }
                                    required
                                >
                                    <SelectTrigger
                                        id="department_id"
                                        className="w-full"
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
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.department_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="join_date">
                                    Tanggal Bergabung
                                </Label>
                                <Input
                                    id="join_date"
                                    type="date"
                                    value={data.join_date}
                                    onChange={(e) =>
                                        setData('join_date', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.join_date && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.join_date}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leave_quota">Kuota Cuti</Label>
                                <Input
                                    id="leave_quota"
                                    type="number"
                                    value={data.leave_quota}
                                    onChange={(e) =>
                                        setData(
                                            'leave_quota',
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.leave_quota && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.leave_quota}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Peran Sistem</Label>
                            <Select
                                onValueChange={(value) =>
                                    setData('role', value)
                                }
                                defaultValue={data.role}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih peran" />
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
                            {errors.role && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.role}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Link href="/employees">
                                <Button variant="outline" type="button">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                Perbarui Karyawan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
