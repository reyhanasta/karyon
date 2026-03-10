import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import { Paperclip } from 'lucide-react';
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
type LeaveType = {
    id: number;
    name: string;
    max_days_per_year: number;
    requires_attachment: boolean;
};

type LeaveRequestData = {
    id: number;
    employee_id: number;
    leave_type_id: number | null;
    start_date: string;
    end_date: string;
    reason: string;
    attachment_path: string | null;
    status: string;
    employee?: Employee;
};

export default function Edit({
    leaveRequest,
    employees,
    leaveTypes,
}: {
    leaveRequest: LeaveRequestData;
    employees: Employee[];
    leaveTypes: LeaveType[];
}) {
    const { data, setData, post, processing, errors } = useInertiaForm({
        _method: 'PUT',
        employee_id: String(leaveRequest.employee_id),
        leave_type_id: String(leaveRequest.leave_type_id || ''),
        start_date: leaveRequest.start_date,
        end_date: leaveRequest.end_date,
        reason: leaveRequest.reason,
        attachment: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/leave-requests/${leaveRequest.id}`, {
            forceFormData: true,
        });
    };

    const selectedType = leaveTypes.find(
        (t) => String(t.id) === data.leave_type_id,
    );

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
                            <Label htmlFor="employee_id" required>
                                Karyawan
                            </Label>
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

                        {/* Leave Type selector */}
                        <div className="space-y-2">
                            <Label htmlFor="leave_type_id" required>
                                Jenis Cuti
                            </Label>
                            <Select
                                value={data.leave_type_id}
                                onValueChange={(val) =>
                                    setData('leave_type_id', val)
                                }
                            >
                                <SelectTrigger id="leave_type_id">
                                    <SelectValue placeholder="Pilih jenis cuti" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveTypes.map((type) => (
                                        <SelectItem
                                            key={type.id}
                                            value={String(type.id)}
                                        >
                                            {type.name} (maks{' '}
                                            {type.max_days_per_year !== null
                                                ? `${type.max_days_per_year} hari/tahun`
                                                : 'Tak Terbatas'}
                                            )
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.leave_type_id && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.leave_type_id}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date" required>
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
                                <Label htmlFor="end_date" required>
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
                            <Label htmlFor="reason" required>
                                Alasan Cuti
                            </Label>
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

                        {/* Attachment upload */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="attachment"
                                required={
                                    selectedType?.requires_attachment &&
                                    !leaveRequest.attachment_path
                                }
                            >
                                <Paperclip className="mr-1 inline h-4 w-4" />
                                Lampiran
                                {selectedType?.requires_attachment
                                    ? leaveRequest.attachment_path
                                        ? ' (Opsional untuk diganti)'
                                        : ' (Wajib)'
                                    : ' (Opsional)'}
                            </Label>
                            {leaveRequest.attachment_path && (
                                <p className="text-xs text-muted-foreground">
                                    File saat ini:{' '}
                                    <a
                                        href={`/storage/${leaveRequest.attachment_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary underline"
                                    >
                                        Lihat lampiran
                                    </a>
                                </p>
                            )}
                            <Input
                                id="attachment"
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) =>
                                    setData(
                                        'attachment',
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                                className="w-full"
                                required={
                                    selectedType?.requires_attachment &&
                                    !leaveRequest.attachment_path
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: JPG, PNG, PDF. Maks 2MB. Kosongkan jika
                                tidak ingin mengganti.
                            </p>
                            {errors.attachment && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.attachment}
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
