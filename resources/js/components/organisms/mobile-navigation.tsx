import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Avatar } from '@/components/atoms/avatar';
import { buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Separator } from '@/components/atoms/separator';
import { Drawer } from '@/components/molecules/drawer';
import { SearchField } from '@/components/molecules/search-field';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { NavItem, UserSummary } from '@/types/ui';

type MobileNavigationProps = {
    open: boolean;
    onClose: () => void;
    navItems: NavItem[];
    onSearch?: (query: string) => void;
    user?: UserSummary | null;
    cartCount?: number;
    wishlistCount?: number;
};

export function MobileNavigation({
    open,
    onClose,
    navItems,
    onSearch,
    user,
    cartCount,
    wishlistCount,
}: MobileNavigationProps) {
    const [query, setQuery] = useState('');

    const handleSearch = (value: string) => {
        onClose();
        onSearch?.(value);
    };

    return (
        <Drawer open={open} onClose={onClose} title="Menu">
            <div className="space-y-6">
                <SearchField
                    value={query}
                    onChange={setQuery}
                    onSubmit={handleSearch}
                />

                <nav aria-label="Mobile navigation">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={`${item.label}-${item.href}`}>
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    aria-current={
                                        item.active ? 'page' : undefined
                                    }
                                    className={cn(
                                        'rounded-control text-small flex items-center justify-between px-3 py-2.5 font-medium transition-colors',
                                        focusRing,
                                        item.active
                                            ? 'bg-brand-soft text-brand-ink'
                                            : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                                    )}
                                >
                                    {item.label}
                                    {item.badge != null && (
                                        <span className="bg-surface text-caption text-ink-muted rounded-full px-2 py-0.5">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <Separator />

                <div className="space-y-1">
                    <Link
                        href="/wishlist"
                        onClick={onClose}
                        className={cn(
                            'rounded-control text-small text-ink-muted hover:bg-surface-muted hover:text-ink flex items-center gap-3 px-3 py-2.5 font-medium transition-colors',
                            focusRing,
                        )}
                    >
                        <Icon name="heart" size="md" />
                        <span className="flex-1">Wishlist</span>
                        {wishlistCount != null && (
                            <span className="text-caption text-ink-subtle">
                                {wishlistCount}
                            </span>
                        )}
                    </Link>

                    <Link
                        href="/cart"
                        onClick={onClose}
                        className={cn(
                            'rounded-control text-small text-ink-muted hover:bg-surface-muted hover:text-ink flex items-center gap-3 px-3 py-2.5 font-medium transition-colors',
                            focusRing,
                        )}
                    >
                        <Icon name="shopping-bag" size="md" />
                        <span className="flex-1">Cart</span>
                        {cartCount != null && (
                            <span className="text-caption text-ink-subtle">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            <div className="mt-6">
                {user ? (
                    <Link
                        href="/dashboard"
                        onClick={onClose}
                        className={cn(
                            'rounded-control border-line bg-surface hover:bg-surface-muted flex items-center gap-3 border px-3 py-2.5 transition-colors',
                            focusRing,
                        )}
                    >
                        <Avatar name={user.name} src={user.avatar} size="sm" />
                        <span className="min-w-0 flex-1">
                            <span className="text-small text-ink block truncate font-medium">
                                {user.name}
                            </span>
                            <span className="text-caption text-ink-muted block">
                                View account
                            </span>
                        </span>
                        <Icon name="arrow-right" size="sm" directional />
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        onClick={onClose}
                        className={buttonStyles({ fullWidth: true })}
                    >
                        Sign in
                    </Link>
                )}
            </div>
        </Drawer>
    );
}
