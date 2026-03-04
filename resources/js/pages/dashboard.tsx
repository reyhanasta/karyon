import { Head, Link } from '@inertiajs/react';
import { Users, CalendarOff, Clock, CheckCircle2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

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
                <Head title="Dashboard" />
                <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Dashboard
                        </h2>
                        <p className="text-muted-foreground">
                            HR Management overview for {monthYear}.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            title="Total Employees"
                            value={s.totalEmployees}
                            description="Registered in the system"
                            icon={Users}
                            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            href="/employees"
                        />
                        <StatCard
                            title="Pending Leave Requests"
                            value={s.pendingLeaves}
                            description="Awaiting approval"
                            icon={CalendarOff}
                            color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                            href="/leave-requests"
                        />
                        <StatCard
                            title="Pending Overtime Requests"
                            value={s.pendingOvertime}
                            description="Awaiting approval"
                            icon={Clock}
                            color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                            href="/overtime-requests"
                        />
                        <StatCard
                            title="Leaves Approved This Month"
                            value={s.approvedLeavesThisMonth}
                            description={monthYear}
                            icon={CheckCircle2}
                            color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        />
                        <StatCard
                            title="Overtime Approved This Month"
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
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        My Dashboard
                    </h2>
                    <p className="text-muted-foreground">
                        Your personal HR summary for {monthYear}.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Leave Quota Remaining"
                        value={s.leaveQuota}
                        description="Days available this year"
                        icon={CalendarOff}
                        color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    />
                    <StatCard
                        title="Pending Leave Requests"
                        value={s.pendingLeaves}
                        description="Awaiting manager approval"
                        icon={CalendarOff}
                        color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                        href="/leave-requests"
                    />
                    <StatCard
                        title="Approved Leaves"
                        value={s.approvedLeaves}
                        description="Total approved leave days taken"
                        icon={CheckCircle2}
                        color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    />
                    <StatCard
                        title="Pending Overtime"
                        value={s.pendingOvertime}
                        description="Awaiting manager approval"
                        icon={Clock}
                        color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                        href="/overtime-requests"
                    />
                    <StatCard
                        title="Overtime Approved This Month"
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
