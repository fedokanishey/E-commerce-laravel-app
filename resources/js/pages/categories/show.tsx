import { Head, Link, router } from '@inertiajs/react';
import { buttonStyles } from '@/components/atoms/button';
import { Icon, type IconName } from '@/components/atoms/icon';
import { Breadcrumbs } from '@/components/molecules/breadcrumbs';
import { Pagination } from '@/components/molecules/pagination';
import { PublicShell } from '@/components/organisms/public-shell';
import { ProductGrid } from '@/components/organisms/product-grid';
import { useStorefrontActions } from '@/hooks/use-storefront-actions';
import { formatCompactNumber } from '@/lib/format';
import { productGridData, storageUrl } from '@/lib/storefront';
import type { Category, Paginated, Product } from '@/types/ecommerce';

type CategoryShowProps = {
    category: Category;
    products: Paginated<Product>;
};

const categoryIcons: Record<string, IconName> = {
    electronics: 'credit-card',
    fashion: 'sparkles',
    'home-living': 'home',
    books: 'package',
    'sports-outdoors': 'truck',
};

export default function CategoryShow({
    category,
    products,
}: CategoryShowProps) {
    const { addingIds, wishlistedIds, addToCart, toggleWishlist } =
        useStorefrontActions();
    const icon = categoryIcons[category.slug] ?? 'grid';
    const image = storageUrl(category.image_path);
    const children = category.children ?? [];

    const goToPage = (page: number) => {
        router.get(`/categories/${category.slug}`, page > 1 ? { page } : {}, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={category.name} />

            <PublicShell>
                <div className="border-line bg-surface border-b">
                    <div className="ds-container py-10 lg:py-14">
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'Categories', href: '/categories' },
                                ...(category.parent
                                    ? [
                                          {
                                              label: category.parent.name,
                                              href: `/categories/${category.parent.slug}`,
                                          },
                                      ]
                                    : []),
                                { label: category.name },
                            ]}
                        />

                        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-center">
                            <div>
                                <span className="bg-brand-soft text-brand-ink inline-flex size-11 items-center justify-center rounded-full">
                                    <Icon name={icon} size="md" />
                                </span>

                                <h1 className="text-h1 text-ink mt-4">
                                    {category.name}
                                </h1>

                                <p className="text-body text-ink-muted mt-3 max-w-2xl">
                                    {category.description ??
                                        `Browse ${category.name.toLowerCase()} from independent sellers across the marketplace.`}
                                </p>

                                <div className="text-small text-ink-muted mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                                    <span>
                                        {formatCompactNumber(products.total)}{' '}
                                        {products.total === 1
                                            ? 'product'
                                            : 'products'}
                                    </span>
                                    {category.parent && (
                                        <>
                                            <span
                                                aria-hidden="true"
                                                className="bg-line-strong size-1 rounded-full"
                                            />
                                            <Link
                                                href={`/categories/${category.parent.slug}`}
                                                className="hover:text-ink transition-colors"
                                            >
                                                Back to {category.parent.name}
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            {image && (
                                <div className="rounded-panel border-line bg-surface-muted hidden overflow-hidden border lg:block">
                                    <img
                                        src={image}
                                        alt=""
                                        className="aspect-[16/10] w-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {children.length > 0 && (
                            <div className="border-line mt-8 flex flex-wrap gap-2 border-t pt-5">
                                <span className="text-caption text-ink-subtle self-center pe-1">
                                    Refine:
                                </span>
                                {children.map((child) => (
                                    <Link
                                        key={child.id}
                                        href={`/categories/${child.slug}`}
                                        className="rounded-control border-line bg-canvas text-small text-ink-muted hover:border-brand/40 hover:text-ink border px-3 py-1.5 transition-colors"
                                    >
                                        {child.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="ds-container py-10 lg:py-14">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <p className="text-small text-ink font-semibold">
                            {products.total === 0
                                ? 'No products in this category yet'
                                : `Showing ${products.from ?? 0}–${products.to ?? 0} of ${products.total}`}
                        </p>

                        <Link
                            href="/products"
                            className={buttonStyles({
                                variant: 'outline',
                                size: 'sm',
                            })}
                        >
                            All products
                        </Link>
                    </div>

                    <ProductGrid
                        products={productGridData(products.data)}
                        onAddToCart={addToCart}
                        onToggleWishlist={toggleWishlist}
                        wishlistedIds={wishlistedIds}
                        addingIds={addingIds}
                        emptyTitle={`Nothing in ${category.name} yet`}
                        emptyDescription="Sellers are still stocking this department. Explore the full collection in the meantime."
                        emptyAction={
                            <Link
                                href="/products"
                                className={buttonStyles({
                                    variant: 'outline',
                                })}
                            >
                                Browse all products
                            </Link>
                        }
                    />

                    {products.last_page > 1 && (
                        <div className="border-line mt-10 border-t pt-8">
                            <Pagination
                                currentPage={products.current_page}
                                totalPages={products.last_page}
                                onPageChange={goToPage}
                            />
                            <p className="text-caption text-ink-muted mt-3 text-center">
                                Page {products.current_page} of{' '}
                                {products.last_page}
                            </p>
                        </div>
                    )}
                </div>
            </PublicShell>
        </>
    );
}
