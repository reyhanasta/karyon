import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    Info,
    Paperclip,
    UserRound,
    Users,
} from 'lucide-react';
import type { FormEventHandler } from 'react';
import { EmployeeCombobox } from '@/components/employee-combobox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

type Employee = {
    id: number;
    full_name: string;
    department?: { name: string };
    position?: { name: string };
};
type LeaveType = {
    id: number;
    name: string;
    max_days_per_year: number;
    requires_attachment: boolean;
    description: string | null;
};
type TypeUsage = Record<
    number,
    { used: number; max: number | null; remaining: number | null }
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
    const { data, setData, post, processing, errors, clearErrors } =
        useInertiaForm<{
            employee_id: string;
            leave_type_id: string;
            start_date: string;
            end_date: string;
            reason: string;
            attachment: File | null;
        }>({
            employee_id: '',
            leave_type_id:
                leaveTypes
                    .find((t) => t.name === 'Cuti Tahunan')
                    ?.id.toString() || '',
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

    const isFormDisabled = Boolean(
        leaveTypes.length === 0 ||
        (canCreateAny && employees && employees.length === 0),
    );

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const selectedEmployeeObj = employees?.find(
        (emp) => String(emp.id) === data.employee_id,
    );

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
                                    {selectedTypeUsage.max !== null
                                        ? selectedTypeUsage.remaining
                                        : '∞'}{' '}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        /{' '}
                                        {selectedTypeUsage.max !== null
                                            ? `${selectedTypeUsage.max} hari`
                                            : 'Tak Terbatas'}
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
                    {canCreateAny ? (
                        <Tabs
                            defaultValue={
                                typeof window !== 'undefined' &&
                                new URLSearchParams(window.location.search).get(
                                    'tab',
                                ) === 'other'
                                    ? 'other'
                                    : 'self'
                            }
                            className="w-full space-y-6"
                            onValueChange={(val) => {
                                clearErrors();
                                if (val === 'self') {
                                    setData('employee_id', '');
                                }
                            }}
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="self">
                                    <UserRound className="mr-2 h-4 w-4" />
                                    Diri Sendiri
                                </TabsTrigger>
                                <TabsTrigger value="other">
                                    <Users className="mr-2 h-4 w-4" />
                                    Pegawai Lain
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="self" className="space-y-6">
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>
                                            Pengajuan ini akan dicatat atas nama{' '}
                                            <strong>Anda sendiri</strong>.
                                        </span>
                                    </div>
                                    <LeaveFormFields
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        leaveTypes={leaveTypes}
                                        selectedType={selectedType}
                                        isFormDisabled={isFormDisabled}
                                        todayFormatted={todayFormatted}
                                        canCreateAny={false}
                                    />
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Link href="/leave-requests">
                                            <Button
                                                variant="outline"
                                                type="button"
                                            >
                                                Batal
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing || isFormDisabled
                                            }
                                        >
                                            Kirim Pengajuan
                                        </Button>
                                    </div>
                                </form>
                            </TabsContent>

                            <TabsContent value="other" className="space-y-6">
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="flex items-center gap-2 rounded-md border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-600 dark:text-blue-400">
                                        <Info className="h-4 w-4" />
                                        <span>
                                            Pengajuan ini akan dicatat atas nama{' '}
                                            <strong>
                                                pegawai yang dipilih
                                            </strong>
                                            .
                                        </span>
                                    </div>

                                    {/* Employee selector for admin/HRD */}
                                    {employees && (
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="employee_id"
                                                required
                                            >
                                                Pilih Karyawan
                                            </Label>
                                            {employees.length === 0 ? (
                                                <Button
                                                    asChild
                                                    className="w-full border-dashed"
                                                    type="button"
                                                >
                                                    <Link href="/employees/create">
                                                        + Tambah Karyawan
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <div className="group relative">
                                                    {!data.employee_id ||
                                                    !selectedEmployeeObj ? (
                                                        <EmployeeCombobox
                                                            employees={
                                                                employees
                                                            }
                                                            value={
                                                                data.employee_id
                                                            }
                                                            onSelect={(val) =>
                                                                setData(
                                                                    'employee_id',
                                                                    val,
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-3 rounded-md border border-blue-500/15 bg-blue-500/5 p-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                                {getInitials(
                                                                    selectedEmployeeObj?.full_name ??
                                                                        '',
                                                                )}
                                                            </div>
                                                            <div className="flex-1 overflow-hidden">
                                                                <div className="truncate text-sm font-medium">
                                                                    {
                                                                        selectedEmployeeObj?.full_name
                                                                    }
                                                                </div>
                                                                <div className="truncate text-xs text-muted-foreground">
                                                                    {selectedEmployeeObj
                                                                        ?.position
                                                                        ?.name ??
                                                                        'Pegawai'}{' '}
                                                                    —{' '}
                                                                    {selectedEmployeeObj
                                                                        ?.department
                                                                        ?.name ??
                                                                        'Tanpa Departemen'}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-3 text-xs"
                                                                onClick={() =>
                                                                    setData(
                                                                        'employee_id',
                                                                        '',
                                                                    )
                                                                }
                                                            >
                                                                Ganti
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {errors.employee_id &&
                                                employees.length > 0 && (
                                                    <p className="text-sm font-medium text-destructive">
                                                        {errors.employee_id}
                                                    </p>
                                                )}
                                        </div>
                                    )}

                                    {data.employee_id && (
                                        <hr className="my-2 border-border" />
                                    )}

                                    <LeaveFormFields
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        leaveTypes={leaveTypes}
                                        selectedType={selectedType}
                                        isFormDisabled={isFormDisabled}
                                        todayFormatted={todayFormatted}
                                        canCreateAny={true}
                                    />
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Link href="/leave-requests">
                                            <Button
                                                variant="outline"
                                                type="button"
                                            >
                                                Batal
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                isFormDisabled ||
                                                !data.employee_id
                                            }
                                        >
                                            Kirim Pengajuan
                                        </Button>
                                    </div>
                                </form>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <form onSubmit={submit} className="space-y-6">
                            <LeaveFormFields
                                data={data}
                                setData={setData}
                                errors={errors}
                                leaveTypes={leaveTypes}
                                selectedType={selectedType}
                                isFormDisabled={isFormDisabled}
                                todayFormatted={todayFormatted}
                                canCreateAny={false}
                            />
                            <div className="flex justify-end gap-2 pt-4">
                                <Link href="/leave-requests">
                                    <Button variant="outline" type="button">
                                        Batal
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing || isFormDisabled}
                                >
                                    Kirim Pengajuan
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function LeaveFormFields({
    data,
    setData,
    errors,
    leaveTypes,
    selectedType,
    isFormDisabled,
    todayFormatted,
    canCreateAny,
}: {
    data: any;
    setData: any;
    errors: any;
    leaveTypes: LeaveType[];
    selectedType?: LeaveType;
    isFormDisabled: boolean;
    todayFormatted: string;
    canCreateAny: boolean;
}) {
    return (
        <>
            {!isFormDisabled && (
                <>
                    {/* Leave Type selector */}
                    <div className="space-y-2">
                        <Label htmlFor="leave_type_id" required>
                            Jenis Cuti
                        </Label>
                        {leaveTypes.length === 0 ? (
                            <Button
                                asChild
                                variant="outline"
                                className="w-full border-dashed"
                                type="button"
                            >
                                <Link href="/leave-types">
                                    + Tambah Jenis Cuti
                                </Link>
                            </Button>
                        ) : (
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
                        )}
                        {selectedType?.description && leaveTypes.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {selectedType.description}
                            </p>
                        )}
                        {errors.leave_type_id && leaveTypes.length > 0 && (
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
                                min={!canCreateAny ? todayFormatted : undefined}
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
                        <Label htmlFor="reason" required>
                            Alasan Cuti
                        </Label>
                        <Textarea
                            id="reason"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
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
                            required={selectedType?.requires_attachment}
                        >
                            <Paperclip className="mr-1 inline h-4 w-4" />
                            Lampiran
                            {selectedType?.requires_attachment
                                ? ' (Wajib)'
                                : ' (Opsional)'}
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
                            required={selectedType?.requires_attachment}
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
                </>
            )}
        </>
    );
}
