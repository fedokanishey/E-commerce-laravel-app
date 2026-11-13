import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { SharedData } from '@/types/ecommerce';
import type { ProductCardData } from '@/types/ui';

function productSlug(product: ProductCardData): string | null {
    if (product.slug) {
        return product.slug;
    }

    const segments = product.href.split('/').filter(Boolean);

    return segments.at(-1) ?? null;
}

export function useStorefrontActions() {
    const { auth, wishlistProductIds } = usePage<SharedData>().props;
    const [wishlistedIds, setWishlistedIds] = useState<Set<number>>(
        () => new Set(wishlistProductIds),
    );
    const [addingIds, setAddingIds] = useState<Set<ProductCardData['id']>>(
        () => new Set(),
    );

    useEffect(() => {
        setWishlistedIds(new Set(wishlistProductIds));
    }, [wishlistProductIds]);

    const addToCart = (product: ProductCardData, quantity = 1) => {
        if (!auth.user) {
            router.visit('/login');
            return;
        }

        setAddingIds((current) => new Set(current).add(product.id));

        router.post(
            '/cart',
            { product_id: product.id, quantity },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setAddingIds((current) => {
                        const next = new Set(current);
                        next.delete(product.id);

                        return next;
                    });
                },
            },
        );
    };

    const toggleWishlist = (product: ProductCardData) => {
        if (!auth.user) {
            router.visit('/login');
            return;
        }

        const slug = productSlug(product);

        if (!slug) {
            return;
        }

        const wasWishlisted = wishlistedIds.has(Number(product.id));

        setWishlistedIds((current) => {
            const next = new Set(current);

            if (wasWishlisted) {
                next.delete(Number(product.id));
            } else {
                next.add(Number(product.id));
            }

            return next;
        });

        router.post(
            `/wishlist/${encodeURIComponent(slug)}/toggle`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setWishlistedIds((current) => {
                        const next = new Set(current);

                        if (wasWishlisted) {
                            next.add(Number(product.id));
                        } else {
                            next.delete(Number(product.id));
                        }

                        return next;
                    });
                },
            },
        );
    };

    return {
        addingIds,
        wishlistedIds,
        addToCart,
        toggleWishlist,
    };
}
