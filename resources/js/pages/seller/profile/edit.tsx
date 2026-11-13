import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { SellerShell } from '@/components/organisms/seller-shell';
import { sellerStatusLabel, sellerStatusTone } from '@/lib/seller';
import { storageUrl } from '@/lib/storefront';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { SellerSummary } from '@/types/ecommerce';

type SellerProfileEditProps = {
    seller: SellerSummary;
};

export default function SellerProfileEdit({ seller }: SellerProfileEditProps) {
    const currentLogo = storageUrl(seller.logo_path);
    const [preview, setPreview] = useState<string | null>(currentLogo);

    const form = useForm({
        store_name: seller.store_name,
        description: seller.description ?? '',
        logo: null as File | null,
    });

    useEffect(() => {
        if (!form.data.logo) {
            setPreview(currentLogo);

            return;
        }

        const url = URL.createObjectURL(form.data.logo);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [form.data.logo, currentLogo]);

    const submit = () => {
        form.transform((data) => ({ ...data, _method: 'patch' }));
        form.post('/seller/profile', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Store profile" />

            <SellerShell
                title="Store profile"
                description="How your store is presented to customers."
                eyebrow="Settings"
            >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            submit();
                        }}
                        className="space-y-5"
                    >
                        <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                            <h2 className="text-h3 text-ink">Store details</h2>
                            <p className="text-caption text-ink-muted mt-1">
                                Update your public store name and description.
                            </p>

                            <div className="mt-5 space-y-4">
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
                                    required
                                    maxLength={120}
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
                                    hint="Tell customers what your store specializes in."
                                    rows={6}
                                    maxLength={2000}
                                />
                            </div>
                        </section>

                        <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                            <h2 className="text-h3 text-ink">Store logo</h2>
                            <p className="text-caption text-ink-muted mt-1">
                                Use a square image, at least 256 × 256 pixels.
                            </p>

                            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="bg-surface-muted border-line rounded-panel flex size-24 shrink-0 items-center justify-center overflow-hidden border">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt={`${seller.store_name} logo`}
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

                                <div className="min-w-0">
                                    <label
                                        htmlFor="store-logo"
                                        className="rounded-control border-line-strong bg-surface hover:border-brand/40 text-small text-ink inline-flex cursor-pointer items-center gap-2 border px-3 py-2 font-medium transition-colors"
                                    >
                                        <Icon name="plus" size="sm" />
                                        Choose logo
                                        <input
                                            id="store-logo"
                                            name="logo"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="sr-only"
                                            onChange={(event) =>
                                                form.setData(
                                                    'logo',
                                                    event.target.files?.[0] ??
                                                        null,
                                                )
                                            }
                                        />
                                    </label>

                                    <p className="text-caption text-ink-muted mt-2">
                                        JPEG, PNG, or WebP · 2 MB max
                                    </p>
                                    {form.data.logo && (
                                        <p className="text-caption text-ink-subtle mt-1 truncate">
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
                        </section>

                        <Button type="submit" loading={form.processing}>
                            <Icon name="check" size="sm" />
                            Save profile
                        </Button>
                    </form>

                    <aside className="space-y-5">
                        <section className={cn(cardSurface, 'p-5')}>
                            <h2 className="text-small text-ink font-semibold">
                                Store status
                            </h2>

                            <div className="mt-3 flex items-center gap-2">
                                <Badge
                                    variant={sellerStatusTone(seller.status)}
                                    dot
                                >
                                    {sellerStatusLabel(seller.status)}
                                </Badge>
                            </div>

                            <dl className="text-small mt-4 space-y-3">
                                <div>
                                    <dt className="text-caption text-ink-muted">
                                        Store slug
                                    </dt>
                                    <dd className="text-ink mt-0.5 break-all">
                                        {seller.slug}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-caption text-ink-muted">
                                        Seller ID
                                    </dt>
                                    <dd className="text-ink mt-0.5">
                                        #{seller.id}
                                    </dd>
                                </div>
                                {seller.approved_at && (
                                    <div>
                                        <dt className="text-caption text-ink-muted">
                                            Approved
                                        </dt>
                                        <dd className="text-ink mt-0.5">
                                            {new Intl.DateTimeFormat('en-US', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            }).format(
                                                new Date(seller.approved_at),
                                            )}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </section>

                        <p className="text-caption text-ink-subtle">
                            Your store name and logo are shown on product
                            listings, seller pages, and order notifications.
                        </p>
                    </aside>
                </div>
            </SellerShell>
        </>
    );
}
