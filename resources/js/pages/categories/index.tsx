import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/atoms/badge';
import { buttonStyles } from '@/components/atoms/button';
import { Icon, type IconName } from '@/components/atoms/icon';
import { Breadcrumbs } from '@/components/molecules/breadcrumbs';
import { PublicShell } from '@/components/organisms/public-shell';
import { formatCompactNumber } from '@/lib/format';
import { storageUrl } from '@/lib/storefront';
import type { Category } from '@/types/ecommerce';

type CategoriesIndexProps = {
    categories: Category[];
};

const categoryIcons: Record<string, IconName> = {
    electronics: 'credit-card',
    fashion: 'sparkles',
    'home-living': 'home',
    books: 'package',
    'sports-outdoors': 'truck',
};

function productCount(count: number | undefined): string {
    const total = count ?? 0;

    return `${formatCompactNumber(total)} ${total === 1 ? 'product' : 'products'}`;
}

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    const totalProducts = categories.reduce(
        (total, category) => total + (category.products_count ?? 0),
        0,
    );
    const sortedCategories = [...categories].sort(
        (first, second) =>
            (second.products_count ?? 0) - (first.products_count ?? 0) ||
            first.name.localeCompare(second.name),
    );

    return (
        <>
            <Head title="Browse categories" />

            <PublicShell>
                <div className="border-line bg-surface border-b">
                    <div className="ds-container py-10 lg:py-14">
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'Categories' },
                            ]}
                        />

                        <div className="mt-6 max-w-3xl">
                            <Badge variant="brand" dot>
                                Explore the marketplace
                            </Badge>
                            <h1 className="text-h1 text-ink mt-4">
                                Find the right corner.
                            </h1>
                            <p className="text-body text-ink-muted mt-3">
                                Browse departments curated by independent
                                sellers, from practical everyday goods to
                                considered gifts.
                            </p>
                            <p className="text-small text-ink-muted mt-4">
                                {categories.length}{' '}
                                {categories.length === 1
                                    ? 'category'
                                    : 'categories'}{' '}
                                · {formatCompactNumber(totalProducts)} products
                            </p>
                        </div>
                    </div>
                </div>

                <div className="ds-container py-10 lg:py-14">
                    {categories.length > 0 ? (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {sortedCategories.map((category) => {
                                const image = storageUrl(category.image_path);
                                const children = category.children ?? [];

                                return (
                                    <article
                                        key={category.id}
                                        className="rounded-panel border-line bg-surface group hover:border-brand/40 relative overflow-hidden border transition-colors"
                                    >
                                        <Link
                                            href={`/categories/${category.slug}`}
                                            className="focus-visible:outline-none"
                                        >
                                            <div className="bg-surface-muted relative aspect-[16/10] overflow-hidden">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt=""
                                                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                    />
                                                ) : (
                                                    <div className="text-brand/30 flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,var(--ds-brand-soft),var(--ds-surface-muted))]">
                                                        <Icon
                                                            name={
                                                                categoryIcons[
                                                                    category
                                                                        .slug
                                                                ] ?? 'grid'
                                                            }
                                                            size={64}
                                                        />
                                                    </div>
                                                )}

                                                <span className="bg-surface/90 text-ink rounded-control absolute start-4 top-4 inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold backdrop-blur">
                                                    <Icon
                                                        name={
                                                            categoryIcons[
                                                                category.slug
                                                            ] ?? 'grid'
                                                        }
                                                        size="sm"
                                                    />
                                                    {productCount(
                                                        category.products_count,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h2 className="text-h3 text-ink">
                                                            {category.name}
                                                        </h2>
                                                        {category.description && (
                                                            <p className="text-small text-ink-muted mt-1.5 line-clamp-2">
                                                                {
                                                                    category.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <span className="text-brand group-hover:bg-brand-soft flex size-9 shrink-0 items-center justify-center rounded-full transition-colors">
                                                        <Icon
                                                            name="arrow-up-right"
                                                            size="sm"
                                                        />
                                                    </span>
                                                </div>

                                                {children.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                                        {children
                                                            .slice(0, 4)
                                                            .map((child) => (
                                                                <span
                                                                    key={
                                                                        child.id
                                                                    }
                                                                    className="rounded-control border-line text-caption text-ink-muted border px-2 py-1"
                                                                >
                                                                    {child.name}
                                                                </span>
                                                            ))}
                                                        {children.length >
                                                            4 && (
                                                            <span className="text-caption text-ink-subtle px-1 py-1">
                                                                +
                                                                {children.length -
                                                                    4}{' '}
                                                                more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-panel border-line-strong border border-dashed p-12 text-center">
                            <span className="bg-brand-soft text-brand-ink inline-flex size-14 items-center justify-center rounded-full">
                                <Icon name="grid" size="lg" />
                            </span>
                            <h2 className="text-h3 text-ink mt-4">
                                Categories are on the way
                            </h2>
                            <p className="text-small text-ink-muted mx-auto mt-1 max-w-md">
                                Departments will appear here as sellers publish
                                their products.
                            </p>
                            <Link
                                href="/products"
                                className={buttonStyles({
                                    variant: 'outline',
                                    className: 'mt-5',
                                })}
                            >
                                Browse all products
                            </Link>
                        </div>
                    )}
                </div>
            </PublicShell>
        </>
    );
}
