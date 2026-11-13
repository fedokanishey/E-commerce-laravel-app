import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/atoms/badge';
import { buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Select } from '@/components/atoms/select';
import { EmptyState } from '@/components/molecules/empty-state';
import { Pagination } from '@/components/molecules/pagination';
import { SearchField } from '@/components/molecules/search-field';
import { SellerShell } from '@/components/organisms/seller-shell';
import { formatCurrency } from '@/lib/format';
import { productStatusLabel, productStatusTone } from '@/lib/seller';
import { productImageUrl } from '@/lib/storefront';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { Paginated, Product, ProductStatus } from '@/types/ecommerce';

type SellerProductsIndexProps = {
    products: Paginated<Product>;
    filters:
        | {
              q?: string | null;
              status?: ProductStatus | null;
          }
        | [];
    statuses: Array<{
        value: ProductStatus;
        label: string;
    }>;
};

type Filters = {
    q?: string | null;
    status?: ProductStatus | null;
};

function currentFilters(filters: SellerProductsIndexProps['filters']): Filters {
    return Array.isArray(filters) ? {} : filters;
}

export default function SellerProductsIndex({
    products,
    filters,
    statuses,
}: SellerProductsIndexProps) {
    const applied = currentFilters(filters);
    const [search, setSearch] = useState(applied.q ?? '');
    const status = applied.status ?? '';

    useEffect(() => {
        setSearch(applied.q ?? '');
    }, [applied.q]);

    const visit = (next: { q?: string; status?: string; page?: number }) => {
        const query: Record<string, string> = {};
        const nextSearch = (next.q ?? search).trim();
        const nextStatus = next.status ?? status;

        if (nextSearch) {
            query.q = nextSearch;
        }

        if (nextStatus) {
            query.status = nextStatus;
        }

        if (next.page && next.page > 1) {
            query.page = String(next.page);
        }

        router.get('/seller/products', query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <Head title="Seller products" />

            <SellerShell
                title="Products"
                description="Manage every item in your store, from drafts to live listings."
                eyebrow="Catalog"
                action={
                    <Link
                        href="/seller/products/create"
                        className={buttonStyles()}
                    >
                        <Icon name="plus" size="sm" />
                        New product
                    </Link>
                }
            >
                <div
                    className={cn(
                        cardSurface,
                        'mb-5 grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_14rem]',
                    )}
                >
                    <SearchField
                        value={search}
                        onChange={setSearch}
                        onSubmit={() => visit({ q: search })}
                        placeholder="Search by name, SKU, or description"
                        label="Search your products"
                    />

                    <Select
                        label="Status"
                        value={status}
                        onChange={(event) =>
                            visit({ status: event.target.value })
                        }
                    >
                        <option value="">All statuses</option>
                        {statuses.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </div>

                {products.data.length > 0 ? (
                    <>
                        <p className="text-caption text-ink-muted mb-3">
                            Showing {products.from ?? 0}–{products.to ?? 0} of{' '}
                            {products.total}{' '}
                            {products.total === 1 ? 'product' : 'products'}
                        </p>

                        <div className="space-y-3">
                            {products.data.map((product) => {
                                const image = productImageUrl(product);

                                return (
                                    <article
                                        key={product.id}
                                        className={cn(
                                            cardSurface,
                                            'flex flex-col gap-4 p-4 sm:flex-row sm:items-center',
                                        )}
                                    >
                                        <div className="bg-surface-muted rounded-control size-20 shrink-0 overflow-hidden">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt=""
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-brand/30 flex size-full items-center justify-center">
                                                    <Icon
                                                        name="package"
                                                        size="lg"
                                                    />
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Link
                                                    href={`/seller/products/${product.id}`}
                                                    className="text-small text-ink hover:text-brand font-semibold transition-colors"
                                                >
                                                    {product.name}
                                                </Link>
                                                <Badge
                                                    variant={productStatusTone(
                                                        product.status,
                                                    )}
                                                    size="sm"
                                                    dot
                                                >
                                                    {productStatusLabel(
                                                        product.status,
                                                    )}
                                                </Badge>
                                                {!product.is_approved && (
                                                    <Badge
                                                        variant="warning"
                                                        size="sm"
                                                    >
                                                        Pending approval
                                                    </Badge>
                                                )}
                                            </div>

                                            <p className="text-caption text-ink-muted mt-1">
                                                SKU {product.sku}
                                                {product.category
                                                    ? ` · ${product.category.name}`
                                                    : ''}
                                                {product.reviews_count != null
                                                    ? ` · ${product.reviews_count} reviews`
                                                    : ''}
                                            </p>

                                            <div className="text-small mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                                                <span className="text-ink font-semibold">
                                                    {formatCurrency(
                                                        product.price,
                                                    )}
                                                </span>
                                                <span
                                                    className={cn(
                                                        product.stock <= 5
                                                            ? 'text-warning-ink'
                                                            : 'text-ink-muted',
                                                    )}
                                                >
                                                    {product.stock} in stock
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                                            <Link
                                                href={`/seller/products/${product.id}`}
                                                className={buttonStyles({
                                                    variant: 'outline',
                                                    size: 'sm',
                                                })}
                                            >
                                                <Icon name="eye" size="sm" />
                                                View
                                            </Link>
                                            <Link
                                                href={`/seller/products/${product.id}/edit`}
                                                className={buttonStyles({
                                                    variant: 'ghost',
                                                    size: 'sm',
                                                })}
                                            >
                                                <Icon
                                                    name="settings"
                                                    size="sm"
                                                />
                                                Edit
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {products.last_page > 1 && (
                            <Pagination
                                currentPage={products.current_page}
                                totalPages={products.last_page}
                                onPageChange={(page) => visit({ page })}
                                className="mt-6"
                            />
                        )}
                    </>
                ) : (
                    <EmptyState
                        title={
                            search || status
                                ? 'No products match your filters'
                                : 'No products yet'
                        }
                        description={
                            search || status
                                ? 'Try a different search term or status.'
                                : 'Add your first product to start selling.'
                        }
                        icon="package"
                        action={
                            <Link
                                href="/seller/products/create"
                                className={buttonStyles()}
                            >
                                Add a product
                            </Link>
                        }
                    />
                )}
            </SellerShell>
        </>
    );
}
