import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Icon } from '@/components/atoms/icon';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types/ecommerce';

type AuthShellProps = {
    children: ReactNode;
};

const trustItems = [
    { icon: 'shield-check' as const, label: 'Secure checkout' },
    { icon: 'truck' as const, label: 'Tracked delivery' },
    { icon: 'refresh' as const, label: 'Easy returns' },
];

export function AuthShell({ children }: AuthShellProps) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="bg-canvas text-ink flex min-h-screen flex-col">
            <header className="ds-container flex h-20 items-center justify-between gap-4">
                <Link
                    href="/"
                    className={cn(
                        'rounded-control inline-flex items-center gap-2',
                        focusRing,
                    )}
                >
                    <span className="rounded-control bg-brand-solid text-on-brand shadow-card flex size-9 items-center justify-center">
                        <Icon name="store" size="md" />
                    </span>
                    <span className="text-h3 text-ink tracking-tight">
                        {name}
                    </span>
                </Link>

                <Link
                    href="/products"
                    className={cn(
                        'text-small text-ink-muted hover:text-ink inline-flex items-center gap-1.5 font-medium transition-colors',
                        focusRing,
                    )}
                >
                    Continue shopping
                    <Icon name="arrow-right" size="sm" directional />
                </Link>
            </header>

            <main className="ds-container grid flex-1 gap-10 pt-4 pb-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-24">
                <section className="bg-brand-solid text-on-brand rounded-panel relative hidden overflow-hidden p-10 lg:flex lg:min-h-[36rem] lg:flex-col lg:justify-between">
                    <div
                        aria-hidden="true"
                        className="absolute -end-24 -top-24 size-80 rounded-full border border-white/15"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute -start-20 -bottom-20 size-64 rounded-full border border-white/10"
                    />

                    <div className="relative">
                        <p className="text-eyebrow uppercase opacity-70">
                            A calmer marketplace
                        </p>
                        <p className="text-h1 mt-4 max-w-md">
                            Good things from independent sellers.
                        </p>
                        <p className="text-body mt-4 max-w-md opacity-80">
                            Discover considered products, keep track of every
                            order, and manage your store from one place.
                        </p>
                    </div>

                    <div className="relative flex flex-wrap gap-x-6 gap-y-3">
                        {trustItems.map((item) => (
                            <span
                                key={item.label}
                                className="text-caption inline-flex items-center gap-2 font-medium opacity-90"
                            >
                                <Icon name={item.icon} size="sm" />
                                {item.label}
                            </span>
                        ))}
                    </div>
                </section>

                <section className="mx-auto w-full max-w-md lg:max-w-lg">
                    {children}
                </section>
            </main>
        </div>
    );
}
