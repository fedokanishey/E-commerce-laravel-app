import { Head, Link, usePage } from '@inertiajs/react';
import { Badge } from '@/components/atoms/badge';
import { buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { EmptyState } from '@/components/molecules/empty-state';
import { SectionHeading } from '@/components/molecules/section-heading';
import { StatCard } from '@/components/molecules/stat-card';
import { AccountShell } from '@/components/organisms/account-shell';
import { formatCurrency } from '@/lib/format';
import { orderStatusLabel, orderStatusTone } from '@/lib/account';
import { formatDate } from '@/lib/storefront';
import { cardSurface, focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { Order, SharedData } from '@/types/ecommerce';

type DashboardProps = {
    recentOrders: Order[];
    orderCounts: Record<string, number> | [];
    cartItemCount: number;
    wishlistItemCount: number;
    addressCount: number;
    unreadNotificationsCount: number;
};

function normalizeCounts(
    counts: Record<string, number> | [],
): Record<string, number> {
    return Array.isArray(counts) ? {} : counts;
}

export default function Dashboard({
    recentOrders,
    orderCounts,
    cartItemCount,
    wishlistItemCount,
    addressCount,
    unreadNotificationsCount,
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const counts = normalizeCounts(orderCounts);
    const totalOrders = Object.values(counts).reduce(
        (total, count) => total + Number(count),
        0,
    );
    const pendingOrders =
        Number(counts.pending ?? 0) + Number(counts.processing ?? 0);

    return (
        <>
            <Head title="Your account" />

            <AccountShell
                title="Overview"
                description={`Welcome back, ${auth.user?.name ?? 'there'}. Track orders, manage your details, and pick up where you left off.`}
                action={
                    <Link
                        href="/products"
                        className={buttonStyles({ variant: 'outline' })}
                    >
                        Continue shopping
                        <Icon name="arrow-right" size="sm" />
                    </Link>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total orders"
                        value={totalOrders}
                        helper={
                            pendingOrders > 0
                                ? `${pendingOrders} in progress`
                                : 'No orders in progress'
                        }
                        icon="package"
                    />
                    <StatCard
                        label="In your cart"
                        value={cartItemCount}
                        helper="Items ready to check out"
                        icon="shopping-bag"
                    />
                    <StatCard
                        label="Wishlist"
                        value={wishlistItemCount}
                        helper="Products you saved"
                        icon="heart"
                    />
                    <StatCard
                        label="Saved addresses"
                        value={addressCount}
                        helper="Delivery destinations"
                        icon="map-pin"
                    />
                </div>

                {unreadNotificationsCount > 0 && (
                    <div
                        className={cn(
                            cardSurface,
                            'border-brand/20 bg-brand-soft/50 mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between',
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <span className="bg-surface text-brand-ink flex size-10 shrink-0 items-center justify-center rounded-full">
                                <Icon name="bell" size="md" />
                            </span>
                            <div>
                                <p className="text-small text-ink font-semibold">
                                    You have {unreadNotificationsCount} unread{' '}
                                    {unreadNotificationsCount === 1
                                        ? 'notification'
                                        : 'notifications'}
                                </p>
                                <p className="text-caption text-ink-muted mt-0.5">
                                    Order updates and account activity appear
                                    here.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/notifications"
                            className={buttonStyles({
                                variant: 'secondary',
                                size: 'sm',
                            })}
                        >
                            View notifications
                        </Link>
                    </div>
                )}

                <div className="mt-10">
                    <SectionHeading
                        eyebrow="Order history"
                        title="Recent orders"
                        description="Your latest purchases and their current status."
                        action={
                            recentOrders.length > 0 ? (
                                <Link
                                    href="/orders"
                                    className={cn(
                                        'text-small text-brand hover:text-brand-ink inline-flex items-center gap-1.5 font-medium transition-colors',
                                        focusRing,
                                    )}
                                >
                                    View all orders
                                    <Icon name="arrow-right" size="sm" />
                                </Link>
                            ) : undefined
                        }
                    />

                    <div className="mt-5">
                        {recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                {recentOrders.map((order) => {
                                    const itemCount =
                                        order.items?.reduce(
                                            (total, item) =>
                                                total + item.quantity,
                                            0,
                                        ) ?? 0;

                                    return (
                                        <Link
                                            key={order.id}
                                            href={`/orders/${order.id}`}
                                            className={cn(
                                                cardSurface,
                                                'hover:border-brand/40 focus-visible:ring-brand/30 focus-visible:ring-offset-canvas block p-5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
                                            )}
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-small text-ink font-semibold">
                                                            {order.number}
                                                        </p>
                                                        <Badge
                                                            variant={orderStatusTone(
                                                                order.status,
                                                            )}
                                                            size="sm"
                                                            dot
                                                        >
                                                            {orderStatusLabel(
                                                                order.status,
                                                            )}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-caption text-ink-muted mt-1">
                                                        {formatDate(
                                                            order.placed_at,
                                                        )}{' '}
                                                        · {itemCount}{' '}
                                                        {itemCount === 1
                                                            ? 'item'
                                                            : 'items'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <span className="text-body text-ink font-semibold">
                                                        {formatCurrency(
                                                            order.grand_total,
                                                        )}
                                                    </span>
                                                    <Icon
                                                        name="chevron-right"
                                                        size="sm"
                                                        className="text-ink-subtle"
                                                    />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                title="No orders yet"
                                description="When you place an order, it will appear here with live status updates."
                                icon="package"
                                action={
                                    <Link
                                        href="/products"
                                        className={buttonStyles()}
                                    >
                                        Start shopping
                                    </Link>
                                }
                            />
                        )}
                    </div>
                </div>

                {!auth.seller && (
                    <div
                        className={cn(
                            cardSurface,
                            'mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between',
                        )}
                    >
                        <div className="flex items-start gap-4">
                            <span className="bg-brand-soft text-brand-ink flex size-11 shrink-0 items-center justify-center rounded-full">
                                <Icon name="store" size="lg" />
                            </span>
                            <div>
                                <h2 className="text-h3 text-ink">
                                    Have something to sell?
                                </h2>
                                <p className="text-small text-ink-muted mt-1 max-w-xl">
                                    Open your own storefront, list products, and
                                    manage orders from one dashboard.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/seller/onboarding"
                            className={buttonStyles({ variant: 'primary' })}
                        >
                            Become a seller
                            <Icon name="arrow-right" size="sm" />
                        </Link>
                    </div>
                )}
            </AccountShell>
        </>
    );
}
