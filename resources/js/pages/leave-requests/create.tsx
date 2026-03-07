import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import { AlertCircle, Paperclip } from 'lucide-react';
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
type LeaveType = {
    id: number;
    name: string;
    max_days_per_year: number;
    requires_attachment: boolean;
    description: string | null;
};
type TypeUsage = Record<
    number,
    { used: number; max: number; remaining: number }
>;

export default function Create({
    leaveQuota,
    monthlyLimit,
    monthlyRemaining,
    employees,
    leaveTypes,
    typeUsage,
    canCreateAny,
}: {
    leaveQuota?: number;
    monthlyLimit?: number;
    monthlyUsage?: Record<string, number>;
    currentMonth?: string;
    monthlyRemaining?: number;
    employees?: Employee[];
    leaveTypes: LeaveType[];
    typeUsage?: TypeUsage;
    canCreateAny: boolean;
}) {
    const { data, setData, post, processing, errors } = useInertiaForm<{
        employee_id: string;
        leave_type_id: string;
        start_date: string;
        end_date: string;
        reason: string;
        attachment: File | null;
    }>({
        employee_id: '',
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
        attachment: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/leave-requests', {
            forceFormData: true,
        });
    };

    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const selectedType = leaveTypes.find(
        (t) => String(t.id) === data.leave_type_id,
    );
    const selectedTypeUsage =
        selectedType && typeUsage ? typeUsage[selectedType.id] : null;

    // Check if selected type is "Cuti Tahunan" to show monthly info
    const isCutiTahunan = selectedType?.name === 'Cuti Tahunan';

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

                {/* Quota Summary - shown when a type is selected */}
                {!canCreateAny && selectedTypeUsage && (
                    <>
                        <div
                            className={`grid gap-4 ${isCutiTahunan ? 'grid-cols-3' : 'grid-cols-2'}`}
                        >
                            <div className="rounded-md border bg-card p-4 text-card-foreground shadow-sm">
                                <p className="text-sm text-muted-foreground">
                                    Kuota {selectedType?.name}
                                </p>
                                <p className="text-2xl font-bold">
                                    {selectedTypeUsage.remaining}{' '}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        / {selectedTypeUsage.max} hari
                                    </span>
                                </p>
                            </div>
                            {isCutiTahunan && (
                                <>
                                    <div className="rounded-md border bg-card p-4 text-card-foreground shadow-sm">
                                        <p className="text-sm text-muted-foreground">
                                            Sisa Kuota Tahunan
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
                                </>
                            )}
                        </div>

                        {isCutiTahunan && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Maksimal {monthlyLimit} hari cuti tahunan
                                    per bulan kalender.
                                </AlertDescription>
                            </Alert>
                        )}
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

                        {/* Leave Type selector */}
                        <div className="space-y-2">
                            <Label htmlFor="leave_type_id">Jenis Cuti</Label>
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
                                            {type.max_days_per_year} hari/tahun)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedType?.description && (
                                <p className="text-xs text-muted-foreground">
                                    {selectedType.description}
                                </p>
                            )}
                            {errors.leave_type_id && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.leave_type_id}
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

                        {/* Attachment upload */}
                        <div className="space-y-2">
                            <Label htmlFor="attachment">
                                <Paperclip className="mr-1 inline h-4 w-4" />
                                Lampiran
                                {selectedType?.requires_attachment
                                    ? ' (disarankan)'
                                    : ' (opsional)'}
                            </Label>
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
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: JPG, PNG, PDF. Maks 2MB.
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
                                Kirim Pengajuan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
