import { router, usePage } from '@inertiajs/react';
import { useEffect, useState, type ReactNode } from 'react';
import { Alert } from '@/components/molecules/alert';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';
import { flashMessage } from '@/lib/storefront';
import type { SharedData } from '@/types/ecommerce';
import type { NavItem } from '@/types/ui';

type PublicShellProps = {
    children: ReactNode;
};

export function PublicShell({ children }: PublicShellProps) {
    const page = usePage<SharedData>();
    const { auth, cartItemCount, flash, name, wishlistItemCount } = page.props;
    const [dismissedFlash, setDismissedFlash] = useState<string | null>(null);

    const path = page.url.split('?')[0];
    const query = page.url.includes('?')
        ? new URLSearchParams(page.url.split('?')[1])
        : null;
    const isNewArrivals =
        path === '/products' && query?.get('sort') === 'newest';

    const navItems: NavItem[] = [
        {
            label: 'Shop',
            href: '/products',
            active: path.startsWith('/products') && !isNewArrivals,
        },
        {
            label: 'Categories',
            href: '/categories',
            active: path.startsWith('/categories'),
        },
        {
            label: 'New arrivals',
            href: '/products?sort=newest',
            active: isNewArrivals,
        },
    ];

    const statusMessage = flashMessage(flash.status);
    const errorMessage = flash.error;
    const flashKey = `${flash.status ?? ''}:${errorMessage ?? ''}`;

    useEffect(() => {
        setDismissedFlash(null);
    }, [flashKey]);

    const handleSearch = (value: string) => {
        const term = value.trim();

        router.get('/products', term ? { q: term } : {}, {
            preserveScroll: false,
        });
    };

    return (
        <div className="bg-canvas text-ink flex min-h-screen flex-col">
            <a
                href="#main-content"
                className="bg-surface text-ink focus:ring-brand rounded-control sr-only fixed start-4 top-4 z-50 px-4 py-2 text-sm font-medium shadow-lg focus:not-sr-only focus:ring-2"
            >
                Skip to content
            </a>

            <SiteHeader
                brandName={name}
                navItems={navItems}
                user={auth.user ? { name: auth.user.name } : null}
                cartCount={cartItemCount}
                wishlistCount={wishlistItemCount}
                onSearch={handleSearch}
            />

            <main id="main-content" className="flex-1">
                {(statusMessage || errorMessage) &&
                    dismissedFlash !== flashKey && (
                        <div className="ds-container pt-4">
                            {errorMessage ? (
                                <Alert
                                    tone="danger"
                                    title="Something went wrong"
                                    onDismiss={() =>
                                        setDismissedFlash(flashKey)
                                    }
                                >
                                    {errorMessage}
                                </Alert>
                            ) : (
                                <Alert
                                    tone="success"
                                    onDismiss={() =>
                                        setDismissedFlash(flashKey)
                                    }
                                >
                                    {statusMessage}
                                </Alert>
                            )}
                        </div>
                    )}

                {children}
            </main>

            <SiteFooter brandName={name} />
        </div>
    );
}
