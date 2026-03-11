import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import { CheckCircle, Info, UserRound, Users } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { EmployeeCombobox } from '@/components/employee-combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

type Employee = {
    id: number;
    full_name: string;
    department?: { name: string };
    position?: { name: string };
};

export default function Create({
    employees,
    canCreateAny,
}: {
    employees?: Employee[];
    canCreateAny: boolean;
}) {
    const { data, setData, post, processing, errors, clearErrors } =
        useInertiaForm<{
            employee_id: string;
            date: string;
            start_time: string;
            end_time: string;
            description: string;
        }>({
            employee_id: '',
            date: '',
            start_time: '',
            end_time: '',
            description: '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/overtime-requests');
    };

    const isFormDisabled = Boolean(
        canCreateAny && employees && employees.length === 0,
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
                { title: 'Pengajuan Lembur', href: '/overtime-requests' },
                {
                    title: 'Ajukan Lembur',
                    href: '/overtime-requests/create',
                },
            ]}
        >
            <Head title="Ajukan Lembur" />
            <div className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col gap-4 p-4 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Ajukan Lembur
                    </h2>
                    <p className="text-muted-foreground">
                        {canCreateAny
                            ? 'Ajukan lembur atas nama karyawan.'
                            : 'Buat pengajuan lembur baru.'}
                    </p>
                </div>

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
                                    <OvertimeFormFields
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        isFormDisabled={isFormDisabled}
                                    />
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Link href="/overtime-requests">
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
                                                    variant="default"
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

                                    <OvertimeFormFields
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        isFormDisabled={isFormDisabled}
                                    />
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Link href="/overtime-requests">
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
                            <OvertimeFormFields
                                data={data}
                                setData={setData}
                                errors={errors}
                                isFormDisabled={isFormDisabled}
                            />
                            <div className="flex justify-end gap-2 pt-4">
                                <Link href="/overtime-requests">
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

function OvertimeFormFields({
    data,
    setData,
    errors,
    isFormDisabled,
}: {
    data: any;
    setData: any;
    errors: any;
    isFormDisabled: boolean;
}) {
    return (
        <>
            {!isFormDisabled && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="date" required>
                            Tanggal Lembur
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            className="w-full"
                            required
                        />
                        {errors.date && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.date}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_time" required>
                                Waktu Mulai
                            </Label>
                            <Input
                                id="start_time"
                                type="time"
                                value={data.start_time}
                                onChange={(e) =>
                                    setData('start_time', e.target.value)
                                }
                                className="w-full"
                                required
                            />
                            {errors.start_time && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.start_time}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_time" required>
                                Waktu Selesai
                            </Label>
                            <Input
                                id="end_time"
                                type="time"
                                value={data.end_time}
                                onChange={(e) =>
                                    setData('end_time', e.target.value)
                                }
                                className="w-full"
                                required
                            />
                            {errors.end_time && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.end_time}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" required>
                            Deskripsi / Tugas Selesai
                        </Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            className="min-h-25 w-full"
                            placeholder="Jelaskan pekerjaan yang dilakukan selama lembur."
                            required
                        />
                        {errors.description && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.description}
                            </p>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
