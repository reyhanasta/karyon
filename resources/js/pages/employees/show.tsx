import { Head, Link } from '@inertiajs/react';
import {
    Briefcase,
    BuildingIcon,
    Calendar,
    ChevronLeft,
    Mail,
    UserCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';

type EmployeeData = {
    id: number;
    full_name: string;
    join_date: string;
    leave_quota: number;
    user: {
        id: number;
        nip: string;
        email: string;
        roles: { id: number; name: string }[];
    };
    position?: { name: string };
    department?: { name: string };
};

type LeaveStats = {
    totalQuota: number;
    usedThisYear: number;
    remainingQuota: number;
    usedThisMonth: number;
    monthlyLimit: number;
};

export default function Show({
    employee,
    leaveStats,
}: {
    employee: EmployeeData;
    leaveStats: LeaveStats;
}) {
    const { can } = usePermissions();

    // Calculate percentage for the progress bar. We want the bar to represent
    // the remaining quota out of the default total (12).
    const defaultTotal = 12;
    const remainingPercentage =
        defaultTotal > 0 ? (leaveStats.remainingQuota / defaultTotal) * 100 : 0;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Karyawan', href: '/employees' },
                {
                    title: employee.full_name,
                    href: `/employees/${employee.id}`,
                },
            ]}
        >
            <Head title={`Employee: ${employee.full_name}`} />

            <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col gap-6 p-4 lg:p-8">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Link href="/employees">
                        <Button variant="outline" size="sm">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Kembali ke
                            Direktori
                        </Button>
                    </Link>
                    {can('employee.edit') && (
                        <Link href={`/employees/${employee.id}/edit`}>
                            <Button size="sm">Edit Karyawan</Button>
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Left Column: Profile Card */}
                    <Card className="md:col-span-1">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <UserCircle className="h-16 w-16" />
                            </div>
                            <CardTitle className="text-xl">
                                {employee.full_name}
                            </CardTitle>
                            <CardDescription className="font-mono text-sm">
                                {employee.user?.nip || 'NIP tidak ditetapkan'}
                            </CardDescription>
                            <div className="mt-2 flex flex-wrap justify-center gap-1">
                                {employee.user?.roles?.map((role) => (
                                    <Badge key={role.id} variant="secondary">
                                        {role.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{employee.user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Bergabung {employee.join_date}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column: Work & Leave Details */}
                    <div className="flex flex-col gap-6 md:col-span-2">
                        {/* Employment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detail Pekerjaan</CardTitle>
                                <CardDescription>
                                    Pemetaan jabatan dan departemen saat ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Briefcase className="h-4 w-4" />{' '}
                                        Jabatan
                                    </span>
                                    <span className="text-base font-semibold">
                                        {employee.position?.name ||
                                            'Belum Ditetapkan'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <BuildingIcon className="h-4 w-4" />{' '}
                                        Departemen
                                    </span>
                                    <span className="text-base font-semibold">
                                        {employee.department?.name ||
                                            'Belum Ditetapkan'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leave Quota Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status Kuota Cuti</CardTitle>
                                <CardDescription>
                                    Jatah cuti tahunan dan bulanan untuk tahun
                                    ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Annual Quota Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-muted-foreground">
                                            Sisa Kuota Tahunan
                                        </span>
                                        <span className="font-bold">
                                            {leaveStats.remainingQuota} /{' '}
                                            {leaveStats.totalQuota} hari
                                        </span>
                                    </div>
                                    <Progress
                                        value={remainingPercentage}
                                        className="h-3 w-full"
                                        // A custom class could be added here to colorize based on percentage (e.g., green if high, orange if low)
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {leaveStats.usedThisYear} hari telah
                                        digunakan atau diajukan tahun ini dari
                                        total anggaran sebanyak{' '}
                                        {leaveStats.totalQuota} hari.
                                    </p>
                                </div>

                                {/* Monthly Usage */}
                                <div className="rounded-md border bg-muted/50 p-4">
                                    <h4 className="mb-2 text-sm font-medium">
                                        Penggunaan Bulan Ini
                                    </h4>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">
                                            {leaveStats.usedThisMonth}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            / {leaveStats.monthlyLimit} hari
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
