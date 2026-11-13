import { toNumber } from '@/lib/format';
import type { Product, ProductFilters } from '@/types/ecommerce';
import type { ProductCardData, StockStatusValue } from '@/types/ui';

export function storageUrl(path: string | null | undefined): string | null {
    if (!path) {
        return null;
    }

    if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) {
        return path;
    }

    return `/storage/${path}`;
}

export function primaryImage(product: Product) {
    return (
        product.images?.find((image) => image.is_primary) ??
        product.images?.[0] ??
        null
    );
}

export function productImageUrl(product: Product): string | null {
    return storageUrl(primaryImage(product)?.path);
}

export function productStockStatus(product: Product): StockStatusValue {
    if (product.stock <= 0) {
        return 'out-of-stock';
    }

    if (product.stock <= 5) {
        return 'low-stock';
    }

    return 'in-stock';
}

export function mapProductCard(product: Product): ProductCardData {
    const image = primaryImage(product);
    const rating =
        product.reviews_count && product.reviews_avg_rating != null
            ? toNumber(product.reviews_avg_rating)
            : undefined;

    return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        href: `/products/${product.slug}`,
        price: product.price,
        compareAtPrice: product.compare_at_price,
        currency: 'USD',
        imageUrl: storageUrl(image?.path),
        imageAlt: image?.alt_text ?? product.name,
        rating,
        reviewCount: product.reviews_count,
        stockStatus: productStockStatus(product),
        sellerName: product.seller?.store_name,
    };
}

export function productGridData(products: Product[] = []): ProductCardData[] {
    return products.map(mapProductCard);
}

export function filterQuery(filters: ProductFilters): Record<string, string> {
    const query: Record<string, string> = {};

    if (filters.q) {
        query.q = filters.q;
    }

    if (filters.category) {
        query.category = filters.category;
    }

    if (
        filters.min_price !== null &&
        filters.min_price !== undefined &&
        filters.min_price !== ''
    ) {
        query.min_price = String(filters.min_price);
    }

    if (
        filters.max_price !== null &&
        filters.max_price !== undefined &&
        filters.max_price !== ''
    ) {
        query.max_price = String(filters.max_price);
    }

    if (filters.sort) {
        query.sort = filters.sort;
    }

    if (filters.per_page) {
        query.per_page = String(filters.per_page);
    }

    return query;
}

const flashMessages: Record<string, string> = {
    'product-added-to-cart': 'Added to your cart.',
    'cart-updated': 'Your cart has been updated.',
    'cart-item-removed': 'Item removed from your cart.',
    'cart-cleared': 'Your cart is now empty.',
    'wishlist-item-added': 'Saved to your wishlist.',
    'wishlist-item-removed': 'Removed from your wishlist.',
    'product-moved-to-cart': 'Moved to your cart.',
    'review-created': 'Thanks for sharing your review.',
    'review-updated': 'Your review has been updated.',
    'review-deleted': 'Your review has been removed.',
    'order-placed': 'Your order has been placed.',
    'order-cancelled': 'Your order has been cancelled.',
    'address-created': 'Address added.',
    'address-updated': 'Address updated.',
    'address-deleted': 'Address removed.',
    'profile-updated': 'Your profile has been updated.',
    'password-updated': 'Your password has been updated.',
    'notification-read': 'Notification marked as read.',
    'notifications-read': 'All notifications marked as read.',
    'notification-deleted': 'Notification removed.',
    'seller-profile-created': 'Your seller profile is ready.',
    'seller-profile-updated': 'Store profile updated.',
    'product-created': 'Product created.',
    'product-updated': 'Product updated.',
    'product-deleted': 'Product deleted.',
    'product-image-added': 'Image added.',
    'product-image-removed': 'Image removed.',
    'seller-order-status-updated': 'Order status updated.',
};

export function flashMessage(status: string | null | undefined): string | null {
    if (!status) {
        return null;
    }

    return flashMessages[status] ?? status.replaceAll('-', ' ');
}

export function formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}
