import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import { Icon, type IconName } from '@/components/atoms/icon';
import { PublicShell } from '@/components/organisms/public-shell';
import { storageUrl } from '@/lib/storefront';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types/ecommerce';
import type { Tone } from '@/types/ui';

type SellerShellProps = {
    title: string;
    description?: string;
    eyebrow?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
};

type SellerNavItem = {
    label: string;
    href: string;
    icon: IconName;
};

const statusTone: Record<string, Tone> = {
    active: 'success',
    pending: 'warning',
    suspended: 'danger',
};

export function SellerShell({
    title,
    description,
    eyebrow = 'Seller workspace',
    action,
    children,
    className,
}: SellerShellProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const seller = auth.seller;
    const path = page.url.split('?')[0];

    const navItems: SellerNavItem[] = [
        { label: 'Overview', href: '/seller', icon: 'home' },
        { label: 'Statistics', href: '/seller/statistics', icon: 'sparkles' },
        { label: 'Products', href: '/seller/products', icon: 'package' },
        { label: 'Orders', href: '/seller/orders', icon: 'truck' },
        { label: 'Store profile', href: '/seller/profile', icon: 'store' },
    ];

    const isActive = (href: string) =>
        href === '/seller' ? path === href : path.startsWith(href);

    const visibleNavItems =
        seller?.status === 'active' ? navItems : navItems.slice(0, 1);

    return (
        <PublicShell>
            <div className="ds-container py-8 lg:py-12">
                <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
                    <aside className="space-y-4">
                        <div className="rounded-panel border-line bg-surface border p-5">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    name={seller?.store_name ?? 'Your store'}
                                    src={storageUrl(seller?.logo_path)}
                                    size="lg"
                                />

                                <div className="min-w-0">
                                    <p className="text-small text-ink truncate font-semibold">
                                        {seller?.store_name}
                                    </p>
                                    <Badge
                                        variant={
                                            statusTone[seller?.status ?? ''] ??
                                            'neutral'
                                        }
                                        size="sm"
                                        dot
                                        className="mt-1"
                                    >
                                        {seller?.status === 'pending'
                                            ? 'Pending review'
                                            : seller?.status === 'suspended'
                                              ? 'Suspended'
                                              : 'Active store'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <Link
                                    href="/dashboard"
                                    className={cn(
                                        'rounded-control border-line text-caption text-ink hover:border-brand/40 hover:bg-surface-muted flex items-center justify-center gap-1.5 border px-2 py-2 font-medium transition-colors',
                                        focusRing,
                                    )}
                                >
                                    <Icon name="user" size="sm" />
                                    Account
                                </Link>
                                <Link
                                    href="/"
                                    className={cn(
                                        'rounded-control border-line text-caption text-ink hover:border-brand/40 hover:bg-surface-muted flex items-center justify-center gap-1.5 border px-2 py-2 font-medium transition-colors',
                                        focusRing,
                                    )}
                                >
                                    <Icon name="shopping-bag" size="sm" />
                                    Shop
                                </Link>
                            </div>
                        </div>

                        <nav
                            aria-label="Seller navigation"
                            className="rounded-panel border-line bg-surface p-2"
                        >
                            <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
                                {visibleNavItems.map((item) => {
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
