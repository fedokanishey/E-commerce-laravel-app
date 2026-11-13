import { Head, Link } from '@inertiajs/react';
import { buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { AccountShell } from '@/components/organisms/account-shell';
import { ProductGrid } from '@/components/organisms/product-grid';
import { useStorefrontActions } from '@/hooks/use-storefront-actions';
import { productGridData } from '@/lib/storefront';
import type { WishlistItem } from '@/types/ecommerce';

type WishlistIndexProps = {
    items: WishlistItem[];
};

export default function WishlistIndex({ items }: WishlistIndexProps) {
    const { addingIds, wishlistedIds, addToCart, toggleWishlist } =
        useStorefrontActions();
    const products = productGridData(
        items.map((item) => item.product).filter(Boolean),
    );

    return (
        <>
            <Head title="Your wishlist" />

            <AccountShell
                title="Wishlist"
                description="Products you have saved for later. Add them to your cart whenever you are ready."
                eyebrow="Saved for later"
                action={
                    <Link
                        href="/products"
                        className={buttonStyles({
                            variant: 'outline',
                            size: 'sm',
                        })}
                    >
                        <Icon name="search" size="sm" />
                        Find more products
                    </Link>
                }
            >
                {products.length > 0 && (
                    <p className="text-caption text-ink-muted mb-4">
                        {products.length}{' '}
                        {products.length === 1 ? 'product' : 'products'} saved
                    </p>
                )}

                <ProductGrid
                    products={products}
                    onAddToCart={addToCart}
                    onToggleWishlist={toggleWishlist}
                    wishlistedIds={wishlistedIds}
                    addingIds={addingIds}
                    emptyTitle="Your wishlist is empty"
                    emptyDescription="Tap the heart on any product to save it here for later."
                    emptyAction={
                        <Link href="/products" className={buttonStyles()}>
                            Explore products
                        </Link>
                    }
                />
            </AccountShell>
        </>
    );
}
