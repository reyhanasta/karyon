import { Head, Link, useForm } from '@inertiajs/react';
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

type ShiftChangeRequest = {
    id: number;
    requester_id: number;
    target_id: number;
    request_date: string;
    requester_shift_id: number;
    reason: string;
    status: string;
    requester?: Employee;
    target?: Employee;
    requester_shift?: Shift;
};

export default function Edit({
    request,
    shifts,
    employees = [],
    
}: {
    request: ShiftChangeRequest;
    shifts: Shift[];
    employees?: Employee[];
    
}) {
    const { data, setData, put, processing, errors } = useForm({
        requester_id: String(request.requester_id),
        request_date: request.request_date,
        requester_shift_id: String(request.requester_shift_id),
        target_id: String(request.target_id),
        reason: request.reason,
    });

    // Logic to determine available shifts and targets based on selected requester
    const selectedRequesterObj = useMemo(() => {
        return employees.find((e) => String(e.id) === data.requester_id);
    }, [data.requester_id, employees]);

    const availableShifts = useMemo(() => {
        if (!selectedRequesterObj) return [];
        return shifts.filter(
            (s) => s.department_id === selectedRequesterObj.department_id,
        );
    }, [shifts, selectedRequesterObj]);

    const availableTargets = useMemo(() => {
        if (!selectedRequesterObj) return [];
        return employees.filter(
            (e) =>
                e.position_id === selectedRequesterObj.position_id &&
                String(e.id) !== data.requester_id,
        );
    }, [employees, selectedRequesterObj, data.requester_id]);

    const selectedShift = availableShifts.find(
        (s) => String(s.id) === data.requester_shift_id,
    );
    const selectedTarget = availableTargets.find(
        (e) => String(e.id) === data.target_id,
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/shift-change-requests/${request.id}`);
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
                    title: 'Edit Pengajuan',
                    href: `/shift-change-requests/${request.id}/edit`,
                },
            ]}
        >
            <Head title="Edit Penggantian Shift" />

            <div className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col gap-4 p-4 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Edit Penggantian Shift
                    </h2>
                    <p className="text-muted-foreground">
                        Perbarui informasi pengajuan tukar shift Anda.
                    </p>
                </div>

                <div className="rounded-md border bg-card p-6 text-card-foreground shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Karyawan Pemohon</Label>
                            <div className="flex items-center gap-3 rounded-md border border-muted bg-muted/30 p-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                                    {getInitials(request.requester?.full_name || '')}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="truncate text-sm font-medium">
                                        {request.requester?.full_name}
                                    </div>
                                    <div className="truncate text-xs text-muted-foreground">
                                        {request.requester?.position?.name ?? 'Pegawai'} — {request.requester?.department?.name}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ShiftChangeFormFields
                            data={data}
                            setData={setData}
                            errors={errors}
                            shifts={availableShifts}
                            targetEmployees={availableTargets}
                            getInitials={getInitials}
                            selectedShift={selectedShift}
                            selectedTarget={selectedTarget}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Link href={`/shift-change-requests/${request.id}`}>
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
            {/* Tanggal */}
            <div className="space-y-2">
                <Label htmlFor="request_date" required>
                    Tanggal Penggantian
                </Label>
                <Input
                    id="request_date"
                    type="date"
                    value={data.request_date}
                    onChange={(e) => setData('request_date', e.target.value)}
                    required
                />
                {errors.request_date && (
                    <p className="text-sm font-medium text-destructive">
                        {errors.request_date}
                    </p>
                )}
            </div>

            {/* Shift yang Ditinggalkan */}
            <div className="space-y-2">
                <Label htmlFor="requester_shift_id" required>
                    Shift yang Perlu Digantikan
                </Label>
                <Select
                    value={data.requester_shift_id}
                    onValueChange={(val) => setData('requester_shift_id', val)}
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

            {/* Pilih Pengganti */}
            <div className="space-y-2">
                <Label htmlFor="target_id" required>
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
