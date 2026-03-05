import { Head, Link } from '@inertiajs/react';
import { Users, CalendarOff, Clock, CheckCircle2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dasbor', href: '/dashboard' }];

interface AdminStats {
    totalEmployees: number;
    pendingLeaves: number;
    pendingOvertime: number;
    approvedLeavesThisMonth: number;
    approvedOvertimeThisMonth: number;
}

interface EmployeeStats {
    leaveQuota: number;
    pendingLeaves: number;
    approvedLeaves: number;
    pendingOvertime: number;
    approvedOvertimeThisMonth: number;
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    color,
    href,
}: {
    title: string;
    value: number | string;
    description?: string;
    icon: React.ElementType;
    color: string;
    href?: string;
}) {
    const content = (
        <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-1 text-3xl font-bold">{value}</p>
                    {description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                <div className={`rounded-full p-3 ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );

    if (href) return <Link href={href}>{content}</Link>;
    return content;
}

export default function Dashboard({
    stats,
    isManagerOrAdmin,
}: {
    stats: AdminStats | EmployeeStats;
    isManagerOrAdmin: boolean;
}) {
    const now = new Date();
    const monthYear = now.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
    });

    if (isManagerOrAdmin) {
        const s = stats as AdminStats;
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dasbor" />
                <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Dasbor
                        </h2>
                        <p className="text-muted-foreground">
                            Ringkasan Manajemen SDM untuk {monthYear}.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            title="Total Karyawan"
                            value={s.totalEmployees}
                            description="Terdaftar dalam sistem"
                            icon={Users}
                            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            href="/employees"
                        />
                        <StatCard
                            title="Pengajuan Cuti Menunggu"
                            value={s.pendingLeaves}
                            description="Menunggu persetujuan"
                            icon={CalendarOff}
                            color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                            href="/leave-requests"
                        />
                        <StatCard
                            title="Pengajuan Lembur Menunggu"
                            value={s.pendingOvertime}
                            description="Menunggu persetujuan"
                            icon={Clock}
                            color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                            href="/overtime-requests"
                        />
                        <StatCard
                            title="Cuti Disetujui Bulan Ini"
                            value={s.approvedLeavesThisMonth}
                            description={monthYear}
                            icon={CheckCircle2}
                            color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        />
                        <StatCard
                            title="Lembur Disetujui Bulan Ini"
                            value={s.approvedOvertimeThisMonth}
                            description={monthYear}
                            icon={CheckCircle2}
                            color="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
                        />
                    </div>
                </div>
            </AppLayout>
        );
    }

    const s = stats as EmployeeStats;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor" />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Dasbor Saya
                    </h2>
                    <p className="text-muted-foreground">
                        Ringkasan SDM pribadi Anda untuk {monthYear}.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Sisa Kuota Cuti"
                        value={s.leaveQuota}
                        description="Hari yang tersedia tahun ini"
                        icon={CalendarOff}
                        color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    />
                    <StatCard
                        title="Pengajuan Cuti Menunggu"
                        value={s.pendingLeaves}
                        description="Menunggu persetujuan manajer"
                        icon={CalendarOff}
                        color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                        href="/leave-requests"
                    />
                    <StatCard
                        title="Cuti Disetujui"
                        value={s.approvedLeaves}
                        description="Total hari cuti yang disetujui"
                        icon={CheckCircle2}
                        color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    />
                    <StatCard
                        title="Lembur Menunggu"
                        value={s.pendingOvertime}
                        description="Menunggu persetujuan manajer"
                        icon={Clock}
                        color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                        href="/overtime-requests"
                    />
                    <StatCard
                        title="Lembur Disetujui Bulan Ini"
                        value={s.approvedOvertimeThisMonth}
                        description={monthYear}
                        icon={CheckCircle2}
                        color="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
