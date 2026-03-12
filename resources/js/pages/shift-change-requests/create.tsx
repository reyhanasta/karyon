import { Head, Link, useForm } from '@inertiajs/react';
import { Save, User2, CalendarDays, Clock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

type Shift = { id: number; name: string; start_time: string; end_time: string };
type Employee = { id: number; full_name: string };

export default function Create({
    shifts,
    targetEmployees,
}: {
    shifts: Shift[];
    targetEmployees: Employee[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        request_date: '',
        requester_shift_id: '',
        target_id: '',
        reason: '',
    });

    const selectedShift = shifts.find(
        (s) => String(s.id) === data.requester_shift_id,
    );
    const selectedTarget = targetEmployees.find(
        (e) => String(e.id) === data.target_id,
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/shift-change-requests');
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
                    <p className="mt-1 text-muted-foreground">
                        Dokumentasikan siapa yang menggantikan shift Anda dan
                        kapan.
                    </p>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Formulir Penggantian</CardTitle>
                            <CardDescription>
                                Isi data penggantian shift dengan lengkap.
                                Pengganti Anda akan mendapatkan notifikasi untuk
                                konfirmasi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Tanggal */}
                            <div className="space-y-2">
                                <Label htmlFor="request_date">
                                    <CalendarDays className="mr-2 inline h-4 w-4 text-muted-foreground" />
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
                                    <p className="text-sm text-destructive">
                                        {errors.request_date}
                                    </p>
                                )}
                            </div>

                            {/* Shift yang Ditinggalkan */}
                            <div className="space-y-2">
                                <Label htmlFor="requester_shift_id">
                                    <Clock className="mr-2 inline h-4 w-4 text-muted-foreground" />
                                    Shift yang Perlu Digantikan
                                </Label>
                                <Select
                                    value={data.requester_shift_id}
                                    onValueChange={(val) =>
                                        setData('requester_shift_id', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih shift Anda yang ditinggalkan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shifts.map((s) => (
                                            <SelectItem
                                                key={s.id}
                                                value={String(s.id)}
                                            >
                                                {s.name} (
                                                {s.start_time.slice(0, 5)} –{' '}
                                                {s.end_time.slice(0, 5)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.requester_shift_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.requester_shift_id}
                                    </p>
                                )}
                            </div>

                            {/* Pilih Pengganti */}
                            <div className="space-y-2">
                                <Label htmlFor="target_id">
                                    <User2 className="mr-2 inline h-4 w-4 text-muted-foreground" />
                                    Karyawan Pengganti
                                </Label>
                                <Select
                                    value={data.target_id}
                                    onValueChange={(val) =>
                                        setData('target_id', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih karyawan yang akan menggantikan Anda..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {targetEmployees.map((emp) => (
                                            <SelectItem
                                                key={emp.id}
                                                value={String(emp.id)}
                                            >
                                                {emp.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.target_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.target_id}
                                    </p>
                                )}
                            </div>

                            {/* Summary Preview */}
                            {selectedShift &&
                                selectedTarget &&
                                data.request_date && (
                                    <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                                        <p className="font-semibold text-primary">
                                            Ringkasan Pengajuan
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">
                                                Tanggal:{' '}
                                            </span>
                                            <strong>{data.request_date}</strong>
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">
                                                Shift:{' '}
                                            </span>
                                            <strong>
                                                {selectedShift.name}
                                            </strong>{' '}
                                            (
                                            {selectedShift.start_time.slice(
                                                0,
                                                5,
                                            )}{' '}
                                            –{' '}
                                            {selectedShift.end_time.slice(0, 5)}
                                            )
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">
                                                Digantikan oleh:{' '}
                                            </span>
                                            <strong>
                                                {selectedTarget.full_name}
                                            </strong>
                                        </p>
                                    </div>
                                )}

                            {/* Alasan */}
                            <div className="space-y-2">
                                <Label htmlFor="reason">
                                    <HelpCircle className="mr-2 inline h-4 w-4 text-muted-foreground" />
                                    Alasan Penggantian
                                </Label>
                                <Textarea
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData('reason', e.target.value)
                                    }
                                    placeholder="Contoh: Ada keperluan keluarga mendadak yang tidak bisa ditunda..."
                                    className="min-h-24"
                                    required
                                />
                                {errors.reason && (
                                    <p className="text-sm text-destructive">
                                        {errors.reason}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" type="button" asChild>
                                <Link href="/shift-change-requests">Batal</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" /> Kirim
                                Pengajuan
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
