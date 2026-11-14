import { Head, Link, usePage } from '@inertiajs/react';
import { Alert } from '@/components/molecules/alert';
import { Badge } from '@/components/atoms/badge';
import { buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { EmptyState } from '@/components/molecules/empty-state';
import { SectionHeading } from '@/components/molecules/section-heading';
import { StatCard } from '@/components/molecules/stat-card';
import { SellerShell } from '@/components/organisms/seller-shell';
import { orderStatusLabel, orderStatusTone } from '@/lib/account';
import { formatCurrency } from '@/lib/format';
import { formatDate } from '@/lib/storefront';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { SellerOverview, SharedData } from '@/types/ecommerce';

type SellerDashboardProps = {
    overview: SellerOverview;
};

export default function SellerDashboard({ overview }: SellerDashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const seller = auth.seller;
    const canManageStore = seller?.status === 'active';

    const quickActions = canManageStore
        ? [
              {
                  label: 'Add a product',
                  description: 'List something new in your store.',
                  href: '/seller/products/create',
                  icon: 'plus' as const,
              },
              {
                  label: 'Manage orders',
                  description: 'Review and update fulfilment status.',
                  href: '/seller/orders',
                  icon: 'truck' as const,
              },
              {
                  label: 'Store settings',
                  description: 'Update your store name and logo.',
                  href: '/seller/profile',
                  icon: 'settings' as const,
              },
          ]
        : [];

    return (
        <>
            <Head title="Seller dashboard" />

            <SellerShell
                title="Overview"
                description={`A snapshot of ${seller?.store_name ?? 'your store'} activity.`}
                action={
                    canManageStore ? (
                        <Link
                            href="/seller/products/create"
                            className={buttonStyles()}
                        >
                            <Icon name="plus" size="sm" />
                            New product
                        </Link>
                    ) : undefined
                }
            >
                {seller?.status === 'pending' && (
                    <Alert
                        tone="warning"
                        title="Your store is pending review"
                        className="mb-5"
                    >
                        You can review your dashboard while approval is
                        completed. Product, order, and profile tools unlock once
                        your store is active.
                    </Alert>
                )}

                {seller?.status === 'suspended' && (
                    <Alert
                        tone="danger"
                        title="Your store is suspended"
                        className="mb-5"
                    >
                        Product listings are hidden from customers. Contact
                        support if you believe this is a mistake.
                    </Alert>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total revenue"
                        value={formatCurrency(overview.revenue.total)}
                        helper={`${formatCurrency(overview.revenue.last_30_days)} in the last 30 days`}
                        trend={
                            overview.revenue.last_30_days > 0 ? 'up' : 'neutral'
                        }
                        icon="credit-card"
                    />
                    <StatCard
                        label="Seller orders"
                        value={overview.orderCounts.total}
                        helper={`${overview.orderCounts.pending} awaiting action`}
                        icon="truck"
                    />
                    <StatCard
                        label="Active products"
                        value={overview.productCounts.active}
                        helper={`${overview.productCounts.total} products total`}
                        icon="package"
                    />
                    <StatCard
                        label="Needs attention"
                        value={
                            overview.productCounts.out_of_stock +
                            overview.productCounts.pending_approval
                        }
                        helper={`${overview.productCounts.out_of_stock} out of stock`}
                        trend={
                            overview.productCounts.out_of_stock > 0
                                ? 'down'
                                : 'neutral'
                        }
                        icon="alert-circle"
                    />
                </div>

                <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
                    {canManageStore ? (
                        <div className="min-w-0">
                            <SectionHeading
                                eyebrow="Fulfilment"
                                title="Recent orders"
                                description="The latest orders placed with your store."
                                action={
                                    overview.recentOrders.length > 0 ? (
                                        <Link
                                            href="/seller/orders"
                                            className={buttonStyles({
                                                variant: 'ghost',
                                                size: 'sm',
                                            })}
                                        >
                                            View all
                                            <Icon
                                                name="arrow-right"
                                                size="sm"
                                            />
                                        </Link>
                                    ) : undefined
                                }
                            />

                            <div className="mt-5">
                                {overview.recentOrders.length > 0 ? (
                                    <div className="space-y-3">
                                        {overview.recentOrders.map((order) => {
                                            const itemCount =
                                                order.items?.reduce(
                                                    (total, item) =>
                                                        total + item.quantity,
                                                    0,
                                                ) ?? 0;

                                            return (
                                                <Link
                                                    key={order.id}
                                                    href={`/seller/orders/${order.id}`}
                                                    className={cn(
                                                        cardSurface,
                                                        'hover:border-brand/40 focus-visible:ring-brand/30 focus-visible:ring-offset-canvas block p-5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
                                                    )}
                                                >
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-small text-ink font-semibold">
                                                                    {order.order
                                                                        ?.number ??
                                                                        `Order #${order.order_id}`}
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
                                                                {order.order
                                                                    ?.user
                                                                    ?.name ??
                                                                    'Customer'}{' '}
                                                                · {itemCount}{' '}
                                                                {itemCount === 1
                                                                    ? 'item'
                                                                    : 'items'}{' '}
                                                                ·{' '}
                                                                {formatDate(
                                                                    order.created_at,
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <span className="text-small text-ink font-semibold">
                                                                {formatCurrency(
                                                                    order.total,
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
                                        description="Orders from customers will appear here as soon as they arrive."
                                        icon="truck"
                                        action={
                                            <Link
                                                href="/seller/products/create"
                                                className={buttonStyles()}
                                            >
                                                Add your first product
                                            </Link>
                                        }
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <section className={cn(cardSurface, 'p-5')}>
                            <h2 className="text-h3 text-ink">Store tools</h2>
                            <p className="text-small text-ink-muted mt-2">
                                Product, order, and profile tools become
                                available once your store is active.
                            </p>
                        </section>
                    )}

                    <aside className="space-y-5">
                        {quickActions.length > 0 && (
                            <section className={cn(cardSurface, 'p-5')}>
                                <h2 className="text-h3 text-ink">
                                    Quick actions
                                </h2>
                                <div className="mt-3 space-y-2">
                                    {quickActions.map((action) => (
                                        <Link
                                            key={action.href}
                                            href={action.href}
                                            className="hover:bg-surface-muted rounded-control flex items-center gap-3 px-2 py-2.5 transition-colors"
                                        >
                                            <span className="bg-brand-soft text-brand-ink flex size-9 shrink-0 items-center justify-center rounded-full">
                                                <Icon
                                                    name={action.icon}
                                                    size="sm"
                                                />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="text-small text-ink block font-medium">
                                                    {action.label}
                                                </span>
                                                <span className="text-caption text-ink-muted block">
                                                    {action.description}
                                                </span>
                                            </span>
                                            <Icon
                                                name="chevron-right"
                                                size="sm"
                                                className="text-ink-subtle shrink-0"
                                            />
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className={cn(cardSurface, 'p-5')}>
                            <h2 className="text-h3 text-ink">Best sellers</h2>

                            {overview.bestSellingProducts.length > 0 ? (
                                <ol className="mt-3 space-y-3">
                                    {overview.bestSellingProducts.map(
                                        (product, index) => (
                                            <li
                                                key={`${product.product_id ?? product.product_name}-${index}`}
                                                className="flex items-start gap-3"
                                            >
                                                <span className="bg-surface-muted text-ink-muted flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                                                    {index + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-small text-ink truncate font-medium">
                                                        {product.product_name}
                                                    </p>
                                                    <p className="text-caption text-ink-muted">
                                                        {Number(
                                                            product.sold_quantity,
                                                        )}{' '}
                                                        sold ·{' '}
                                                        {formatCurrency(
                                                            product.sales_total,
                                                        )}
                                                    </p>
                                                </div>
                                            </li>
                                        ),
                                    )}
                                </ol>
                            ) : (
                                <p className="text-small text-ink-muted mt-2">
                                    Sales data will appear once customers start
                                    ordering.
                                </p>
                            )}
                        </section>

                        <section className={cn(cardSurface, 'p-5')}>
                            <h2 className="text-h3 text-ink">Product status</h2>

                            <dl className="text-small mt-3 space-y-2">
                                {[
                                    ['Active', overview.productCounts.active],
                                    ['Draft', overview.productCounts.draft],
                                    [
                                        'Inactive',
                                        overview.productCounts.inactive,
                                    ],
                                    [
                                        'Pending approval',
                                        overview.productCounts.pending_approval,
                                    ],
                                    [
                                        'Out of stock',
                                        overview.productCounts.out_of_stock,
                                    ],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <dt className="text-ink-muted">
                                            {label}
                                        </dt>
                                        <dd className="text-ink font-medium">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    </aside>
                </div>
            </SellerShell>
        </>
    );
}
