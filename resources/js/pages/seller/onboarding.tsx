import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Icon, type IconName } from '@/components/atoms/icon';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { PublicShell } from '@/components/organisms/public-shell';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types/ecommerce';

const benefits: Array<{
    icon: IconName;
    title: string;
    description: string;
}> = [
    {
        icon: 'store',
        title: 'Your own storefront',
        description: 'Showcase your products with a dedicated store identity.',
    },
    {
        icon: 'package',
        title: 'Simple fulfilment',
        description: 'Track orders and move them from pending to delivered.',
    },
    {
        icon: 'sparkles',
        title: 'Sales insights',
        description:
            'See revenue, best sellers, and daily performance at a glance.',
    },
];

export default function SellerOnboarding() {
    const user = usePage<SharedData>().props.auth.user;
    const [preview, setPreview] = useState<string | null>(null);

    const form = useForm({
        store_name: '',
        description: '',
        logo: null as File | null,
    });

    useEffect(() => {
        if (!form.data.logo) {
            setPreview(null);

            return;
        }

        const url = URL.createObjectURL(form.data.logo);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [form.data.logo]);

    return (
        <>
            <Head title="Start selling" />

            <PublicShell>
                <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                        <div>
                            <p className="text-caption text-brand font-semibold tracking-wider uppercase">
                                Become a seller
                            </p>
                            <h1 className="text-display text-ink mt-2 max-w-2xl break-words">
                                Open your store
                            </h1>
                            <p className="text-body text-ink-muted mt-3 max-w-2xl">
                                Set up your seller profile to start listing
                                products. You can update these details any time.
                            </p>

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.post('/seller/onboarding', {
                                        forceFormData: true,
                                    });
                                }}
                                className={cn(cardSurface, 'mt-6 p-5 sm:p-6')}
                            >
                                <div className="space-y-4">
                                    <Input
                                        label="Store name"
                                        name="store_name"
                                        value={form.data.store_name}
                                        onChange={(event) =>
                                            form.setData(
                                                'store_name',
                                                event.target.value,
                                            )
                                        }
                                        error={form.errors.store_name}
                                        hint="This is the name customers will see."
                                        required
                                        maxLength={120}
                                        autoFocus
                                    />

                                    <Textarea
                                        label="Description"
                                        name="description"
                                        value={form.data.description}
                                        onChange={(event) =>
                                            form.setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        error={form.errors.description}
                                        hint="Optional, but it helps customers understand your store."
                                        rows={5}
                                        maxLength={2000}
                                    />
                                </div>

                                <div className="border-line mt-5 border-t pt-5">
                                    <p className="text-small text-ink font-medium">
                                        Store logo
                                    </p>
                                    <p className="text-caption text-ink-muted mt-0.5">
                                        Optional. Square image, up to 2 MB.
                                    </p>

                                    <div className="mt-3 flex items-center gap-4">
                                        <div className="bg-surface-muted border-line rounded-panel flex size-20 shrink-0 items-center justify-center overflow-hidden border">
                                            {preview ? (
                                                <img
                                                    src={preview}
                                                    alt="Store logo preview"
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <Icon
                                                    name="store"
                                                    size="lg"
                                                    className="text-brand/40"
                                                />
                                            )}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="onboarding-logo"
                                                className={buttonStyles({
                                                    variant: 'outline',
                                                    size: 'sm',
                                                })}
                                            >
                                                <Icon name="plus" size="sm" />
                                                Choose logo
                                                <input
                                                    id="onboarding-logo"
                                                    name="logo"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    className="sr-only"
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'logo',
                                                            event.target
                                                                .files?.[0] ??
                                                                null,
                                                        )
                                                    }
                                                />
                                            </label>

                                            {form.data.logo && (
                                                <p className="text-caption text-ink-subtle mt-1 max-w-48 truncate">
                                                    {form.data.logo.name}
                                                </p>
                                            )}
                                            {form.errors.logo && (
                                                <p className="text-caption text-danger mt-1">
                                                    {form.errors.logo}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-line mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
                                    <Button
                                        type="submit"
                                        loading={form.processing}
                                    >
                                        <Icon name="store" size="sm" />
                                        Create store
                                    </Button>

                                    <Link
                                        href="/dashboard"
                                        className={buttonStyles({
                                            variant: 'ghost',
                                        })}
                                    >
                                        Not now
                                    </Link>
                                </div>

                                {user && (
                                    <p className="text-caption text-ink-subtle mt-4">
                                        Signed in as {user.name} ({user.email})
                                    </p>
                                )}
                            </form>
                        </div>

                        <aside className={cn(cardSurface, 'p-5 sm:p-6')}>
                            <h2 className="text-h3 text-ink">What you get</h2>
                            <ul className="mt-4 space-y-4">
                                {benefits.map((benefit) => (
                                    <li
                                        key={benefit.title}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="bg-brand-soft text-brand-ink flex size-9 shrink-0 items-center justify-center rounded-full">
                                            <Icon
                                                name={benefit.icon}
                                                size="sm"
                                            />
                                        </span>
                                        <div>
                                            <p className="text-small text-ink font-medium">
                                                {benefit.title}
                                            </p>
                                            <p className="text-caption text-ink-muted mt-0.5">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <p className="text-caption text-ink-subtle border-line mt-5 border-t pt-4">
                                Your store is activated immediately. You can
                                manage products, orders, and profile details
                                from the seller dashboard.
                            </p>
                        </aside>
                    </div>
                </section>
            </PublicShell>
        </>
    );
}
