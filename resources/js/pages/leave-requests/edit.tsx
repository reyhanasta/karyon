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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

type Employee = { id: number; full_name: string };

type LeaveRequestData = {
    id: number;
    employee_id: number;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
    employee?: Employee;
};

export default function Edit({
    leaveRequest,
    employees,
}: {
    leaveRequest: LeaveRequestData;
    employees: Employee[];
}) {
    const { data, setData, put, processing, errors } = useInertiaForm({
        employee_id: String(leaveRequest.employee_id),
        start_date: leaveRequest.start_date,
        end_date: leaveRequest.end_date,
        reason: leaveRequest.reason,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/leave-requests/${leaveRequest.id}`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Pengajuan Cuti', href: '/leave-requests' },
                {
                    title: 'Edit Pengajuan',
                    href: `/leave-requests/${leaveRequest.id}/edit`,
                },
            ]}
        >
            <Head title="Edit Pengajuan Cuti" />
            <div className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col gap-4 p-4 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Edit Pengajuan Cuti
                    </h2>
                    <p className="text-muted-foreground">
                        Ubah detail pengajuan cuti di bawah ini.
                    </p>
                </div>

                <div className="rounded-md border bg-card p-6 text-card-foreground shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">
                                    Tanggal Mulai
                                </Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
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
                            <Button type="submit" disabled={processing}>
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
