import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

type Employee = { id: number; full_name: string };

export default function Create({
    leaveQuota,
    monthlyLimit,
    monthlyRemaining,
    employees,
    canCreateAny,
}: {
    leaveQuota?: number;
    monthlyLimit?: number;
    monthlyUsage?: Record<string, number>;
    currentMonth?: string;
    monthlyRemaining?: number;
    employees?: Employee[];
    canCreateAny: boolean;
}) {
    const { data, setData, post, processing, errors } = useInertiaForm<{
        employee_id: string;
        start_date: string;
        end_date: string;
        reason: string;
    }>({
        employee_id: '',
        start_date: '',
        end_date: '',
        reason: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/leave-requests');
    };

    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Pengajuan Cuti', href: '/leave-requests' },
                { title: 'Ajukan Cuti', href: '/leave-requests/create' },
            ]}
        >
            <Head title="Ajukan Cuti" />
            <div className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col gap-4 p-4 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Ajukan Cuti
                    </h2>
                    <p className="text-muted-foreground">
                        {canCreateAny
                            ? 'Ajukan cuti atas nama karyawan.'
                            : 'Buat pengajuan cuti baru.'}
                    </p>
                </div>

                {/* Quota Summary - only for regular employees */}
                {!canCreateAny &&
                    leaveQuota !== undefined &&
                    monthlyRemaining !== undefined && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-md border bg-card p-4 text-card-foreground shadow-sm">
                                    <p className="text-sm text-muted-foreground">
                                        Sisa Tahunan
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {leaveQuota}{' '}
                                        <span className="text-sm font-normal text-muted-foreground">
                                            hari
                                        </span>
                                    </p>
                                </div>
                                <div className="rounded-md border bg-card p-4 text-card-foreground shadow-sm">
                                    <p className="text-sm text-muted-foreground">
                                        Sisa Bulan Ini
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {monthlyRemaining}{' '}
                                        <span className="text-sm font-normal text-muted-foreground">
                                            / {monthlyLimit} hari
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Maksimal {monthlyLimit} hari cuti per bulan
                                    kalender. Total tahunan: 12 hari.
                                </AlertDescription>
                            </Alert>
                        </>
                    )}

                <div className="rounded-md border bg-card p-6 text-card-foreground shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Employee selector for admin/HRD */}
                        {canCreateAny && employees && (
                            <div className="space-y-2">
                                <Label htmlFor="employee_id">Karyawan</Label>
                                <Select
                                    value={data.employee_id}
                                    onValueChange={(val) =>
                                        setData('employee_id', val)
                                    }
                                >
                                    <SelectTrigger id="employee_id">
                                        <SelectValue placeholder="Pilih karyawan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem
                                                key={emp.id}
                                                value={String(emp.id)}
                                            >
                                                {emp.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.employee_id && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.employee_id}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">
                                    Tanggal Mulai
                                </Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    min={
                                        !canCreateAny
                                            ? todayFormatted
                                            : undefined
                                    }
                                    onChange={(e) =>
                                        setData('start_date', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.start_date && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.start_date}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">
                                    Tanggal Selesai
                                </Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date}
                                    min={
                                        !canCreateAny
                                            ? data.start_date || todayFormatted
                                            : data.start_date
                                    }
                                    onChange={(e) =>
                                        setData('end_date', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.end_date && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.end_date}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Alasan Cuti</Label>
                            <Textarea
                                id="reason"
                                value={data.reason}
                                onChange={(e) =>
                                    setData('reason', e.target.value)
                                }
                                className="min-h-25 w-full"
                                placeholder="Harap berikan alasan yang valid."
                                required
                            />
                            {errors.reason && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.reason}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Link href="/leave-requests">
                                <Button variant="outline" type="button">
                                    Batal
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    (!canCreateAny &&
                                        ((leaveQuota ?? 0) <= 0 ||
                                            (monthlyRemaining ?? 0) <= 0))
                                }
                            >
                                Kirim Pengajuan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
