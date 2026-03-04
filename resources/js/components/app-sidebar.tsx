import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    Calendar,
    Clock,
    FolderGit2,
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
        title: 'Employees',
        href: '/employees',
        icon: Users,
        permission: 'employee.view',
    },
    {
        title: 'Departments',
        href: '/departments',
        icon: Building2,
        permission: 'employee.view',
    },
    {
        title: 'Positions',
        href: '/positions',
        icon: UsersRound,
        permission: 'employee.view',
    },
    {
        title: 'Leave Requests',
        href: '/leave-requests',
        icon: Calendar,
        permission: 'leave.view',
    },
    {
        title: 'Overtime Requests',
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
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
