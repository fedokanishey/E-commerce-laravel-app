import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Icon, type IconName } from '@/components/atoms/icon';
import { Input } from '@/components/atoms/input';
import { Separator } from '@/components/atoms/separator';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';

type FooterColumn = {
    title: string;
    links: Array<{ label: string; href: string }>;
};

const columns: FooterColumn[] = [
    {
        title: 'Shop',
        links: [
            { label: 'All products', href: '/products' },
            { label: 'Categories', href: '/categories' },
            { label: 'New arrivals', href: '/products?sort=newest' },
            { label: 'Wishlist', href: '/wishlist' },
        ],
    },
    {
        title: 'Support',
        links: [
            { label: 'Help center', href: '#help' },
            { label: 'Shipping', href: '#shipping' },
            { label: 'Returns', href: '#returns' },
            { label: 'Contact', href: '#contact' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '#about' },
            { label: 'Careers', href: '#careers' },
            { label: 'Sell on the marketplace', href: '/seller/onboarding' },
            { label: 'Privacy', href: '#privacy' },
        ],
    },
];

const trustItems: Array<{ icon: IconName; label: string }> = [
    { icon: 'truck', label: 'Fast delivery' },
    { icon: 'shield-check', label: 'Secure checkout' },
    { icon: 'refresh', label: 'Easy returns' },
];

type SiteFooterProps = {
    brandName?: string;
    className?: string;
};

export function SiteFooter({
    brandName = 'Marketplace',
    className,
}: SiteFooterProps) {
    const [email, setEmail] = useState('');

    return (
        <footer className={cn('border-line bg-surface border-t', className)}>
            <div className="ds-container py-12 lg:py-16">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
                    <div>
                        <Link
                            href="/"
                            className={cn(
                                'rounded-control inline-flex items-center gap-2',
                                focusRing,
                            )}
                        >
                            <span className="rounded-control bg-brand-solid text-on-brand flex size-9 items-center justify-center">
                                <Icon name="store" size="md" />
                            </span>
                            <span className="text-h3 text-ink tracking-tight">
                                {brandName}
                            </span>
                        </Link>

                        <p className="text-small text-ink-muted mt-4 max-w-sm">
                            A considered marketplace for everyday essentials,
                            independent sellers, and products worth keeping.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-4">
                            {trustItems.map((item) => (
                                <span
                                    key={item.label}
                                    className="text-caption text-ink-muted inline-flex items-center gap-1.5"
                                >
                                    <Icon
                                        name={item.icon}
                                        size="sm"
                                        className="text-brand"
                                    />
                                    {item.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {columns.map((column) => (
                        <div key={column.title}>
                            <h3 className="text-eyebrow text-ink-subtle uppercase">
                                {column.title}
                            </h3>

                            <ul className="mt-3 space-y-2.5">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                'text-small text-ink-muted hover:text-ink rounded-sm transition-colors',
                                                focusRing,
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Separator className="my-10" />

                <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
                    <div>
                        <h3 className="text-h3 text-ink">
                            Good finds, occasionally.
                        </h3>
                        <p className="text-small text-ink-muted mt-1.5 max-w-md">
                            New arrivals, considered edits, and seller stories.
                            No noise.
                        </p>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            setEmail('');
                        }}
                        className="flex flex-col gap-2 sm:flex-row"
                    >
                        <Input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            aria-label="Email address"
                            autoComplete="email"
                            containerClassName="flex-1"
                        />
                        <Button type="submit">Subscribe</Button>
                    </form>
                </div>

                <div className="border-line mt-10 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-caption text-ink-muted">
                        © {new Date().getFullYear()} {brandName}. All rights
                        reserved.
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" size="sm">
                            Visa
                        </Badge>
                        <Badge variant="outline" size="sm">
                            Mastercard
                        </Badge>
                        <Badge variant="outline" size="sm">
                            PayPal
                        </Badge>
                        <Badge variant="outline" size="sm">
                            Cash on delivery
                        </Badge>
                    </div>
                </div>
            </div>
        </footer>
    );
}
