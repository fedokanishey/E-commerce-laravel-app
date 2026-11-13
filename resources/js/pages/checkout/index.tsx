import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Alert } from '@/components/molecules/alert';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Input } from '@/components/atoms/input';
import { Price } from '@/components/atoms/price';
import { Radio } from '@/components/atoms/radio';
import { AccountShell } from '@/components/organisms/account-shell';
import { formatAddress } from '@/lib/account';
import { formatCurrency } from '@/lib/format';
import { productImageUrl } from '@/lib/storefront';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { Address, PaymentMethod, Product } from '@/types/ecommerce';

type CheckoutItem = {
    id: number;
    quantity: number;
    product: Product;
};

type CheckoutProps = {
    items: CheckoutItem[];
    addresses: Address[];
    summary: {
        subtotal: number;
        shipping: number;
        total: number;
    };
    paymentMethods: Array<{
        value: PaymentMethod;
        label: string;
    }>;
};

export default function Checkout({
    items,
    addresses,
    summary,
    paymentMethods,
}: CheckoutProps) {
    const cartError = usePage<{ errors: { cart?: string } }>().props.errors
        .cart;
    const defaultAddress =
        addresses.find((address) => address.is_default) ?? addresses[0];

    const form = useForm({
        address_id: defaultAddress ? String(defaultAddress.id) : '',
        coupon_code: '',
        payment_method: paymentMethods[0]?.value ?? 'cod',
    });

    const submit = () => {
        form.post('/checkout');
    };

    return (
        <>
            <Head title="Checkout" />

            <AccountShell
                title="Checkout"
                description="Confirm your delivery details and place your order."
                eyebrow="Secure checkout"
            >
                {cartError && (
                    <Alert tone="danger" className="mb-5">
                        {cartError}
                    </Alert>
                )}

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit();
                    }}
                    className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
                >
                    <div className="space-y-5">
                        <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-h3 text-ink">
                                        Delivery address
                                    </h2>
                                    <p className="text-caption text-ink-muted mt-1">
                                        Where should we send this order?
                                    </p>
                                </div>

                                <Link
                                    href="/addresses/create"
                                    className={buttonStyles({
                                        variant: 'outline',
                                        size: 'sm',
                                    })}
                                >
                                    <Icon name="plus" size="sm" />
                                    Add address
                                </Link>
                            </div>

                            {addresses.length > 0 ? (
                                <div
                                    className="mt-5 space-y-3"
                                    role="radiogroup"
                                    aria-label="Delivery address"
                                >
                                    {addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            className={cn(
                                                'rounded-control border-line bg-surface hover:border-brand/40 border p-4 transition-colors',
                                                form.data.address_id ===
                                                    String(address.id) &&
                                                    'border-brand/50 bg-brand-soft/40',
                                            )}
                                        >
                                            <Radio
                                                name="address_id"
                                                value={address.id}
                                                checked={
                                                    form.data.address_id ===
                                                    String(address.id)
                                                }
                                                onChange={() =>
                                                    form.setData(
                                                        'address_id',
                                                        String(address.id),
                                                    )
                                                }
                                                label={
                                                    <span className="flex flex-wrap items-center gap-2">
                                                        <span className="text-small text-ink font-semibold">
                                                            {
                                                                address.recipient_name
                                                            }
                                                        </span>
                                                        <span className="text-caption text-ink-subtle font-normal">
                                                            {address.label}
                                                        </span>
                                                        {address.is_default && (
                                                            <span className="text-caption text-brand-ink bg-brand-soft rounded-full px-2 py-0.5 font-medium">
                                                                Default
                                                            </span>
                                                        )}
                                                    </span>
                                                }
                                                description={
                                                    <span className="block">
                                                        <span className="text-small text-ink-muted mt-1 block">
                                                            {formatAddress(
                                                                address,
                                                            ).join(', ')}
                                                        </span>
                                                        <span className="text-caption text-ink-subtle mt-0.5 block">
                                                            {address.phone}
                                                        </span>
                                                    </span>
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Alert tone="warning" className="mt-5">
                                    Add a delivery address before placing your
                                    order.
                                </Alert>
                            )}

                            {form.errors.address_id && (
                                <p className="text-caption text-danger mt-2">
                                    {form.errors.address_id}
                                </p>
                            )}
                        </section>

                        <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                            <h2 className="text-h3 text-ink">Payment method</h2>
                            <p className="text-caption text-ink-muted mt-1">
                                Pay when your order is delivered.
                            </p>

                            <div className="mt-4 space-y-3">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.value}
                                        className={cn(
                                            'rounded-control border-line bg-surface hover:border-brand/40 border p-4 transition-colors',
                                            form.data.payment_method ===
                                                method.value &&
                                                'border-brand/50 bg-brand-soft/40',
                                        )}
                                    >
                                        <Radio
                                            name="payment_method"
                                            value={method.value}
                                            checked={
                                                form.data.payment_method ===
                                                method.value
                                            }
                                            onChange={() =>
                                                form.setData(
                                                    'payment_method',
                                                    method.value,
                                                )
                                            }
                                            label={method.label}
                                            description="Pay in cash when your package arrives."
                                            className="mt-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                            <h2 className="text-h3 text-ink">Review items</h2>

                            <ul className="divide-line mt-4 divide-y">
                                {items.map((item) => {
                                    const image = productImageUrl(item.product);

                                    return (
                                        <li
                                            key={item.id}
                                            className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="bg-surface-muted rounded-control size-14 shrink-0 overflow-hidden">
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
                                                <p className="text-small text-ink truncate font-medium">
                                                    {item.product.name}
                                                </p>
                                                <p className="text-caption text-ink-muted">
                                                    Qty {item.quantity}
                                                </p>
                                            </div>

                                            <Price
                                                amount={
                                                    Number(item.product.price) *
                                                    item.quantity
                                                }
                                                size="sm"
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    </div>

                    <aside className="lg:sticky lg:top-24">
                        <div className={cn(cardSurface, 'p-5')}>
                            <h2 className="text-h3 text-ink">Order summary</h2>

                            <div className="mt-4">
                                <Input
                                    label="Coupon code"
                                    placeholder="Enter a code"
                                    value={form.data.coupon_code}
                                    onChange={(event) =>
                                        form.setData(
                                            'coupon_code',
                                            event.target.value,
                                        )
                                    }
                                    error={form.errors.coupon_code}
                                    autoComplete="off"
                                />
                                <p className="text-caption text-ink-subtle mt-1.5">
                                    Any valid discount is applied when the order
                                    is placed.
                                </p>
                            </div>

                            <dl className="text-small mt-4 space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-ink-muted">Subtotal</dt>
                                    <dd className="text-ink font-medium">
                                        {formatCurrency(summary.subtotal)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-ink-muted">Shipping</dt>
                                    <dd className="text-success-ink font-medium">
                                        {summary.shipping > 0
                                            ? formatCurrency(summary.shipping)
                                            : 'Free'}
                                    </dd>
                                </div>
                                <div className="border-line flex items-center justify-between gap-4 border-t pt-3">
                                    <dt className="text-body text-ink font-semibold">
                                        Total
                                    </dt>
                                    <dd className="text-body text-ink font-semibold">
                                        {formatCurrency(summary.total)}
                                    </dd>
                                </div>
                            </dl>

                            <Button
                                type="submit"
                                size="lg"
                                fullWidth
                                className="mt-5"
                                loading={form.processing}
                                disabled={addresses.length === 0}
                            >
                                Place order
                                <Icon name="arrow-right" size="sm" />
                            </Button>

                            <Link
                                href="/cart"
                                className={buttonStyles({
                                    variant: 'ghost',
                                    fullWidth: true,
                                    size: 'sm',
                                    className: 'mt-2',
                                })}
                            >
                                Back to cart
                            </Link>
                        </div>
                    </aside>
                </form>
            </AccountShell>
        </>
    );
}
