import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/atoms/badge';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { EmptyState } from '@/components/molecules/empty-state';
import { Pagination } from '@/components/molecules/pagination';
import { AccountShell } from '@/components/organisms/account-shell';
import { formatDateTime, notificationMeta, relativeTime } from '@/lib/account';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { AccountNotification, Paginated } from '@/types/ecommerce';

type NotificationsIndexProps = {
    notifications: Paginated<AccountNotification>;
    unreadCount: number;
};

export default function NotificationsIndex({
    notifications,
    unreadCount,
}: NotificationsIndexProps) {
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [markingAll, setMarkingAll] = useState(false);

    const markAsRead = (notification: AccountNotification) => {
        if (notification.read_at) {
            return;
        }

        setPendingId(notification.id);

        router.patch(
            `/notifications/${notification.id}/read`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setPendingId(null),
            },
        );
    };

    const remove = (notification: AccountNotification) => {
        setPendingId(notification.id);

        router.delete(`/notifications/${notification.id}`, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setPendingId(null),
        });
    };

    const markAllAsRead = () => {
        setMarkingAll(true);

        router.post(
            '/notifications/read-all',
            {},
            {
                preserveScroll: true,
                onFinish: () => setMarkingAll(false),
            },
        );
    };

    const goToPage = (page: number) => {
        router.get('/notifications', page > 1 ? { page: String(page) } : {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <Head title="Notifications" />

            <AccountShell
                title="Notifications"
                description="Order updates, delivery progress, and account activity."
                eyebrow="Activity"
                action={
                    unreadCount > 0 ? (
                        <Button
                            variant="outline"
                            size="sm"
                            loading={markingAll}
                            onClick={markAllAsRead}
                        >
                            <Icon name="check" size="sm" />
                            Mark all as read
                        </Button>
                    ) : undefined
                }
            >
                {notifications.data.length > 0 ? (
                    <>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <Badge
                                variant={unreadCount > 0 ? 'brand' : 'neutral'}
                                size="sm"
                                dot={unreadCount > 0}
                            >
                                {unreadCount} unread
                            </Badge>
                            <span className="text-caption text-ink-muted">
                                {notifications.total}{' '}
                                {notifications.total === 1
                                    ? 'notification'
                                    : 'notifications'}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {notifications.data.map((notification) => {
                                const unread = !notification.read_at;
                                const isPending = pendingId === notification.id;
                                const meta = notificationMeta(notification);

                                return (
                                    <article
                                        key={notification.id}
                                        className={cn(
                                            cardSurface,
                                            'p-5',
                                            unread &&
                                                'border-brand/30 bg-brand-soft/30',
                                            isPending && 'opacity-70',
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span
                                                className={cn(
                                                    'flex size-10 shrink-0 items-center justify-center rounded-full',
                                                    unread
                                                        ? 'bg-brand-solid text-on-brand'
                                                        : 'bg-surface-muted text-ink-muted',
                                                )}
                                            >
                                                <Icon
                                                    name={meta.icon}
                                                    size="md"
                                                />
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-small text-ink font-semibold">
                                                        {meta.title}
                                                    </h2>
                                                    {unread && (
                                                        <span
                                                            aria-hidden="true"
                                                            className="bg-brand-solid size-2 rounded-full"
                                                        />
                                                    )}
                                                    {unread && (
                                                        <span className="sr-only">
                                                            Unread
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-small text-ink-muted mt-1">
                                                    {notification.data.message}
                                                </p>

                                                <div className="text-caption text-ink-subtle mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <time
                                                        dateTime={
                                                            notification.created_at
                                                        }
                                                        title={formatDateTime(
                                                            notification.created_at,
                                                        )}
                                                    >
                                                        {relativeTime(
                                                            notification.created_at,
                                                        )}
                                                    </time>

                                                    {meta.href &&
                                                        meta.linkLabel && (
                                                            <Link
                                                                href={meta.href}
                                                                className="text-brand hover:text-brand-ink font-medium transition-colors"
                                                                onClick={() =>
                                                                    markAsRead(
                                                                        notification,
                                                                    )
                                                                }
                                                            >
                                                                {meta.linkLabel}
                                                            </Link>
                                                        )}
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-1">
                                                {unread && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isPending}
                                                        onClick={() =>
                                                            markAsRead(
                                                                notification,
                                                            )
                                                        }
                                                    >
                                                        <Icon
                                                            name="check"
                                                            size="sm"
                                                        />
                                                        <span className="hidden sm:inline">
                                                            Mark read
                                                        </span>
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Delete notification"
                                                    disabled={isPending}
                                                    onClick={() =>
                                                        remove(notification)
                                                    }
                                                >
                                                    <Icon
                                                        name="trash"
                                                        size="sm"
                                                    />
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {notifications.last_page > 1 && (
                            <Pagination
                                currentPage={notifications.current_page}
                                totalPages={notifications.last_page}
                                onPageChange={goToPage}
                                className="mt-6"
                            />
                        )}
                    </>
                ) : (
                    <EmptyState
                        title="No notifications"
                        description="Order updates and account activity will appear here."
                        icon="bell"
                        action={
                            <Link href="/products" className={buttonStyles()}>
                                Browse products
                            </Link>
                        }
                    />
                )}
            </AccountShell>
        </>
    );
}
