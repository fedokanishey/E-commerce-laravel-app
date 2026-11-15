import { Head, Link, useForm } from '@inertiajs/react';
import { Alert } from '@/components/molecules/alert';
import { Badge } from '@/components/atoms/badge';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Icon, type IconName } from '@/components/atoms/icon';
import { Select } from '@/components/atoms/select';
import { SellerShell } from '@/components/organisms/seller-shell';
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
import type { OrderStatus, SellerOrder } from '@/types/ecommerce';

type SellerOrderShowProps = {
    sellerOrder: SellerOrder;
    allowedTransitions: Array<{
        value: OrderStatus;
        label: string;
    }>;
    parentAmountDue: string;
    isParentPartiallyCancelled: boolean;
    canConfirmCashCollection: boolean;
};

const progressSteps: Array<{
    status: OrderStatus;
    label: string;
    icon: IconName;
}> = [
    { status: 'pending', label: 'Pending', icon: 'package' },
    { status: 'processing', label: 'Processing', icon: 'settings' },
    { status: 'shipped', label: 'Shipped', icon: 'truck' },
    { status: 'delivered', label: 'Delivered', icon: 'check' },
];

export default function SellerOrderShow({
    sellerOrder,
    allowedTransitions,
    parentAmountDue,
    isParentPartiallyCancelled,
    canConfirmCashCollection,
}: SellerOrderShowProps) {
    const statusForm = useForm({ status: '' });
    const collectionForm = useForm({});
    const order = sellerOrder.order;
    const items = sellerOrder.items ?? [];
    const currentIndex = progressSteps.findIndex(
        (step) => step.status === sellerOrder.status,
    );
    const isCancelled = sellerOrder.status === 'cancelled';

    const updateStatus = () => {
        statusForm.patch(`/seller/orders/${sellerOrder.id}/status`, {
            preserveScroll: true,
            onSuccess: () => statusForm.reset(),
        });
    };

    const confirmCashCollection = () => {
        collectionForm.post(`/seller/orders/${sellerOrder.id}/cod-collection`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Order ${order?.number ?? sellerOrder.id}`} />

            <SellerShell
                title="Order details"
                description={`${order?.number ?? `Seller order #${sellerOrder.id}`} · Placed ${formatDateTime(sellerOrder.created_at)}`}
                eyebrow="Fulfilment"
                action={
                    <Link
                        href="/seller/orders"
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
                {isParentPartiallyCancelled && (
                    <Alert tone="warning" className="mb-5">
                        Some items in this customer order were cancelled. Your
                        seller order is still part of the active order.
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="space-y-6">
                        <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-h3 text-ink">
                                        Fulfilment status
                                    </h2>
                                    <p className="text-caption text-ink-muted mt-1">
                                        Move this order through your fulfilment
                                        workflow.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant={orderStatusTone(
                                            sellerOrder.status,
                                        )}
                                        dot
                                    >
                                        {orderStatusLabel(sellerOrder.status)}
                                    </Badge>
                                    {isParentPartiallyCancelled &&
                                        sellerOrder.status !== 'cancelled' && (
                                            <Badge variant="danger" size="sm">
                                                Parent partially cancelled
                                            </Badge>
                                        )}
                                </div>
                            </div>

                            {isCancelled ? (
                                <div className="border-danger/30 bg-danger-soft rounded-control mt-5 flex items-start gap-3 border p-4">
                                    <Icon
                                        name="alert-circle"
                                        size="md"
                                        className="text-danger mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p className="text-small text-danger font-medium">
                                            This order was cancelled
                                        </p>
                                        <p className="text-caption text-ink-muted mt-1">
                                            No further status changes are
                                            possible.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <ol className="mt-6 flex items-start justify-between gap-2">
                                        {progressSteps.map((step, index) => {
                                            const complete =
                                                index <= currentIndex;
                                            const active =
                                                index === currentIndex;

                                            return (
                                                <li
                                                    key={step.status}
                                                    className="relative flex flex-1 flex-col items-center text-center"
                                                >
                                                    {index > 0 && (
                                                        <span
                                                            aria-hidden="true"
                                                            className={cn(
                                                                'absolute end-1/2 top-4 h-0.5 w-full',
                                                                index <=
                                                                    currentIndex
                                                                    ? 'bg-brand-solid'
                                                                    : 'bg-line',
                                                            )}
                                                        />
                                                    )}

                                                    <span
                                                        className={cn(
                                                            'relative z-10 flex size-8 items-center justify-center rounded-full border-2',
                                                            complete
                                                                ? 'border-brand-solid bg-brand-solid text-on-brand'
                                                                : 'border-line bg-surface text-ink-subtle',
                                                            active &&
                                                                'ring-brand/20 ring-4',
                                                        )}
                                                    >
                                                        <Icon
                                                            name={
                                                                complete
                                                                    ? 'check'
                                                                    : step.icon
                                                            }
                                                            size="sm"
                                                        />
                                                    </span>

                                                    <span
                                                        className={cn(
                                                            'text-caption mt-2',
                                                            complete
                                                                ? 'text-ink font-medium'
                                                                : 'text-ink-subtle',
                                                        )}
                                                    >
                                                        {step.label}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ol>

                                    {allowedTransitions.length > 0 && (
                                        <div className="border-line mt-6 border-t pt-5">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                                <Select
                                                    label="Update status"
                                                    name="status"
                                                    value={
                                                        statusForm.data.status
                                                    }
                                                    onChange={(event) =>
                                                        statusForm.setData(
                                                            'status',
                                                            event.target.value,
                                                        )
                                                    }
                                                    error={
                                                        statusForm.errors.status
                                                    }
                                                    containerClassName="sm:max-w-xs sm:flex-1"
                                                >
                                                    <option value="">
                                                        Choose next status
                                                    </option>
                                                    {allowedTransitions.map(
                                                        (transition) => (
                                                            <option
                                                                key={
                                                                    transition.value
                                                                }
                                                                value={
                                                                    transition.value
                                                                }
                                                            >
                                                                {
                                                                    transition.label
                                                                }
                                                            </option>
                                                        ),
                                                    )}
                                                </Select>

                                                <Button
                                                    onClick={updateStatus}
                                                    loading={
                                                        statusForm.processing
                                                    }
                                                    disabled={
                                                        !statusForm.data.status
                                                    }
                                                >
                                                    Save status
                                                </Button>
                                            </div>

                                            {statusForm.data.status ===
                                                'cancelled' && (
                                                <p className="text-caption text-danger mt-2">
                                                    Cancelling cannot be undone.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </section>

                        <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-h3 text-ink">
                                    Items ({items.length})
                                </h2>
                                <span className="text-caption text-ink-muted">
                                    Your portion of this order
                                </span>
                            </div>

                            <ul className="divide-line mt-4 divide-y">
                                {items.map((item) => {
                                    const image = item.product
                                        ? productImageUrl(item.product)
                                        : null;

                                    return (
                                        <li
                                            key={item.id}
                                            className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
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
                                                            size="lg"
                                                        />
                                                    </span>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                {item.product ? (
                                                    <Link
                                                        href={`/seller/products/${item.product.id}`}
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
                                                    SKU {item.sku} ·{' '}
                                                    {formatCurrency(
                                                        item.unit_price,
                                                    )}{' '}
                                                    × {item.quantity}
                                                </p>
                                            </div>

                                            <p className="text-small text-ink shrink-0 font-semibold">
                                                {formatCurrency(
                                                    item.line_total,
                                                )}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ul>

                            <dl className="border-line mt-4 space-y-2 border-t pt-4">
                                <div className="text-small flex justify-between gap-4">
                                    <dt className="text-ink-muted">Subtotal</dt>
                                    <dd className="text-ink">
                                        {formatCurrency(sellerOrder.subtotal)}
                                    </dd>
                                </div>
                                {Number(sellerOrder.discount_total) > 0 && (
                                    <div className="text-small flex justify-between gap-4">
                                        <dt className="text-ink-muted">
                                            Discount
                                        </dt>
                                        <dd className="text-success">
                                            −
                                            {formatCurrency(
                                                sellerOrder.discount_total,
                                            )}
                                        </dd>
                                    </div>
                                )}
                                <div className="text-small text-ink border-line flex justify-between gap-4 border-t pt-2 font-semibold">
                                    <dt>Your total</dt>
                                    <dd>{formatCurrency(sellerOrder.total)}</dd>
                                </div>
                            </dl>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <section className={cn(cardSurface, 'p-5')}>
                            <h2 className="text-h3 text-ink">Customer</h2>
                            <p className="text-small text-ink mt-3 font-medium">
                                {order?.user?.name ?? 'Customer'}
                            </p>
                            {order?.user?.email && (
                                <p className="text-caption text-ink-muted mt-0.5">
                                    {order.user.email}
                                </p>
                            )}
                            {order && (
                                <p className="text-caption text-ink-subtle mt-3">
                                    Order {order.number} ·{' '}
                                    {formatDateTime(order.placed_at)}
                                </p>
                            )}
                        </section>

                        <section className={cn(cardSurface, 'p-5')}>
                            <h2 className="text-h3 text-ink">Ship to</h2>

                            {order ? (
                                <address className="text-small text-ink-muted mt-3 leading-relaxed not-italic">
                                    <span className="text-ink block font-medium">
                                        {order.shipping_recipient_name}
                                    </span>
                                    {order.shipping_address_line_1}
                                    <br />
                                    {order.shipping_address_line_2 && (
                                        <>
                                            {order.shipping_address_line_2}
                                            <br />
                                        </>
                                    )}
                                    {order.shipping_city},{' '}
                                    {order.shipping_state}{' '}
                                    {order.shipping_postal_code}
                                    <br />
                                    {order.shipping_country}
                                    <br />
                                    {order.shipping_phone}
                                </address>
                            ) : (
                                <p className="text-small text-ink-subtle mt-3">
                                    Shipping details unavailable.
                                </p>
                            )}
                        </section>

                        <section className={cn(cardSurface, 'p-5')}>
                            <h2 className="text-h3 text-ink">Payment</h2>

                            {order?.payment ? (
                                <div className="mt-3 space-y-2">
                                    <div className="text-small flex items-center justify-between gap-3">
                                        <span className="text-ink-muted">
                                            Method
                                        </span>
                                        <span className="text-ink">
                                            {order.payment.method === 'cod'
                                                ? 'Cash on delivery'
                                                : order.payment.method}
                                        </span>
                                    </div>
                                    <div className="text-small flex items-center justify-between gap-3">
                                        <span className="text-ink-muted">
                                            Order payment status
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
                                    <div className="text-small flex items-center justify-between gap-3">
                                        <span className="text-ink-muted">
                                            Order amount due
                                        </span>
                                        <span className="text-ink">
                                            {formatCurrency(parentAmountDue)}
                                        </span>
                                    </div>
                                    <p className="text-caption text-ink-subtle">
                                        Your total after coupon allocation is{' '}
                                        {formatCurrency(sellerOrder.total)}.
                                    </p>

                                    <div className="border-line mt-3 border-t pt-3">
                                        {sellerOrder.cod_collected_at ? (
                                            <p className="text-small text-success-ink">
                                                Cash collected on{' '}
                                                {formatDateTime(
                                                    sellerOrder.cod_collected_at,
                                                )}
                                                .
                                            </p>
                                        ) : canConfirmCashCollection ? (
                                            <Button
                                                size="sm"
                                                loading={
                                                    collectionForm.processing
                                                }
                                                onClick={confirmCashCollection}
                                            >
                                                Confirm cash collection
                                            </Button>
                                        ) : (
                                            <p className="text-caption text-ink-muted">
                                                Cash collection becomes
                                                available after delivery.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-small text-ink-subtle mt-3">
                                    Payment details unavailable.
                                </p>
                            )}
                        </section>
                    </aside>
                </div>
            </SellerShell>
        </>
    );
}
