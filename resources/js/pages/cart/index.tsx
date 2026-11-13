import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/atoms/badge';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Price } from '@/components/atoms/price';
import { EmptyState } from '@/components/molecules/empty-state';
import { Modal } from '@/components/molecules/modal';
import { QuantityStepper } from '@/components/molecules/quantity-stepper';
import { AccountShell } from '@/components/organisms/account-shell';
import { formatCurrency } from '@/lib/format';
import { productImageUrl } from '@/lib/storefront';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/types/ecommerce';

type CartIndexProps = {
    items: CartItem[];
    summary: {
        item_count: number;
        subtotal: number;
    };
};

export default function CartIndex({ items, summary }: CartIndexProps) {
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [clearOpen, setClearOpen] = useState(false);

    const updateQuantity = (item: CartItem, quantity: number) => {
        setPendingId(item.id);

        router.patch(
            `/cart/items/${item.id}`,
            { quantity },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setPendingId(null),
            },
        );
    };

    const removeItem = (item: CartItem) => {
        setPendingId(item.id);

        router.delete(`/cart/items/${item.id}`, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setPendingId(null),
        });
    };

    const clearCart = () => {
        router.delete('/cart', {
            preserveScroll: true,
            onFinish: () => setClearOpen(false),
        });
    };

    return (
        <>
            <Head title="Your cart" />

            <AccountShell
                title="Your cart"
                description="Review the items you are ready to purchase."
                eyebrow="Shopping"
                action={
                    items.length > 0 ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setClearOpen(true)}
                        >
                            <Icon name="trash" size="sm" />
                            Clear cart
                        </Button>
                    ) : undefined
                }
            >
                {items.length > 0 ? (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
                        <div className="space-y-3">
                            {items.map((item) => {
                                const image = productImageUrl(item.product);
                                const isPending = pendingId === item.id;

                                return (
                                    <article
                                        key={item.id}
                                        className={cn(
                                            cardSurface,
                                            'flex flex-col gap-4 p-4 sm:flex-row sm:items-start',
                                            isPending && 'opacity-70',
                                        )}
                                    >
                                        <Link
                                            href={`/products/${item.product.slug}`}
                                            className="bg-surface-muted rounded-control block size-24 shrink-0 overflow-hidden"
                                        >
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={item.product.name}
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
                                        </Link>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/products/${item.product.slug}`}
                                                        className="text-small text-ink hover:text-brand font-semibold transition-colors"
                                                    >
                                                        {item.product.name}
                                                    </Link>

                                                    {item.product.seller && (
                                                        <p className="text-caption text-ink-muted mt-1">
                                                            Sold by{' '}
                                                            {
                                                                item.product
                                                                    .seller
                                                                    .store_name
                                                            }
                                                        </p>
                                                    )}

                                                    <div className="mt-2">
                                                        <Price
                                                            amount={
                                                                item.unit_price
                                                            }
                                                            size="sm"
                                                        />
                                                    </div>
                                                </div>

                                                {!item.is_available && (
                                                    <Badge
                                                        variant="danger"
                                                        size="sm"
                                                    >
                                                        Unavailable
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                                                <QuantityStepper
                                                    value={item.quantity}
                                                    onChange={(quantity) =>
                                                        updateQuantity(
                                                            item,
                                                            quantity,
                                                        )
                                                    }
                                                    max={Math.max(
                                                        1,
                                                        item.product.stock,
                                                    )}
                                                    disabled={
                                                        isPending ||
                                                        !item.is_available
                                                    }
                                                />

                                                <div className="flex items-center gap-4">
                                                    <span className="text-small text-ink font-semibold">
                                                        {formatCurrency(
                                                            item.line_total,
                                                        )}
                                                    </span>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Remove ${item.product.name} from cart`}
                                                        disabled={isPending}
                                                        onClick={() =>
                                                            removeItem(item)
                                                        }
                                                    >
                                                        <Icon
                                                            name="trash"
                                                            size="sm"
                                                        />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <aside className="lg:sticky lg:top-24">
                            <div className={cn(cardSurface, 'p-5')}>
                                <h2 className="text-h3 text-ink">
                                    Order summary
                                </h2>

                                <dl className="text-small mt-4 space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <dt className="text-ink-muted">
                                            Subtotal ({summary.item_count}{' '}
                                            {summary.item_count === 1
                                                ? 'item'
                                                : 'items'}
                                            )
                                        </dt>
                                        <dd className="text-ink font-medium">
                                            {formatCurrency(summary.subtotal)}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <dt className="text-ink-muted">
                                            Shipping
                                        </dt>
                                        <dd className="text-success-ink font-medium">
                                            Free
                                        </dd>
                                    </div>
                                    <div className="border-line flex items-center justify-between gap-4 border-t pt-3">
                                        <dt className="text-body text-ink font-semibold">
                                            Total
                                        </dt>
                                        <dd className="text-body text-ink font-semibold">
                                            {formatCurrency(summary.subtotal)}
                                        </dd>
                                    </div>
                                </dl>

                                <Link
                                    href="/checkout"
                                    className={buttonStyles({
                                        fullWidth: true,
                                        size: 'lg',
                                        className: 'mt-5',
                                    })}
                                >
                                    Proceed to checkout
                                    <Icon name="arrow-right" size="sm" />
                                </Link>

                                <Link
                                    href="/products"
                                    className={buttonStyles({
                                        variant: 'ghost',
                                        fullWidth: true,
                                        size: 'sm',
                                        className: 'mt-2',
                                    })}
                                >
                                    Continue shopping
                                </Link>
                            </div>
                        </aside>
                    </div>
                ) : (
                    <EmptyState
                        title="Your cart is empty"
                        description="Explore the marketplace and add something you love."
                        icon="shopping-bag"
                        action={
                            <Link href="/products" className={buttonStyles()}>
                                Browse products
                            </Link>
                        }
                    />
                )}
            </AccountShell>

            <Modal
                open={clearOpen}
                onClose={() => setClearOpen(false)}
                title="Clear your cart?"
                description="This removes every item from your cart. This action cannot be undone."
                size="sm"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setClearOpen(false)}
                        >
                            Keep items
                        </Button>
                        <Button variant="danger" onClick={clearCart}>
                            Clear cart
                        </Button>
                    </>
                }
            >
                <p className="text-small text-ink-muted">
                    You can add the products again at any time from the
                    marketplace.
                </p>
            </Modal>
        </>
    );
}
