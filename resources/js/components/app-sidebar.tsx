import { Link } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    Clock,
    LayoutGrid,
    Users,
    UsersRound,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Karyawan',
        href: '/employees',
        icon: Users,
        permission: 'employee.view',
    },
    {
        title: 'Departemen',
        href: '/departments',
        icon: Building2,
        permission: 'employee.view',
    },
    {
        title: 'Jabatan',
        href: '/positions',
        icon: UsersRound,
        permission: 'employee.view',
    },
];

const Request: NavItem[] = [
    {
        title: 'Pengajuan Cuti',
        href: '/leave-requests',
        icon: Calendar,
        permission: 'leave.view',
    },
    {
        title: 'Pengajuan Lembur',
        href: '/overtime-requests',
        icon: Clock,
        permission: 'overtime.view',
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { can } = usePermissions();

    const visibleNavItems = mainNavItems.filter(
        (item) => !item.permission || can(item.permission),
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain title="Platform" items={visibleNavItems} />
                <NavMain title="Pengajuan" items={Request} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
