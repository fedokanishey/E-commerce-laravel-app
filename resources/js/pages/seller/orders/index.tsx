import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/atoms/badge';
import { buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Select } from '@/components/atoms/select';
import { EmptyState } from '@/components/molecules/empty-state';
import { Pagination } from '@/components/molecules/pagination';
import { SellerShell } from '@/components/organisms/seller-shell';
import { orderStatusLabel, orderStatusTone } from '@/lib/account';
import { formatCurrency } from '@/lib/format';
import { formatDate } from '@/lib/storefront';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { OrderStatus, Paginated, SellerOrder } from '@/types/ecommerce';

type SellerOrdersIndexProps = {
    orders: Paginated<SellerOrder>;
    filters:
        | {
              status?: OrderStatus | null;
          }
        | [];
    statuses: Array<{
        value: OrderStatus;
        label: string;
    }>;
};

function currentFilters(filters: SellerOrdersIndexProps['filters']) {
    return Array.isArray(filters) ? {} : filters;
}

export default function SellerOrdersIndex({
    orders,
    filters,
    statuses,
}: SellerOrdersIndexProps) {
    const applied = currentFilters(filters);
    const status = applied.status ?? '';

    const visit = (nextStatus: string, page?: number) => {
        const query: Record<string, string> = {};

        if (nextStatus) {
            query.status = nextStatus;
        }

        if (page && page > 1) {
            query.page = String(page);
        }

        router.get('/seller/orders', query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <Head title="Seller orders" />

            <SellerShell
                title="Orders"
                description="Fulfil orders placed for products in your store."
                eyebrow="Fulfilment"
                action={
                    <span className="text-caption text-ink-muted flex items-center gap-1.5">
                        <Icon name="truck" size="sm" />
                        Keep statuses up to date
                    </span>
                }
            >
                <div
                    className={cn(
                        cardSurface,
                        'mb-5 flex flex-wrap items-end justify-between gap-3 p-4',
                    )}
                >
                    <div className="min-w-52 flex-1">
                        <Select
                            label="Filter by status"
                            value={status}
                            onChange={(event) => visit(event.target.value)}
                            containerClassName="max-w-xs"
                        >
                            <option value="">All statuses</option>
                            {statuses.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <p className="text-caption text-ink-muted">
                        {orders.total} {orders.total === 1 ? 'order' : 'orders'}
                    </p>
                </div>

                {orders.data.length > 0 ? (
                    <>
                        <div className="space-y-3">
                            {orders.data.map((sellerOrder) => {
                                const itemCount =
                                    sellerOrder.items?.reduce(
                                        (total, item) => total + item.quantity,
                                        0,
                                    ) ?? 0;

                                return (
                                    <article
                                        key={sellerOrder.id}
                                        className={cn(
                                            cardSurface,
                                            'p-4 sm:p-5',
                                        )}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Link
                                                        href={`/seller/orders/${sellerOrder.id}`}
                                                        className="text-small text-ink hover:text-brand font-semibold transition-colors"
                                                    >
                                                        {sellerOrder.order
                                                            ?.number ??
                                                            `Order #${sellerOrder.id}`}
                                                    </Link>
                                                    <Badge
                                                        variant={orderStatusTone(
                                                            sellerOrder.status,
                                                        )}
                                                        size="sm"
                                                        dot
                                                    >
                                                        {orderStatusLabel(
                                                            sellerOrder.status,
                                                        )}
                                                    </Badge>
                                                </div>

                                                <p className="text-caption text-ink-muted mt-1">
                                                    {sellerOrder.order?.user
                                                        ?.name ??
                                                        'Customer'}{' '}
                                                    ·{' '}
                                                    {formatDate(
                                                        sellerOrder.created_at,
                                                    )}{' '}
                                                    · {itemCount}{' '}
                                                    {itemCount === 1
                                                        ? 'item'
                                                        : 'items'}
                                                </p>
                                            </div>

                                            <div className="text-end">
                                                <p className="text-small text-ink font-semibold">
                                                    {formatCurrency(
                                                        sellerOrder.total,
                                                    )}
                                                </p>
                                                <p className="text-caption text-ink-subtle">
                                                    Your total
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-line mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                                            <p className="text-caption text-ink-muted truncate">
                                                Ship to{' '}
                                                {sellerOrder.order
                                                    ?.shipping_city ?? '—'}
                                                ,{' '}
                                                {sellerOrder.order
                                                    ?.shipping_country ?? '—'}
                                            </p>

                                            <Link
                                                href={`/seller/orders/${sellerOrder.id}`}
                                                className={buttonStyles({
                                                    variant: 'outline',
                                                    size: 'sm',
                                                })}
                                            >
                                                View order
                                                <Icon
                                                    name="arrow-right"
                                                    size="sm"
                                                />
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {orders.last_page > 1 && (
                            <Pagination
                                currentPage={orders.current_page}
                                totalPages={orders.last_page}
                                onPageChange={(page) => visit(status, page)}
                                className="mt-6"
                            />
                        )}
                    </>
                ) : (
                    <EmptyState
                        title={status ? `No ${status} orders` : 'No orders yet'}
                        description={
                            status
                                ? 'Try another status to see more orders.'
                                : 'Orders for your products will appear here.'
                        }
                        icon="package"
                    />
                )}
            </SellerShell>
        </>
    );
}
