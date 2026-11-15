import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/atoms/badge';
import { buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Select } from '@/components/atoms/select';
import { EmptyState } from '@/components/molecules/empty-state';
import { Pagination } from '@/components/molecules/pagination';
import { AccountShell } from '@/components/organisms/account-shell';
import { orderStatusLabel, orderStatusTone } from '@/lib/account';
import { formatCurrency } from '@/lib/format';
import { formatDate } from '@/lib/storefront';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus, Paginated } from '@/types/ecommerce';

type OrdersIndexProps = {
    orders: Paginated<Order>;
    filters:
        | {
              status?: OrderStatus | null;
              per_page?: number | null;
          }
        | [];
    statuses: Array<{
        value: OrderStatus;
        label: string;
    }>;
};

type Filters = {
    status?: OrderStatus | null;
    per_page?: number | null;
};

function currentFilters(filters: OrdersIndexProps['filters']): Filters {
    return Array.isArray(filters) ? {} : filters;
}

export default function OrdersIndex({
    orders,
    filters,
    statuses,
}: OrdersIndexProps) {
    const applied = currentFilters(filters);
    const status = applied.status ?? '';
    const perPage = applied.per_page ?? 10;

    const visit = (next: {
        status?: string;
        per_page?: string | number;
        page?: number;
    }) => {
        const query: Record<string, string> = {};
        const nextStatus = next.status ?? status;
        const nextPerPage = next.per_page ?? perPage;

        if (nextStatus) {
            query.status = nextStatus;
        }

        if (Number(nextPerPage) !== 10) {
            query.per_page = String(nextPerPage);
        }

        if (next.page && next.page > 1) {
            query.page = String(next.page);
        }

        router.get('/orders', query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <Head title="Your orders" />

            <AccountShell
                title="Orders"
                description="Follow every purchase from placement to delivery."
                eyebrow="Order history"
                action={
                    <Link
                        href="/products"
                        className={buttonStyles({
                            variant: 'outline',
                            size: 'sm',
                        })}
                    >
                        <Icon name="search" size="sm" />
                        Continue shopping
                    </Link>
                }
            >
                <div
                    className={cn(
                        cardSurface,
                        'mb-5 grid gap-3 p-4 sm:grid-cols-2',
                    )}
                >
                    <Select
                        label="Filter by status"
                        value={status}
                        onChange={(event) =>
                            visit({ status: event.target.value })
                        }
                    >
                        <option value="">All orders</option>
                        {statuses.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Orders per page"
                        value={String(perPage)}
                        onChange={(event) =>
                            visit({ per_page: event.target.value })
                        }
                    >
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                    </Select>
                </div>

                {orders.data.length > 0 ? (
                    <>
                        <p className="text-caption text-ink-muted mb-3">
                            Showing {orders.from ?? 0}–{orders.to ?? 0} of{' '}
                            {orders.total}{' '}
                            {orders.total === 1 ? 'order' : 'orders'}
                        </p>

                        <div className="space-y-3">
                            {orders.data.map((order) => {
                                const itemCount =
                                    order.items?.reduce(
                                        (total, item) => total + item.quantity,
                                        0,
                                    ) ?? 0;
                                const productNames =
                                    order.items
                                        ?.map((item) => item.product_name)
                                        .filter(Boolean) ?? [];

                                return (
                                    <article
                                        key={order.id}
                                        className={cn(cardSurface, 'p-5')}
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Link
                                                        href={`/orders/${order.id}`}
                                                        className="text-small text-ink hover:text-brand font-semibold transition-colors"
                                                    >
                                                        {order.number}
                                                    </Link>
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
                                                    {order.is_partially_cancelled &&
                                                        order.status !==
                                                            'cancelled' && (
                                                            <Badge
                                                                variant="danger"
                                                                size="sm"
                                                            >
                                                                Partially
                                                                cancelled
                                                            </Badge>
                                                        )}
                                                </div>

                                                <p className="text-caption text-ink-muted mt-1">
                                                    Placed{' '}
                                                    {formatDate(
                                                        order.placed_at,
                                                    )}{' '}
                                                    · {itemCount}{' '}
                                                    {itemCount === 1
                                                        ? 'item'
                                                        : 'items'}
                                                </p>

                                                {productNames.length > 0 && (
                                                    <p className="text-small text-ink-muted mt-2 line-clamp-1">
                                                        {productNames.join(
                                                            ', ',
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between gap-5 lg:justify-end">
                                                <div className="text-end">
                                                    <p className="text-caption text-ink-muted">
                                                        {order.amount_due &&
                                                        order.amount_due !==
                                                            order.grand_total
                                                            ? 'Amount due'
                                                            : 'Total'}
                                                    </p>
                                                    <p className="text-body text-ink font-semibold">
                                                        {formatCurrency(
                                                            order.amount_due ??
                                                                order.grand_total,
                                                        )}
                                                    </p>
                                                </div>

                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className={buttonStyles({
                                                        variant: 'outline',
                                                        size: 'sm',
                                                    })}
                                                >
                                                    View order
                                                    <Icon
                                                        name="chevron-right"
                                                        size="sm"
                                                    />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {orders.last_page > 1 && (
                            <Pagination
                                currentPage={orders.current_page}
                                totalPages={orders.last_page}
                                onPageChange={(page) => visit({ page })}
                                className="mt-6"
                            />
                        )}
                    </>
                ) : (
                    <EmptyState
                        title="No orders found"
                        description={
                            status
                                ? 'No orders match this status. Try a different filter.'
                                : 'When you place your first order, it will appear here.'
                        }
                        icon="package"
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
