import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/atoms/badge';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Icon, type IconName } from '@/components/atoms/icon';
import { Price } from '@/components/atoms/price';
import { Rating } from '@/components/atoms/rating';
import { SectionHeading } from '@/components/molecules/section-heading';
import { PublicShell } from '@/components/organisms/public-shell';
import { ProductGrid } from '@/components/organisms/product-grid';
import { useStorefrontActions } from '@/hooks/use-storefront-actions';
import { formatCompactNumber } from '@/lib/format';
import { primaryImage, productGridData, storageUrl } from '@/lib/storefront';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types/ecommerce';

type HomeProps = {
    products: Product[];
    categories: Category[];
};

const categoryIcons: Record<string, IconName> = {
    electronics: 'credit-card',
    fashion: 'sparkles',
    'home-living': 'home',
    books: 'package',
    'sports-outdoors': 'truck',
};

const trustItems: Array<{ icon: IconName; title: string; copy: string }> = [
    {
        icon: 'truck',
        title: 'Tracked delivery',
        copy: 'Know where every order is.',
    },
    {
        icon: 'shield-check',
        title: 'Secure checkout',
        copy: 'Your details stay protected.',
    },
    {
        icon: 'refresh',
        title: 'Easy returns',
        copy: 'A straightforward process.',
    },
];

function HeroProduct({ product }: { product: Product }) {
    const image = primaryImage(product);
    const rating =
        product.reviews_count && product.reviews_avg_rating != null
            ? Number(product.reviews_avg_rating)
            : null;

    return (
        <div className="relative">
            <div className="rounded-panel border-line bg-surface shadow-panel overflow-hidden border">
                <div className="bg-surface-muted relative aspect-[4/3] overflow-hidden">
                    {image ? (
                        <img
                            src={storageUrl(image.path) ?? undefined}
                            alt={image.alt_text ?? product.name}
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="text-brand/35 flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,var(--ds-brand-soft),var(--ds-surface-muted))]">
                            <Icon name="package" size={86} />
                        </div>
                    )}

                    <Badge
                        variant="brand"
                        className="bg-surface/90 absolute start-4 top-4 backdrop-blur"
                    >
                        Featured find
                    </Badge>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 p-5">
                    <div className="min-w-0">
                        <p className="text-caption text-ink-muted">
                            {product.seller?.store_name}
                        </p>
                        <h2 className="text-h3 text-ink mt-1 line-clamp-2">
                            <Link
                                href={`/products/${product.slug}`}
                                className="hover:text-brand transition-colors"
                            >
                                {product.name}
                            </Link>
                        </h2>
                        {rating !== null && (
                            <Rating
                                value={rating}
                                count={product.reviews_count}
                                className="mt-2"
                            />
                        )}
                    </div>

                    <div className="text-end">
                        <Price amount={product.price} size="lg" />
                        <Link
                            href={`/products/${product.slug}`}
                            className={buttonStyles({
                                variant: 'outline',
                                size: 'sm',
                                className: 'mt-3',
                            })}
                        >
                            View product
                            <Icon name="arrow-right" size="sm" directional />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Home({ products, categories }: HomeProps) {
    const { addingIds, wishlistedIds, addToCart, toggleWishlist } =
        useStorefrontActions();
    const [featured, ...rest] = products;
    const cards = productGridData(products);
    const sortedCategories = [...categories].sort(
        (first, second) =>
            (second.products_count ?? 0) - (first.products_count ?? 0) ||
            first.name.localeCompare(second.name),
    );

    return (
        <>
            <Head title="Discover considered products" />

            <PublicShell>
                <section className="ds-container pt-10 pb-16 lg:pt-16 lg:pb-24">
                    <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
                        <div>
                            <Badge variant="brand" dot>
                                Marketplace for everyday finds
                            </Badge>

                            <h1 className="text-display text-ink mt-5 max-w-3xl">
                                Buy well. Keep longer.
                            </h1>

                            <p className="text-body text-ink-muted mt-5 max-w-xl">
                                Discover products from independent sellers who
                                care about materials, craft, and the details
                                that make everyday things worth keeping.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Link
                                    href="/products"
                                    className={buttonStyles({ size: 'lg' })}
                                >
                                    Shop all products
                                    <Icon
                                        name="arrow-right"
                                        size="sm"
                                        directional
                                    />
                                </Link>

                                <Link
                                    href="/categories"
                                    className={buttonStyles({
                                        variant: 'outline',
                                        size: 'lg',
                                    })}
                                >
                                    Browse categories
                                </Link>
                            </div>

                            {categories.length > 0 && (
                                <div className="border-line mt-10 flex flex-wrap gap-2 border-t pt-6">
                                    {sortedCategories
                                        .slice(0, 5)
                                        .map((category) => (
                                            <Link
                                                key={category.id}
                                                href={`/categories/${category.slug}`}
                                                className="rounded-control border-line bg-surface text-small text-ink-muted hover:border-brand/40 hover:text-ink border px-3 py-1.5 transition-colors"
                                            >
                                                {category.name}
                                            </Link>
                                        ))}
                                </div>
                            )}
                        </div>

                        {featured ? (
                            <HeroProduct product={featured} />
                        ) : (
                            <div className="rounded-panel border-line bg-surface flex min-h-80 items-center justify-center border border-dashed">
                                <div className="text-center">
                                    <span className="bg-brand-soft text-brand-ink inline-flex size-14 items-center justify-center rounded-full">
                                        <Icon name="package" size="lg" />
                                    </span>
                                    <p className="text-h3 text-ink mt-4">
                                        New finds are on the way
                                    </p>
                                    <p className="text-small text-ink-muted mt-1">
                                        Check back soon for the first
                                        collection.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="border-line bg-surface border-y">
                    <div className="ds-container grid gap-5 py-6 sm:grid-cols-3">
                        {trustItems.map((item) => (
                            <div
                                key={item.title}
                                className="flex items-center gap-3"
                            >
                                <span className="bg-brand-soft text-brand-ink flex size-10 shrink-0 items-center justify-center rounded-full">
                                    <Icon name={item.icon} size="md" />
                                </span>
                                <div>
                                    <p className="text-small text-ink font-semibold">
                                        {item.title}
                                    </p>
                                    <p className="text-caption text-ink-muted">
                                        {item.copy}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="ds-container py-section">
                    <SectionHeading
                        eyebrow="Shop by category"
                        title="Start somewhere good."
                        description="Explore the departments our sellers are building right now."
                        action={
                            <Link
                                href="/categories"
                                className={buttonStyles({
                                    variant: 'outline',
                                    size: 'sm',
                                })}
                            >
                                All categories
                            </Link>
                        }
                    />

                    {categories.length > 0 ? (
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {sortedCategories.map((category, index) => (
                                <Link
                                    key={category.id}
                                    href={`/categories/${category.slug}`}
                                    className={cn(
                                        'rounded-card border-line bg-surface hover:border-brand/40 group relative overflow-hidden border p-5 transition-colors',
                                        index === 0 &&
                                            'sm:col-span-2 lg:col-span-2',
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <span className="bg-brand-soft text-brand-ink flex size-10 items-center justify-center rounded-full">
                                                <Icon
                                                    name={
                                                        categoryIcons[
                                                            category.slug
                                                        ] ?? 'grid'
                                                    }
                                                    size="md"
                                                />
                                            </span>
                                            <h3 className="text-h3 text-ink mt-5">
                                                {category.name}
                                            </h3>
                                            <p className="text-small text-ink-muted mt-1">
                                                {formatCompactNumber(
                                                    category.products_count ??
                                                        0,
                                                )}{' '}
                                                {(category.products_count ??
                                                    0) === 1
                                                    ? 'product'
                                                    : 'products'}
                                            </p>
                                        </div>

                                        <span className="text-ink-subtle group-hover:text-brand group-hover:bg-brand-soft flex size-9 items-center justify-center rounded-full transition-colors">
                                            <Icon
                                                name="arrow-up-right"
                                                size="sm"
                                            />
                                        </span>
                                    </div>

                                    {index === 0 && (
                                        <div
                                            aria-hidden="true"
                                            className="border-brand/10 pointer-events-none absolute -end-10 -bottom-12 size-40 rounded-full border-8"
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-card border-line-strong mt-8 border border-dashed p-10 text-center">
                            <p className="text-small text-ink-muted">
                                Categories will appear here as sellers publish
                                their products.
                            </p>
                        </div>
                    )}
                </section>

                <section className="border-line bg-surface/60 border-t">
                    <div className="ds-container py-section">
                        <SectionHeading
                            eyebrow="Freshly listed"
                            title="New arrivals, worth a look."
                            description="The latest products from independent stores across the marketplace."
                            action={
                                <Link
                                    href="/products?sort=newest"
                                    className={buttonStyles({
                                        variant: 'outline',
                                        size: 'sm',
                                    })}
                                >
                                    See what is new
                                </Link>
                            }
                        />

                        <ProductGrid
                            className="mt-8"
                            products={cards}
                            onAddToCart={addToCart}
                            onToggleWishlist={toggleWishlist}
                            wishlistedIds={wishlistedIds}
                            addingIds={addingIds}
                            emptyTitle="No products yet"
                            emptyDescription="New listings will appear here as sellers publish their catalogs."
                            emptyAction={
                                <Link
                                    href="/register"
                                    className={buttonStyles({
                                        variant: 'outline',
                                    })}
                                >
                                    Create an account
                                </Link>
                            }
                        />
                    </div>
                </section>

                <section className="ds-container py-section">
                    <div className="rounded-panel bg-brand-solid text-on-brand relative overflow-hidden p-8 sm:p-12">
                        <div
                            aria-hidden="true"
                            className="absolute -end-20 -top-24 size-72 rounded-full border border-white/15"
                        />
                        <div
                            aria-hidden="true"
                            className="absolute start-1/3 -bottom-24 size-64 rounded-full border border-white/10"
                        />

                        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="text-eyebrow uppercase opacity-70">
                                    For sellers
                                </p>
                                <h2 className="text-h1 mt-3">
                                    Your products deserve a better home.
                                </h2>
                                <p className="text-body mt-3 max-w-xl opacity-80">
                                    Open a store, list your catalog, and manage
                                    orders and sales from a workspace built for
                                    the work.
                                </p>
                            </div>

                            <Link
                                href="/seller/onboarding"
                                className={buttonStyles({
                                    variant: 'secondary',
                                    size: 'lg',
                                    className:
                                        'bg-on-brand text-brand-ink hover:bg-on-brand/90',
                                })}
                            >
                                Start selling
                                <Icon
                                    name="arrow-right"
                                    size="sm"
                                    directional
                                />
                            </Link>
                        </div>
                    </div>
                </section>

                {rest.length > 0 && (
                    <div className="ds-container pb-16">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-caption text-ink-muted">
                                Showing {products.length} of the latest finds.
                            </p>
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() =>
                                    window.scrollTo({
                                        top: 0,
                                        behavior: 'smooth',
                                    })
                                }
                            >
                                Back to top
                            </Button>
                        </div>
                    </div>
                )}
            </PublicShell>
        </>
    );
}
