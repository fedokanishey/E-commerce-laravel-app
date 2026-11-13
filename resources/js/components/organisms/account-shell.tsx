import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import { Icon, type IconName } from '@/components/atoms/icon';
import { PublicShell } from '@/components/organisms/public-shell';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types/ecommerce';

type AccountShellProps = {
    title: string;
    description?: string;
    eyebrow?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
};

type AccountNavItem = {
    label: string;
    href: string;
    icon: IconName;
    count?: number;
};

export function AccountShell({
    title,
    description,
    eyebrow = 'Your account',
    action,
    children,
    className,
}: AccountShellProps) {
    const page = usePage<SharedData>();
    const { auth, unreadNotificationsCount, wishlistItemCount } = page.props;
    const path = page.url.split('?')[0];

    const navItems: AccountNavItem[] = [
        { label: 'Overview', href: '/dashboard', icon: 'home' },
        { label: 'Orders', href: '/orders', icon: 'package' },
        {
            label: 'Wishlist',
            href: '/wishlist',
            icon: 'heart',
            count: wishlistItemCount,
        },
        { label: 'Addresses', href: '/addresses', icon: 'map-pin' },
        {
            label: 'Notifications',
            href: '/notifications',
            icon: 'bell',
            count: unreadNotificationsCount,
        },
        { label: 'Profile', href: '/settings/profile', icon: 'user' },
        { label: 'Password', href: '/settings/password', icon: 'shield-check' },
    ];

    const isActive = (href: string) =>
        href === '/dashboard' ? path === href : path.startsWith(href);

    return (
        <PublicShell>
            <div className="ds-container py-8 lg:py-12">
                <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
                    <aside className="space-y-4">
                        <div className="rounded-panel border-line bg-surface border p-5">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    name={auth.user?.name ?? 'Customer'}
                                    size="lg"
                                />

                                <div className="min-w-0">
                                    <p className="text-small text-ink truncate font-semibold">
                                        {auth.user?.name}
                                    </p>
                                    <p className="text-caption text-ink-muted truncate">
                                        {auth.user?.email}
                                    </p>
                                </div>
                            </div>

                            {auth.seller ? (
                                <Link
                                    href="/seller"
                                    className={cn(
                                        'rounded-control bg-brand-soft text-brand-ink hover:bg-brand-soft/80 mt-4 flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium transition-colors',
                                        focusRing,
                                    )}
                                >
                                    <span className="flex min-w-0 items-center gap-2">
                                        <Icon name="store" size="sm" />
                                        <span className="truncate">
                                            {auth.seller.store_name}
                                        </span>
                                    </span>
                                    <Icon
                                        name="arrow-up-right"
                                        size="sm"
                                        className="shrink-0"
                                    />
                                </Link>
                            ) : (
                                <Link
                                    href="/seller/onboarding"
                                    className={cn(
                                        'rounded-control border-line text-small text-ink hover:border-brand/40 hover:bg-surface-muted mt-4 flex items-center justify-between gap-3 border px-3 py-2.5 font-medium transition-colors',
                                        focusRing,
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <Icon name="store" size="sm" />
                                        Start selling
                                    </span>
                                    <Icon
                                        name="arrow-right"
                                        size="sm"
                                        className="text-ink-subtle"
                                    />
                                </Link>
                            )}
                        </div>

                        <nav
                            aria-label="Account navigation"
                            className="rounded-panel border-line bg-surface p-2"
                        >
                            <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
                                {navItems.map((item) => {
                                    const active = isActive(item.href);

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                aria-current={
                                                    active ? 'page' : undefined
                                                }
                                                className={cn(
                                                    'rounded-control text-small flex items-center gap-2.5 px-3 py-2.5 font-medium transition-colors',
                                                    focusRing,
                                                    active
                                                        ? 'bg-brand-soft text-brand-ink'
                                                        : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                                                )}
                                            >
                                                <Icon
                                                    name={item.icon}
                                                    size="sm"
                                                    className="shrink-0"
                                                />
                                                <span className="truncate">
                                                    {item.label}
                                                </span>

                                                {item.count != null &&
                                                    item.count > 0 && (
                                                        <Badge
                                                            variant="brand"
                                                            size="sm"
                                                            className="ms-auto"
                                                        >
                                                            {item.count > 99
                                                                ? '99+'
                                                                : item.count}
                                                        </Badge>
                                                    )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </aside>

                    <section className={cn('min-w-0', className)}>
                        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-eyebrow text-brand uppercase">
                                    {eyebrow}
                                </p>
                                <h1 className="text-h1 text-ink mt-1.5 break-words">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-small text-ink-muted mt-2 max-w-2xl">
                                        {description}
                                    </p>
                                )}
                            </div>

                            {action && <div className="shrink-0">{action}</div>}
                        </header>

                        {children}
                    </section>
                </div>
            </div>
        </PublicShell>
    );
}
