import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/atoms/badge';
import { buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { EmptyState } from '@/components/molecules/empty-state';
import { SectionHeading } from '@/components/molecules/section-heading';
import { StatCard } from '@/components/molecules/stat-card';
import { SellerShell } from '@/components/organisms/seller-shell';
import { formatCurrency } from '@/lib/format';
import { formatDate } from '@/lib/storefront';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { SellerStatistics } from '@/types/ecommerce';

type SellerStatisticsProps = {
    statistics: SellerStatistics;
};

export default function SellerStatistics({
    statistics,
}: SellerStatisticsProps) {
    const { dailySales } = statistics;
    const maxDaily = Math.max(...dailySales.map((day) => Number(day.total)), 1);
    const thirtyDayTotal = dailySales.reduce(
        (total, day) => total + Number(day.total),
        0,
    );

    const statusRows = [
        {
            label: 'Pending',
            value: statistics.orderCounts.pending,
            tone: 'warning' as const,
        },
        {
            label: 'Processing',
            value: statistics.orderCounts.processing,
            tone: 'info' as const,
        },
        {
            label: 'Shipped',
            value: statistics.orderCounts.shipped,
            tone: 'brand' as const,
        },
        {
            label: 'Delivered',
            value: statistics.orderCounts.delivered,
            tone: 'success' as const,
        },
        {
            label: 'Cancelled',
            value: statistics.orderCounts.cancelled,
            tone: 'danger' as const,
        },
    ];

    return (
        <>
            <Head title="Seller statistics" />

            <SellerShell
                title="Statistics"
                description="Sales performance across your store over the last 30 days."
                eyebrow="Performance"
                action={
                    <Link
                        href="/seller/orders"
                        className={buttonStyles({
                            variant: 'outline',
                            size: 'sm',
                        })}
                    >
                        <Icon name="truck" size="sm" />
                        Manage orders
                    </Link>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total revenue"
                        value={formatCurrency(statistics.revenue.total)}
                        helper="All non-cancelled orders"
                        icon="credit-card"
                    />
                    <StatCard
                        label="Last 30 days"
                        value={formatCurrency(thirtyDayTotal)}
                        helper={`${dailySales.length} active sales ${dailySales.length === 1 ? 'day' : 'days'}`}
                        trend={thirtyDayTotal > 0 ? 'up' : 'neutral'}
                        icon="sparkles"
                    />
                    <StatCard
                        label="Orders"
                        value={statistics.orderCounts.total}
                        helper={`${statistics.orderCounts.pending} pending`}
                        icon="package"
                    />
                    <StatCard
                        label="Delivered"
                        value={statistics.orderCounts.delivered}
                        helper="Completed orders"
                        icon="check"
                    />
                </div>

                <section className={cn(cardSurface, 'mt-6 p-5 sm:p-6')}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-h3 text-ink">Daily sales</h2>
                            <p className="text-caption text-ink-muted mt-1">
                                Revenue by day for the last 30 days.
                            </p>
                        </div>

                        <Badge variant="brand" size="sm">
                            {formatCurrency(thirtyDayTotal)}
                        </Badge>
                    </div>

                    {dailySales.length > 0 ? (
                        <figure className="mt-6">
                            <div
                                role="img"
                                aria-label={`Daily sales chart. ${dailySales.length} sales days, ${formatCurrency(thirtyDayTotal)} total.`}
                                style={{
                                    gridTemplateColumns: `repeat(${dailySales.length}, minmax(0, 1fr))`,
                                }}
                                className="border-line grid h-52 items-end gap-1 border-b pb-0"
                            >
                                {dailySales.map((day) => {
                                    const total = Number(day.total);
                                    const height = Math.max(
                                        2,
                                        (total / maxDaily) * 100,
                                    );

                                    return (
                                        <div
                                            key={day.sale_date}
                                            title={`${formatDate(day.sale_date)}: ${formatCurrency(total)} (${day.order_count} orders)`}
                                            className="group flex h-full items-end justify-center"
                                        >
                                            <span
                                                aria-hidden="true"
                                                style={{ height: `${height}%` }}
                                                className="bg-brand-solid/80 group-hover:bg-brand-solid w-full max-w-16 rounded-t-sm transition-colors"
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="text-caption text-ink-subtle mt-2 flex justify-between gap-4">
                                <span>
                                    {formatDate(dailySales[0].sale_date)}
                                </span>
                                {dailySales.length > 1 && (
                                    <span>
                                        {formatDate(
                                            dailySales[dailySales.length - 1]
                                                .sale_date,
                                        )}
                                    </span>
                                )}
                            </div>

                            <figcaption className="sr-only">
                                Hover or focus each bar to see the daily
                                revenue. The highest day is{' '}
                                {formatCurrency(maxDaily)}.
                            </figcaption>
                        </figure>
                    ) : (
                        <EmptyState
                            title="No sales in this period"
                            description="Daily sales appear here once orders start coming in."
                            icon="sparkles"
                            className="mt-5"
                        />
                    )}
                </section>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                        <SectionHeading
                            title="Order status"
                            description="Where your current seller orders sit."
                        />

                        <div className="mt-4 space-y-3">
                            {statusRows.map((row) => {
                                const percentage =
                                    statistics.orderCounts.total > 0
                                        ? Math.round(
                                              (row.value /
                                                  statistics.orderCounts
                                                      .total) *
                                                  100,
                                          )
                                        : 0;

                                return (
                                    <div key={row.label}>
                                        <div className="mb-1 flex items-center justify-between gap-3">
                                            <Badge variant={row.tone} size="sm">
                                                {row.label}
                                            </Badge>
                                            <span className="text-caption text-ink-muted">
                                                {row.value} · {percentage}%
                                            </span>
                                        </div>
                                        <div className="bg-surface-muted h-2 overflow-hidden rounded-full">
                                            <div
                                                className="bg-brand-solid h-full rounded-full"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                        <SectionHeading
                            title="Best selling products"
                            description="Ranked by units sold."
                        />

                        {statistics.bestSellingProducts.length > 0 ? (
                            <ol className="mt-4 space-y-4">
                                {statistics.bestSellingProducts.map(
                                    (product, index) => (
                                        <li
                                            key={`${product.product_id ?? product.product_name}-${index}`}
                                            className="flex items-start gap-3"
                                        >
                                            <span className="bg-surface-muted text-ink-muted flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-small text-ink font-medium">
                                                    {product.product_name}
                                                </p>
                                                <p className="text-caption text-ink-muted mt-0.5">
                                                    {Number(
                                                        product.sold_quantity,
                                                    )}{' '}
                                                    sold ·{' '}
                                                    {formatCurrency(
                                                        product.sales_total,
                                                    )}{' '}
                                                    revenue
                                                </p>
                                            </div>
                                        </li>
                                    ),
                                )}
                            </ol>
                        ) : (
                            <p className="text-small text-ink-muted mt-4">
                                No product sales yet. Once orders arrive, your
                                top products will be ranked here.
                            </p>
                        )}
                    </section>
                </div>
            </SellerShell>
        </>
    );
}
