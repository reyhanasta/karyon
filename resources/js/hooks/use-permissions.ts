import { usePage } from '@inertiajs/react';
import type { User } from '@/types';

export function usePermissions() {
    const { auth } = usePage().props as { auth: { user: User } };
    const user = auth?.user;
    const roles: string[] = user?.roles ?? [];
    const permissions: string[] = user?.permissions ?? [];

    const hasRole = (role: string | string[]): boolean => {
        const check = Array.isArray(role) ? role : [role];
        return check.some((r) => roles.includes(r));
    };

    const can = (permission: string | string[]): boolean => {
        // super-admin bypasses all permission checks
        if (roles.includes('super-admin')) return true;
        const check = Array.isArray(permission) ? permission : [permission];
        return check.some((p) => permissions.includes(p));
    };

    return { hasRole, can, roles, permissions, user };
}
