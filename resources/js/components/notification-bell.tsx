import { router, usePage } from '@inertiajs/react';
import { echo } from '@laravel/echo-react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NotificationData = {
    type: string;
    action: string;
    message: string;
    url: string;
    [key: string]: unknown;
};

type NotificationItem = {
    id: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
};

function getCsrfToken(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

export function NotificationBell() {
    const page = usePage();
    const { auth, unreadNotificationCount } = page.props as any;
    const userId = auth?.user?.id;

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(
        unreadNotificationCount ?? 0,
    );
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    // Sync unread count from Inertia shared data on page navigation
    useEffect(() => {
        setUnreadCount(unreadNotificationCount ?? 0);
    }, [unreadNotificationCount]);

    // Subscribe to private channel for real-time notifications
    useEffect(() => {
        if (!userId) return;

        const channelName = `App.Models.User.${userId}`;
        const channel = echo().private(channelName);

        channel.notification((notification: any) => {
            const newItem: NotificationItem = {
                id: notification.id,
                data: notification as NotificationData,
                read_at: null,
                created_at: 'Baru saja',
            };
            setNotifications((prev) => [newItem, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            echo().leave(channelName);
        };
    }, [userId]);

    // Fetch notifications when dropdown opens
    const fetchNotifications = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await fetch('/notifications', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await response.json();
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } finally {
            setLoading(false);
        }
    }, [loading]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            fetchNotifications();
        }
    };

    const markAsRead = async (id: string, url: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
            ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setOpen(false);
        router.visit(url);

        fetch(`/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
    };

    const markAllAsRead = async () => {
        if (markingAll) return;

        // Optimistic update — instantly update UI
        setMarkingAll(true);
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
        );
        setUnreadCount(0);

        try {
            await fetch('/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
        } finally {
            setMarkingAll(false);
        }
    };

    const actionLabel = (action: string) => {
        const map: Record<string, string> = {
            submitted: 'Pengajuan Baru',
            approved: 'Disetujui',
            rejected: 'Ditolak',
        };
        return map[action] ?? action;
    };

    const actionColor = (action: string) => {
        const map: Record<string, 'default' | 'secondary' | 'destructive'> = {
            submitted: 'default',
            approved: 'secondary',
            rejected: 'destructive',
        };
        return map[action] ?? 'default';
    };

    return (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="max-h-112 w-80 overflow-y-auto p-0"
            >
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="text-sm font-semibold">Notifikasi</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs"
                            onClick={markAllAsRead}
                            disabled={markingAll}
                        >
                            {markingAll ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                                <CheckCheck className="mr-1 h-3 w-3" />
                            )}
                            Tandai Semua Dibaca
                        </Button>
                    )}
                </div>

                {loading && notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Memuat...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Tidak ada notifikasi.
                    </div>
                ) : (
                    <div className="divide-y">
                        {notifications.map((notification) => (
                            <button
                                key={notification.id}
                                onClick={() =>
                                    markAsRead(
                                        notification.id,
                                        notification.data.url,
                                    )
                                }
                                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${
                                    !notification.read_at ? 'bg-accent/50' : ''
                                }`}
                            >
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={actionColor(
                                                notification.data.action,
                                            )}
                                            className="px-1.5 py-0 text-[10px]"
                                        >
                                            {actionLabel(
                                                notification.data.action,
                                            )}
                                        </Badge>
                                        <span className="text-[11px] text-muted-foreground">
                                            {notification.created_at}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-snug">
                                        {notification.data.message}
                                    </p>
                                </div>
                                {!notification.read_at && (
                                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
