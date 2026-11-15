import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Alert } from '@/components/molecules/alert';
import { Badge } from '@/components/atoms/badge';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Price } from '@/components/atoms/price';
import { Modal } from '@/components/molecules/modal';
import { AccountShell } from '@/components/organisms/account-shell';
import {
    formatDateTime,
    orderStatusLabel,
    orderStatusTone,
    paymentStatusLabel,
    paymentStatusTone,
} from '@/lib/account';
import { formatCurrency } from '@/lib/format';
import { productImageUrl } from '@/lib/storefront';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus, SellerOrder } from '@/types/ecommerce';

type OrderShowProps = {
    order: Order;
    canCancel: boolean;
    amountDue: string;
    isPartiallyCancelled: boolean;
};

const progressSteps: Array<{ status: OrderStatus; label: string }> = [
    { status: 'pending', label: 'Placed' },
    { status: 'processing', label: 'Processing' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'delivered', label: 'Delivered' },
];

type SellerGroup = {
    sellerOrder: SellerOrder | null;
    items: NonNullable<Order['items']>;
};

function sellerGroups(order: Order): SellerGroup[] {
    const items = order.items ?? [];

    if (!order.seller_orders || order.seller_orders.length === 0) {
        return [{ sellerOrder: null, items }];
    }

    return order.seller_orders.map((sellerOrder) => ({
        sellerOrder,
        items: items.filter((item) => item.seller_order_id === sellerOrder.id),
    }));
}

export default function OrderShow({
    order,
    canCancel,
    amountDue,
    isPartiallyCancelled,
}: OrderShowProps) {
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const groups = sellerGroups(order);
    const currentStep = progressSteps.findIndex(
        (step) => step.status === order.status,
    );
    const partiallyCancelled =
        isPartiallyCancelled || Boolean(order.is_partially_cancelled);
    const currentAmountDue = order.amount_due ?? amountDue;
    const amountChanged = currentAmountDue !== order.grand_total;

    const cancelOrder = () => {
        setCancelling(true);

        router.post(
            `/orders/${order.id}/cancel`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setCancelOpen(false),
                onFinish: () => setCancelling(false),
            },
        );
    };

    return (
        <>
            <Head title={`Order ${order.number}`} />

            <AccountShell
                title="Order details"
                description={`${order.number} · Placed ${formatDateTime(order.placed_at)}`}
                eyebrow="Order"
                action={
                    <Link
                        href="/orders"
                        className={buttonStyles({
                            variant: 'outline',
                            size: 'sm',
                        })}
                    >
                        <Icon name="chevron-left" size="sm" />
                        All orders
                    </Link>
                }
            >
                {order.status === 'cancelled' && (
                    <Alert tone="danger" className="mb-5">
                        This order was cancelled
                        {order.cancelled_at
                            ? ` on ${formatDateTime(order.cancelled_at)}`
                            : ''}
                        . No further action is required.
                    </Alert>
                )}

                {partiallyCancelled && order.status !== 'cancelled' && (
                    <Alert tone="warning" className="mb-5">
                        Some items in this order were cancelled. The remaining
                        items are still being fulfilled.
                    </Alert>
                )}

                <div className={cn(cardSurface, 'p-5 sm:p-6')}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-h3 text-ink">
                                    {order.number}
                                </h2>
                                <Badge
                                    variant={orderStatusTone(order.status)}
                                    dot
                                >
                                    {orderStatusLabel(order.status)}
                                </Badge>
                                {partiallyCancelled &&
                                    order.status !== 'cancelled' && (
                                        <Badge variant="danger" size="sm">
                                            Partially cancelled
                                        </Badge>
                                    )}
                            </div>
                            <p className="text-small text-ink-muted mt-1">
                                {order.items?.length ?? 0}{' '}
                                {(order.items?.length ?? 0) === 1
                                    ? 'line item'
                                    : 'line items'}{' '}
                                A� {formatCurrency(currentAmountDue)}
                            </p>
                        </div>

                        {canCancel && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCancelOpen(true)}
                            >
                                {partiallyCancelled
                                    ? 'Cancel remaining items'
                                    : 'Cancel order'}
                            </Button>
                        )}
                    </div>

                    {order.status !== 'cancelled' && (
                        <ol className="mt-6 grid grid-cols-4 gap-2">
                            {progressSteps.map((step, index) => {
                                const complete = index <= currentStep;
                                const active = index === currentStep;

                                return (
                                    <li key={step.status}>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                                                    complete
                                                        ? 'border-brand-solid bg-brand-solid text-on-brand'
                                                        : 'border-line bg-surface text-ink-subtle',
                                                )}
                                            >
                                                {complete ? (
                                                    <Icon
                                                        name="check"
                                                        size="sm"
                                                    />
                                                ) : (
                                                    index + 1
                                                )}
                                            </span>

                                            {index <
                                                progressSteps.length - 1 && (
                                                <span
                                                    aria-hidden="true"
                                                    className={cn(
                                                        'h-px flex-1',
                                                        index < currentStep
                                                            ? 'bg-brand-solid'
                                                            : 'bg-line',
                                                    )}
                                                />
                                            )}
                                        </div>

                                        <p
                                            className={cn(
                                                'text-caption mt-2 font-medium',
                                                active
                                                    ? 'text-brand-ink'
                                                    : 'text-ink-muted',
                                            )}
                                        >
                                            {step.label}
                                        </p>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
                    <div className="space-y-4">
                        {groups.map((group, index) => (
                            <section
                                key={group.sellerOrder?.id ?? index}
                                className={cn(
                                    cardSurface,
                                    'overflow-hidden',
                                    group.sellerOrder?.status === 'cancelled' &&
                                        'border-danger/30',
                                )}
                            >
                                <div className="border-line flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
                                    <div>
                                        <p className="text-small text-ink font-semibold">
                                            {group.sellerOrder?.seller
                                                ?.store_name ??
                                                'Sold by marketplace partner'}
                                        </p>
                                        <p className="text-caption text-ink-muted mt-0.5">
                                            {group.items.length}{' '}
                                            {group.items.length === 1
                                                ? 'item'
                                                : 'items'}
                                        </p>
                                    </div>

                                    {group.sellerOrder && (
                                        <Badge
                                            variant={orderStatusTone(
                                                group.sellerOrder.status,
                                            )}
                                            size="sm"
                                        >
                                            {orderStatusLabel(
                                                group.sellerOrder.status,
                                            )}
                                        </Badge>
                                    )}
                                </div>

                                <ul className="divide-line divide-y">
                                    {group.items.map((item) => {
                                        const image = item.product
                                            ? productImageUrl(item.product)
                                            : null;

                                        return (
                                            <li
                                                key={item.id}
                                                className="flex items-center gap-4 px-5 py-4"
                                            >
                                                <div className="bg-surface-muted rounded-control size-16 shrink-0 overflow-hidden">
                                                    {image ? (
                                                        <img
                                                            src={image}
                                                            alt=""
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-brand/30 flex size-full items-center justify-center">
                                                            <Icon
                                                                name="package"
                                                                size="md"
                                                            />
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    {item.product ? (
                                                        <Link
                                                            href={`/products/${item.product.slug}`}
                                                            className="text-small text-ink hover:text-brand font-medium transition-colors"
                                                        >
                                                            {item.product_name}
                                                        </Link>
                                                    ) : (
                                                        <p className="text-small text-ink font-medium">
                                                            {item.product_name}
                                                        </p>
                                                    )}
                                                    <p className="text-caption text-ink-muted mt-0.5">
                                                        SKU {item.sku} · Qty{' '}
                                                        {item.quantity}
                                                    </p>
                                                    <div className="mt-1">
                                                        <Price
                                                            amount={
                                                                item.unit_price
                                                            }
                                                            size="sm"
                                                        />
                                                    </div>
                                                </div>

                                                <span className="text-small text-ink shrink-0 font-semibold">
                                                    {formatCurrency(
                                                        item.line_total,
                                                    )}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        ))}
                    </div>

                    <aside className="space-y-4">
                        <section className={cn(cardSurface, 'p-5')}>
                            <h2 className="text-h3 text-ink">Order summary</h2>

                            <dl className="text-small mt-4 space-y-2.5">
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-ink-muted">Subtotal</dt>
                                    <dd className="text-ink">
                                        {formatCurrency(order.subtotal)}
                                    </dd>
                                </div>

                                {Number(order.discount_total) > 0 && (
                                    <div className="flex items-center justify-between gap-4">
                                        <dt className="text-ink-muted">
                                            Discount
                                            {order.coupon
                                                ? ` (${order.coupon.code})`
                                                : ''}
                                        </dt>
                                        <dd className="text-success-ink">
                                            −
                                            {formatCurrency(
                                                order.discount_total,
                                            )}
                                        </dd>
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-ink-muted">Shipping</dt>
                                    <dd className="text-ink">
                                        {Number(order.shipping_total) > 0
                                            ? formatCurrency(
                                                  order.shipping_total,
                                              )
                                            : 'Free'}
                                    </dd>
                                </div>

                                <div className="border-line text-body flex items-center justify-between gap-4 border-t pt-3 font-semibold">
                                    <dt className="text-ink">
                                        {amountChanged
                                            ? 'Original total'
                                            : 'Total'}
                                    </dt>
                                    <dd className="text-ink">
                                        {formatCurrency(order.grand_total)}
                                    </dd>
                                </div>

                                {amountChanged && (
                                    <div className="text-body flex items-center justify-between gap-4 font-semibold">
                                        <dt className="text-ink">Amount due</dt>
                                        <dd className="text-ink">
                                            {formatCurrency(currentAmountDue)}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </section>

                        <section className={cn(cardSurface, 'p-5')}>
                            <h2 className="text-h3 text-ink">
                                Delivery address
                            </h2>

                            <p className="text-small text-ink mt-3 font-medium">
                                {order.shipping_recipient_name}
                            </p>
                            <p className="text-small text-ink-muted mt-1">
                                {[
                                    order.shipping_address_line_1,
                                    order.shipping_address_line_2,
                                    `${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}`,
                                    order.shipping_country,
                                ]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                            <p className="text-small text-ink-muted mt-1">
                                {order.shipping_phone}
                            </p>
                        </section>

                        <section className={cn(cardSurface, 'p-5')}>
                            <h2 className="text-h3 text-ink">Payment</h2>

                            {order.payment ? (
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-small text-ink-muted">
                                            Method
                                        </span>
                                        <span className="text-small text-ink font-medium">
                                            {order.payment.method === 'cod'
                                                ? 'Cash on delivery'
                                                : order.payment.method}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-small text-ink-muted">
                                            Status
                                        </span>
                                        <Badge
                                            variant={paymentStatusTone(
                                                order.payment.status,
                                            )}
                                            size="sm"
                                        >
                                            {paymentStatusLabel(
                                                order.payment.status,
                                            )}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-small text-ink-muted">
                                            Amount
                                        </span>
                                        <span className="text-small text-ink font-medium">
                                            {formatCurrency(
                                                order.payment.amount,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-small text-ink-muted mt-2">
                                    Payment details are not available.
                                </p>
                            )}
                        </section>
                    </aside>
                </div>

                <div className="mt-6">
                    <Link
                        href="/orders"
                        className={buttonStyles({ variant: 'ghost' })}
                    >
                        <Icon name="chevron-left" size="sm" />
                        Back to orders
                    </Link>
                </div>
            </AccountShell>

            <Modal
                open={cancelOpen}
                onClose={() => setCancelOpen(false)}
                title={
                    partiallyCancelled
                        ? 'Cancel the remaining items?'
                        : 'Cancel this order?'
                }
                description="The items will be returned to stock and this cannot be undone."
                size="sm"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setCancelOpen(false)}
                        >
                            Keep order
                        </Button>
                        <Button
                            variant="danger"
                            loading={cancelling}
                            onClick={cancelOrder}
                        >
                            {partiallyCancelled
                                ? 'Cancel remaining items'
                                : 'Cancel order'}
                        </Button>
                    </>
                }
            >
                <p className="text-small text-ink-muted">
                    You can always place a new order for the same products.
                </p>
            </Modal>
        </>
    );
}
