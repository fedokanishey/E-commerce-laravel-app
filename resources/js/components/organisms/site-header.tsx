import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Avatar } from '@/components/atoms/avatar';
import { buttonStyles } from '@/components/atoms/button';
import { Icon, type IconName } from '@/components/atoms/icon';
import { IconButton } from '@/components/atoms/icon-button';
import { SearchField } from '@/components/molecules/search-field';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { NavItem, UserSummary } from '@/types/ui';
import { MobileNavigation } from './mobile-navigation';

const defaultNavItems: NavItem[] = [
    { label: 'Shop', href: '/products', active: true },
    { label: 'Categories', href: '/categories' },
    { label: 'New arrivals', href: '/products?sort=newest' },
];

type HeaderIconLinkProps = {
    href: string;
    label: string;
    icon: IconName;
    count?: number;
    className?: string;
};

function HeaderIconLink({
    href,
    label,
    icon,
    count,
    className,
}: HeaderIconLinkProps) {
    const accessibleLabel = count
        ? `${label}, ${count} ${count === 1 ? 'item' : 'items'}`
        : label;

    return (
        <Link
            href={href}
            aria-label={accessibleLabel}
            className={cn(
                'rounded-control text-ink-muted hover:bg-surface-muted hover:text-ink relative inline-flex size-11 items-center justify-center transition-colors',
                focusRing,
                className,
            )}
        >
            <Icon name={icon} size="md" />

            {count != null && count > 0 && (
                <span className="bg-brand-solid text-on-brand absolute -end-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[0.625rem] leading-4 font-semibold">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}

type SiteHeaderProps = {
    brandName?: string;
    navItems?: NavItem[];
    user?: UserSummary | null;
    cartCount?: number;
    wishlistCount?: number;
    onSearch?: (query: string) => void;
    className?: string;
};

export function SiteHeader({
    brandName = 'Marketplace',
    navItems = defaultNavItems,
    user,
    cartCount,
    wishlistCount,
    onSearch,
    className,
}: SiteHeaderProps) {
    const [query, setQuery] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header
            className={cn(
                'border-line bg-canvas/90 sticky top-0 z-40 border-b backdrop-blur',
                className,
            )}
        >
            <div className="ds-container flex h-16 items-center gap-3 lg:h-20">
                <Link
                    href="/"
                    className={cn(
                        'rounded-control inline-flex shrink-0 items-center gap-2',
                        focusRing,
                    )}
                >
                    <span className="rounded-control bg-brand-solid text-on-brand shadow-card flex size-9 items-center justify-center">
                        <Icon name="store" size="md" />
                    </span>
                    <span className="text-h3 text-ink tracking-tight">
                        {brandName}
                    </span>
                </Link>

                <nav
                    aria-label="Primary navigation"
                    className="ms-3 hidden items-center gap-1 lg:flex"
                >
                    {navItems.map((item) => (
                        <Link
                            key={`${item.label}-${item.href}`}
                            href={item.href}
                            aria-current={item.active ? 'page' : undefined}
                            className={cn(
                                'rounded-control text-small px-3 py-2 font-medium transition-colors',
                                focusRing,
                                item.active
                                    ? 'bg-surface-muted text-ink'
                                    : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <SearchField
                    value={query}
                    onChange={setQuery}
                    onSubmit={onSearch}
                    label="Search the marketplace"
                    className="hidden min-w-0 flex-1 md:block md:max-w-md lg:mx-4 lg:max-w-xl"
                />

                <div className="ms-auto flex items-center gap-1">
                    <HeaderIconLink
                        href="/wishlist"
                        label="Wishlist"
                        icon="heart"
                        count={wishlistCount}
                        className="hidden sm:inline-flex"
                    />

                    <HeaderIconLink
                        href="/cart"
                        label="Cart"
                        icon="shopping-bag"
                        count={cartCount}
                    />

                    {user ? (
                        <Link
                            href="/dashboard"
                            className={cn(
                                'rounded-control hover:bg-surface-muted ms-1 inline-flex items-center gap-2 p-1 transition-colors',
                                focusRing,
                            )}
                        >
                            <Avatar
                                name={user.name}
                                src={user.avatar}
                                size="sm"
                            />
                            <span className="text-small text-ink hidden max-w-24 truncate font-medium xl:inline">
                                {user.name}
                            </span>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className={cn(
                                buttonStyles({
                                    variant: 'outline',
                                    size: 'sm',
                                }),
                                'ms-1 hidden sm:inline-flex',
                            )}
                        >
                            Sign in
                        </Link>
                    )}

                    <IconButton
                        label="Open menu"
                        icon="menu"
                        variant="ghost"
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden"
                    />
                </div>
            </div>

            <MobileNavigation
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                navItems={navItems}
                onSearch={onSearch}
                user={user}
                cartCount={cartCount}
                wishlistCount={wishlistCount}
            />
        </header>
    );
}
