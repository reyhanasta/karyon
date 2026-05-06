import { Head, Link, useForm } from '@inertiajs/react';
import {
    CheckCircle,
    Info,
    User2,
    UserRound,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { EmployeeCombobox } from '@/components/employee-combobox';
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

type Shift = {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    department_id?: number;
};
type Employee = {
    id: number;
    full_name: string;
    department_id?: number;
    position_id?: number;
    department?: { name: string };
    position?: { name: string };
};

export default function Create({
    shifts,
    myShifts = [],
    targetEmployees = [],
    employees = [],
    canCreateAny = false,
}: {
    shifts: Shift[];
    myShifts?: Shift[];
    targetEmployees?: Employee[];
    employees?: Employee[];
    canCreateAny?: boolean;
}) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        requester_id: '',
        request_date: '',
        requester_shift_id: '',
        target_id: '',
        reason: '',
    });

    // Logic to determine available shifts and targets based on selected requester
    const selectedRequesterObj = useMemo(() => {
        if (!canCreateAny || !data.requester_id) return null;
        return employees.find((e) => String(e.id) === data.requester_id);
    }, [canCreateAny, data.requester_id, employees]);

    const availableShifts = useMemo(() => {
        if (!canCreateAny) return shifts;
        if (!selectedRequesterObj) return [];
        return shifts.filter(
            (s) => s.department_id === selectedRequesterObj.department_id,
        );
    }, [canCreateAny, shifts, selectedRequesterObj]);

    const availableTargets = useMemo(() => {
        if (!canCreateAny) return targetEmployees;
        if (!selectedRequesterObj) return [];
        return employees.filter(
            (e) =>
                e.position_id === selectedRequesterObj.position_id &&
                String(e.id) !== data.requester_id,
        );
    }, [
        canCreateAny,
        targetEmployees,
        employees,
        selectedRequesterObj,
        data.requester_id,
    ]);

    const selectedShift = availableShifts.find(
        (s) => String(s.id) === data.requester_shift_id,
    );
    const selectedTarget = availableTargets.find(
        (e) => String(e.id) === data.target_id,
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/shift-change-requests');
    };

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Penggantian Shift', href: '/shift-change-requests' },
                {
                    title: 'Buat Pengajuan',
                    href: '/shift-change-requests/create',
                },
            ]}
        >
            <Head title="Ajukan Penggantian Shift" />

            <div className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col gap-4 p-4 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Ajukan Penggantian Shift
                    </h2>
                    <p className="text-muted-foreground">
                        {canCreateAny
                            ? 'Ajukan penggantian shift untuk diri sendiri atau pegawai lain.'
                            : 'Dokumentasikan siapa yang menggantikan shift Anda dan kapan.'}
                    </p>
                </div>

                <div className="rounded-md border bg-card p-6 text-card-foreground shadow-sm">
                    {canCreateAny ? (
                        <Tabs
                            defaultValue="self"
                            className="w-full space-y-6"
                            onValueChange={(val) => {
                                clearErrors();
                                if (val === 'self') {
                                    setData((d) => ({
                                        ...d,
                                        requester_id: '',
                                        requester_shift_id: '',
                                        target_id: '',
                                    }));
                                } else {
                                    setData((d) => ({
                                        ...d,
                                        requester_id: '',
                                        requester_shift_id: '',
                                        target_id: '',
                                    }));
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
                                    <ShiftChangeFormFields
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        shifts={myShifts}
                                        targetEmployees={targetEmployees}
                                        getInitials={getInitials}
                                        selectedShift={myShifts.find(
                                            (s) =>
                                                String(s.id) ===
                                                data.requester_shift_id,
                                        )}
                                        selectedTarget={targetEmployees.find(
                                            (e) =>
                                                String(e.id) === data.target_id,
                                        )}
                                    />
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Link href="/shift-change-requests">
                                            <Button
                                                variant="outline"
                                                type="button"
                                            >
                                                Batal
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            disabled={processing}
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

                                    <div className="space-y-2">
                                        <Label htmlFor="requester_id" required>
                                            Pilih Karyawan Pemohon
                                        </Label>
                                        {!data.requester_id ||
                                        !selectedRequesterObj ? (
                                            <EmployeeCombobox
                                                employees={employees}
                                                value={data.requester_id}
                                                onSelect={(val) =>
                                                    setData('requester_id', val)
                                                }
                                            />
                                        ) : (
                                            <div className="group relative">
                                                <div className="flex items-center gap-3 rounded-md border border-blue-500/15 bg-blue-500/5 p-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                        {getInitials(
                                                            selectedRequesterObj.full_name,
                                                        )}
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <div className="truncate text-sm font-medium">
                                                            {
                                                                selectedRequesterObj.full_name
                                                            }
                                                        </div>
                                                        <div className="truncate text-xs text-muted-foreground">
                                                            {selectedRequesterObj
                                                                .position
                                                                ?.name ??
                                                                'Pegawai'}{' '}
                                                            —{' '}
                                                            {
                                                                selectedRequesterObj
                                                                    .department
                                                                    ?.name
                                                            }
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-3 text-xs"
                                                        onClick={() =>
                                                            setData((d) => ({
                                                                ...d,
                                                                requester_id:
                                                                    '',
                                                                requester_shift_id:
                                                                    '',
                                                                target_id: '',
                                                            }))
                                                        }
                                                    >
                                                        Ganti
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        {errors.requester_id && (
                                            <p className="text-sm font-medium text-destructive">
                                                {errors.requester_id}
                                            </p>
                                        )}
                                    </div>

                                    {data.requester_id && (
                                        <>
                                            <div className="flex items-center gap-2 rounded-md border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-600 dark:text-blue-400">
                                                <Info className="h-4 w-4" />
                                                <span>
                                                    Shift akan difilter
                                                    berdasarkan departemen{' '}
                                                    <strong>
                                                        {
                                                            selectedRequesterObj
                                                                ?.department
                                                                ?.name
                                                        }
                                                    </strong>{' '}
                                                    dan calon pengganti akan
                                                    difilter berdasarkan jabatan{' '}
                                                    <strong>
                                                        {
                                                            selectedRequesterObj
                                                                ?.position?.name
                                                        }
                                                    </strong>
                                                    .
                                                </span>
                                            </div>

                                            <hr className="my-2 border-border" />

                                            <ShiftChangeFormFields
                                                data={data}
                                                setData={setData}
                                                errors={errors}
                                                shifts={availableShifts}
                                                targetEmployees={
                                                    availableTargets
                                                }
                                                getInitials={getInitials}
                                                selectedShift={selectedShift}
                                                selectedTarget={selectedTarget}
                                            />
                                        </>
                                    )}

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Link href="/shift-change-requests">
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
                                                processing || !data.requester_id
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
                            <ShiftChangeFormFields
                                data={data}
                                setData={setData}
                                errors={errors}
                                shifts={myShifts}
                                targetEmployees={targetEmployees}
                                getInitials={getInitials}
                                selectedShift={myShifts.find(
                                    (s) =>
                                        String(s.id) ===
                                        data.requester_shift_id,
                                )}
                                selectedTarget={targetEmployees.find(
                                    (e) => String(e.id) === data.target_id,
                                )}
                            />
                            <div className="flex justify-end gap-2 pt-4">
                                <Link href="/shift-change-requests">
                                    <Button variant="outline" type="button">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
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

function ShiftChangeFormFields({
    data,
    setData,
    errors,
    shifts,
    targetEmployees,
    getInitials,
    selectedShift,
    selectedTarget,
}: {
    data: any;
    setData: any;
    errors: any;
    shifts: Shift[];
    targetEmployees: Employee[];
    getInitials: (name: string) => string;
    selectedShift: Shift | undefined;
    selectedTarget: Employee | undefined;
}) {
    return (
        <>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {/* Tanggal */}
                <div className="space-y-2">
                    <Label htmlFor="request_date" required>
                        Tanggal Penggantian
                    </Label>
                    <Input
                        id="request_date"
                        type="date"
                        value={data.request_date}
                        onChange={(e) =>
                            setData('request_date', e.target.value)
                        }
                        required
                    />
                    {errors.request_date && (
                        <p className="text-sm font-medium text-destructive">
                            {errors.request_date}
                        </p>
                    )}
                </div>

                {/* Shift yang Ditinggalkan */}
                <div className="flex w-full flex-col space-y-2">
                    <Label htmlFor="requester_shift_id" required>
                        Shift yang Perlu Digantikan
                    </Label>
                    <Select
                        value={data.requester_shift_id}
                        onValueChange={(val) =>
                            setData('requester_shift_id', val)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih shift yang ditinggalkan..." />
                        </SelectTrigger>
                        <SelectContent>
                            {shifts.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                    {s.name} ({s.start_time.slice(0, 5)} –{' '}
                                    {s.end_time.slice(0, 5)})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.requester_shift_id && (
                        <p className="text-sm font-medium text-destructive">
                            {errors.requester_shift_id}
                        </p>
                    )}
                </div>
            </div>

            {/* Pilih Pengganti */}
            <div className="space-y-2">
                <Label
                    htmlFor="target_id"
                    className="flex flex-row items-center gap-2"
                    required
                >
                    <User2 className="h-4 w-4" />
                    Karyawan Pengganti
                </Label>
                <div className="group relative">
                    {!data.target_id || !selectedTarget ? (
                        <EmployeeCombobox
                            employees={targetEmployees}
                            value={data.target_id}
                            onSelect={(val) => setData('target_id', val)}
                        />
                    ) : (
                        <div className="flex items-center gap-3 rounded-md border border-blue-500/15 bg-blue-500/5 p-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {getInitials(selectedTarget.full_name)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="truncate text-sm font-medium">
                                    {selectedTarget.full_name}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                    {selectedTarget.position?.name ?? 'Pegawai'}{' '}
                                    — {selectedTarget.department?.name}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => setData('target_id', '')}
                            >
                                Ganti
                            </Button>
                        </div>
                    )}
                </div>
                {errors.target_id && (
                    <p className="text-sm font-medium text-destructive">
                        {errors.target_id}
                    </p>
                )}
            </div>

            {/* Summary Preview */}
            {selectedShift && selectedTarget && data.request_date && (
                <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                    <p className="font-semibold text-primary">
                        Ringkasan Pengajuan
                    </p>
                    <p>
                        <span className="text-muted-foreground">Tanggal: </span>
                        <strong>{data.request_date}</strong>
                    </p>
                    <p>
                        <span className="text-muted-foreground">Shift: </span>
                        <strong>{selectedShift.name}</strong> (
                        {selectedShift.start_time.slice(0, 5)} –{' '}
                        {selectedShift.end_time.slice(0, 5)})
                    </p>
                    <p>
                        <span className="text-muted-foreground">
                            Digantikan oleh:{' '}
                        </span>
                        <strong>{selectedTarget.full_name}</strong>
                    </p>
                </div>
            )}

            {/* Alasan */}
            <div className="space-y-2">
                <Label htmlFor="reason" required>
                    Alasan Penggantian
                </Label>
                <Textarea
                    id="reason"
                    value={data.reason}
                    onChange={(e) => setData('reason', e.target.value)}
                    placeholder="Contoh: Ada keperluan keluarga mendadak..."
                    className="min-h-25 w-full"
                    required
                />
                {errors.reason && (
                    <p className="text-sm font-medium text-destructive">
                        {errors.reason}
                    </p>
                )}
            </div>
        </>
    );
}
