import { Link } from '@inertiajs/react';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { IconButton } from '@/components/atoms/icon-button';
import { Price } from '@/components/atoms/price';
import { Rating } from '@/components/atoms/rating';
import { StockStatus } from '@/components/atoms/stock-status';
import { calculateDiscountPercent } from '@/lib/format';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { ProductCardData } from '@/types/ui';

type ProductCardProps = {
    product: ProductCardData;
    onAddToCart?: (product: ProductCardData) => void;
    onToggleWishlist?: (product: ProductCardData) => void;
    isWishlisted?: boolean;
    isAddingToCart?: boolean;
    className?: string;
};

export function ProductCard({
    product,
    onAddToCart,
    onToggleWishlist,
    isWishlisted = false,
    isAddingToCart = false,
    className,
}: ProductCardProps) {
    const discount = calculateDiscountPercent(
        product.price,
        product.compareAtPrice,
    );
    const badge = product.badge ?? (discount !== null ? 'Sale' : null);
    const isOutOfStock = product.stockStatus === 'out-of-stock';

    return (
        <article
            className={cn(
                'group rounded-card border-line bg-surface shadow-card hover:shadow-panel flex h-full flex-col overflow-hidden border transition-shadow duration-300',
                className,
            )}
        >
            <div className="bg-surface-muted relative aspect-[4/5] overflow-hidden">
                <Link
                    href={product.href}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute inset-0"
                >
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.imageAlt ?? product.name}
                            loading="lazy"
                            decoding="async"
                            className="motion-safe:ease-smooth size-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]"
                        />
                    ) : (
                        <span className="text-brand/40 flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,var(--ds-brand-soft),var(--ds-surface-muted))]">
                            <Icon name="package" size={44} />
                        </span>
                    )}
                </Link>

                {badge && (
                    <Badge
                        variant={discount !== null ? 'sale' : 'brand'}
                        size="sm"
                        className="absolute start-3 top-3"
                    >
                        {badge}
                    </Badge>
                )}

                {onToggleWishlist && (
                    <IconButton
                        label={
                            isWishlisted
                                ? `Remove ${product.name} from wishlist`
                                : `Add ${product.name} to wishlist`
                        }
                        icon="heart"
                        variant="ghost"
                        aria-pressed={isWishlisted}
                        onClick={() => onToggleWishlist(product)}
                        className={cn(
                            'bg-surface/90 text-ink-muted hover:bg-surface absolute end-3 top-3 backdrop-blur',
                            isWishlisted && 'text-danger hover:text-danger',
                        )}
                    />
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
                {product.sellerName && (
                    <p className="text-caption text-ink-muted">
                        {product.sellerName}
                    </p>
                )}

                <h3 className="text-small text-ink line-clamp-2 leading-5 font-medium">
                    <Link
                        href={product.href}
                        className={cn('hover:text-brand rounded-sm', focusRing)}
                    >
                        {product.name}
                    </Link>
                </h3>

                {product.rating != null && (
                    <Rating
                        value={product.rating}
                        count={product.reviewCount}
                        size="sm"
                    />
                )}

                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                    <Price
                        amount={product.price}
                        compareAtPrice={product.compareAtPrice}
                        currency={product.currency}
                        size="md"
                    />

                    {product.stockStatus && (
                        <StockStatus status={product.stockStatus} />
                    )}
                </div>

                <div className="mt-auto pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        fullWidth
                        loading={isAddingToCart}
                        disabled={isOutOfStock}
                        onClick={() => onAddToCart?.(product)}
                    >
                        {!isAddingToCart && (
                            <Icon name="shopping-bag" size="sm" />
                        )}
                        {isOutOfStock ? 'Out of stock' : 'Add to cart'}
                    </Button>
                </div>
            </div>
        </article>
    );
}
