import type { ReactNode } from 'react';
import { EmptyState } from '@/components/molecules/empty-state';
import { ProductCard } from '@/components/molecules/product-card';
import { ProductCardList } from '@/components/molecules/product-card-list';
import { ProductCardSkeleton } from '@/components/molecules/product-card-skeleton';
import { cn } from '@/lib/utils';
import type { ProductCardData } from '@/types/ui';

type ProductGridProps = {
    products: ProductCardData[];
    layout?: 'grid' | 'list';
    loading?: boolean;
    skeletonCount?: number;
    onAddToCart?: (product: ProductCardData) => void;
    onToggleWishlist?: (product: ProductCardData) => void;
    wishlistedIds?: ReadonlySet<ProductCardData['id']>;
    addingIds?: ReadonlySet<ProductCardData['id']>;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: ReactNode;
    className?: string;
};

export function ProductGrid({
    products,
    layout = 'grid',
    loading = false,
    skeletonCount = 8,
    onAddToCart,
    onToggleWishlist,
    wishlistedIds,
    addingIds,
    emptyTitle = 'No products found',
    emptyDescription = 'Try adjusting your filters or search for something else.',
    emptyAction,
    className,
}: ProductGridProps) {
    const gridClassName = cn(
        'grid gap-4 sm:gap-5',
        layout === 'grid'
            ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1',
        className,
    );

    if (loading) {
        return (
            <div
                aria-busy="true"
                aria-label="Loading products"
                className={gridClassName}
            >
                {Array.from({ length: skeletonCount }, (_, index) => (
                    <ProductCardSkeleton key={index} layout={layout} />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <EmptyState
                icon="filter"
                title={emptyTitle}
                description={emptyDescription}
                action={emptyAction}
            />
        );
    }

    return (
        <div className={gridClassName}>
            {products.map((product) =>
                layout === 'list' ? (
                    <ProductCardList
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                        onToggleWishlist={onToggleWishlist}
                        isWishlisted={wishlistedIds?.has(product.id)}
                        isAddingToCart={addingIds?.has(product.id)}
                    />
                ) : (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                        onToggleWishlist={onToggleWishlist}
                        isWishlisted={wishlistedIds?.has(product.id)}
                        isAddingToCart={addingIds?.has(product.id)}
                    />
                ),
            )}
        </div>
    );
}
