import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/atoms/badge';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Input } from '@/components/atoms/input';
import { Select } from '@/components/atoms/select';
import { Breadcrumbs } from '@/components/molecules/breadcrumbs';
import { Pagination } from '@/components/molecules/pagination';
import { SearchField } from '@/components/molecules/search-field';
import { PublicShell } from '@/components/organisms/public-shell';
import { ProductGrid } from '@/components/organisms/product-grid';
import { useStorefrontActions } from '@/hooks/use-storefront-actions';
import { formatCompactNumber } from '@/lib/format';
import { filterQuery, productGridData } from '@/lib/storefront';
import { cn } from '@/lib/utils';
import type {
    Category,
    Paginated,
    Product,
    ProductFilters,
} from '@/types/ecommerce';

type ProductsIndexProps = {
    products: Paginated<Product>;
    filters: ProductFilters | ProductFilters[];
    categories: Category[];
};

const emptyFilters: ProductFilters = {};

function normalizeFilters(
    filters: ProductFilters | ProductFilters[],
): ProductFilters {
    return Array.isArray(filters) ? emptyFilters : filters;
}

const sortOptions = [
    { value: 'newest', label: 'Newest first' },
    { value: 'popular', label: 'Most popular' },
    { value: 'rating', label: 'Highest rated' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
] as const;

const perPageOptions = [12, 24, 48] as const;

type FilterForm = {
    q: string;
    category: string;
    min_price: string;
    max_price: string;
    sort: string;
    per_page: string;
};

function initialForm(filters: ProductFilters): FilterForm {
    return {
        q: filters.q ?? '',
        category: filters.category ?? '',
        min_price:
            filters.min_price !== null && filters.min_price !== undefined
                ? String(filters.min_price)
                : '',
        max_price:
            filters.max_price !== null && filters.max_price !== undefined
                ? String(filters.max_price)
                : '',
        sort: filters.sort ?? 'newest',
        per_page: String(filters.per_page ?? 12),
    };
}

export default function ProductsIndex({
    products,
    filters,
    categories,
}: ProductsIndexProps) {
    const { addingIds, wishlistedIds, addToCart, toggleWishlist } =
        useStorefrontActions();
    const appliedFilters = normalizeFilters(filters);
    const [form, setForm] = useState<FilterForm>(() =>
        initialForm(appliedFilters),
    );
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        setForm(initialForm(appliedFilters));
    }, [appliedFilters]);

    const cards = productGridData(products.data);
    const categoryParents = categories.filter(
        (category) => category.parent_id === null,
    );

    const navigate = (next: Partial<FilterForm>, page?: number) => {
        const query = filterQuery({
            q: next.q?.trim(),
            category: next.category,
            min_price: next.min_price,
            max_price: next.max_price,
            sort: (next.sort || 'newest') as ProductFilters['sort'],
            per_page: Number(next.per_page) as ProductFilters['per_page'],
        });

        if (page && page > 1) {
            query.page = String(page);
        }

        router.get('/products', query, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    const updateField = (key: keyof FilterForm, value: string) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const applyFilters = () => {
        setFiltersOpen(false);
        navigate(form);
    };

    const clearFilters = () => {
        setFiltersOpen(false);
        router.get('/products', {}, { preserveScroll: true });
    };

    const activeFilters = [
        appliedFilters.q
            ? {
                  key: 'q',
                  label: `Search: ${appliedFilters.q}`,
                  clear: () => navigate({ ...form, q: '' }),
              }
            : null,
        appliedFilters.category
            ? {
                  key: 'category',
                  label:
                      categories.find(
                          (category) =>
                              category.slug === appliedFilters.category,
                      )?.name ?? appliedFilters.category,
                  clear: () => navigate({ ...form, category: '' }),
              }
            : null,
        appliedFilters.min_price !== undefined &&
        appliedFilters.min_price !== null
            ? {
                  key: 'min_price',
                  label: `From $${appliedFilters.min_price}`,
                  clear: () => navigate({ ...form, min_price: '' }),
              }
            : null,
        appliedFilters.max_price !== undefined &&
        appliedFilters.max_price !== null
            ? {
                  key: 'max_price',
                  label: `Up to $${appliedFilters.max_price}`,
                  clear: () => navigate({ ...form, max_price: '' }),
              }
            : null,
    ].filter(
        (filter): filter is { key: string; label: string; clear: () => void } =>
            filter !== null,
    );

    const hasFilters = activeFilters.length > 0;
    const rangeStart = products.from ?? 0;
    const rangeEnd = products.to ?? 0;

    return (
        <>
            <Head
                title={
                    appliedFilters.q
                        ? `Search results for "${appliedFilters.q}"`
                        : 'Shop all products'
                }
            />

            <PublicShell>
                <div className="border-line bg-surface border-b">
                    <div className="ds-container py-10 lg:py-14">
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'Shop' },
                            ]}
                        />

                        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-eyebrow text-brand uppercase">
                                    {appliedFilters.q
                                        ? 'Search results'
                                        : 'The full collection'}
                                </p>
                                <h1 className="text-h1 text-ink mt-2">
                                    {appliedFilters.q
                                        ? `Results for "${appliedFilters.q}"`
                                        : 'Shop all products'}
                                </h1>
                                <p className="text-small text-ink-muted mt-2">
                                    {formatCompactNumber(products.total)}{' '}
                                    {products.total === 1
                                        ? 'product'
                                        : 'products'}{' '}
                                    from independent sellers.
                                </p>
                            </div>

                            <div className="w-full max-w-md">
                                <SearchField
                                    value={form.q}
                                    onChange={(value) =>
                                        updateField('q', value)
                                    }
                                    onSubmit={(value) =>
                                        navigate({
                                            ...form,
                                            q: value,
                                            category: form.category,
                                        })
                                    }
                                    label="Search products"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ds-container py-8 lg:py-10">
                    <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
                        <aside className="lg:sticky lg:top-28 lg:self-start">
                            <div className="flex items-center justify-between gap-3 lg:hidden">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setFiltersOpen((current) => !current)
                                    }
                                    aria-expanded={filtersOpen}
                                    aria-controls="product-filters"
                                >
                                    <Icon name="sliders" size="sm" />
                                    Filters
                                    {hasFilters && (
                                        <Badge variant="brand" size="sm">
                                            {activeFilters.length}
                                        </Badge>
                                    )}
                                </Button>

                                <Select
                                    aria-label="Sort products"
                                    value={form.sort}
                                    onChange={(event) => {
                                        const sort = event.target.value;
                                        updateField('sort', sort);
                                        navigate({ ...form, sort });
                                    }}
                                    containerClassName="w-44"
                                >
                                    {sortOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div
                                id="product-filters"
                                className={cn(
                                    'mt-4 lg:mt-0',
                                    !filtersOpen && 'hidden lg:block',
                                )}
                            >
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        applyFilters();
                                    }}
                                    className="rounded-card border-line bg-surface border p-5"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h2 className="text-h3 text-ink">
                                            Filters
                                        </h2>
                                        {hasFilters && (
                                            <Button
                                                type="button"
                                                variant="link"
                                                size="sm"
                                                onClick={clearFilters}
                                            >
                                                Clear all
                                            </Button>
                                        )}
                                    </div>

                                    <div className="mt-5 space-y-5">
                                        <div>
                                            <p className="text-small text-ink mb-2 font-semibold">
                                                Category
                                            </p>
                                            <Select
                                                aria-label="Filter by category"
                                                value={form.category}
                                                onChange={(event) =>
                                                    updateField(
                                                        'category',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    All categories
                                                </option>
                                                {categoryParents.map(
                                                    (parent) => {
                                                        const children =
                                                            categories.filter(
                                                                (category) =>
                                                                    category.parent_id ===
                                                                    parent.id,
                                                            );

                                                        if (
                                                            children.length ===
                                                            0
                                                        ) {
                                                            return (
                                                                <option
                                                                    key={
                                                                        parent.id
                                                                    }
                                                                    value={
                                                                        parent.slug
                                                                    }
                                                                >
                                                                    {
                                                                        parent.name
                                                                    }
                                                                </option>
                                                            );
                                                        }

                                                        return (
                                                            <optgroup
                                                                key={parent.id}
                                                                label={
                                                                    parent.name
                                                                }
                                                            >
                                                                <option
                                                                    value={
                                                                        parent.slug
                                                                    }
                                                                >
                                                                    All{' '}
                                                                    {
                                                                        parent.name
                                                                    }
                                                                </option>
                                                                {children.map(
                                                                    (child) => (
                                                                        <option
                                                                            key={
                                                                                child.id
                                                                            }
                                                                            value={
                                                                                child.slug
                                                                            }
                                                                        >
                                                                            {
                                                                                child.name
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </optgroup>
                                                        );
                                                    },
                                                )}
                                            </Select>
                                        </div>

                                        <div>
                                            <p className="text-small text-ink mb-2 font-semibold">
                                                Price range
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    type="number"
                                                    inputMode="decimal"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Min"
                                                    aria-label="Minimum price"
                                                    value={form.min_price}
                                                    onChange={(event) =>
                                                        updateField(
                                                            'min_price',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <Input
                                                    type="number"
                                                    inputMode="decimal"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Max"
                                                    aria-label="Maximum price"
                                                    value={form.max_price}
                                                    onChange={(event) =>
                                                        updateField(
                                                            'max_price',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-small text-ink mb-2 font-semibold">
                                                Show per page
                                            </p>
                                            <Select
                                                aria-label="Products per page"
                                                value={form.per_page}
                                                onChange={(event) =>
                                                    updateField(
                                                        'per_page',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                {perPageOptions.map((count) => (
                                                    <option
                                                        key={count}
                                                        value={count}
                                                    >
                                                        {count} products
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>

                                        <Button
                                            type="submit"
                                            fullWidth
                                            className="mt-1"
                                        >
                                            Apply filters
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </aside>

                        <section>
                            <div className="mb-5 hidden items-center justify-between gap-4 lg:flex">
                                <p className="text-small text-ink-muted">
                                    {products.total === 0
                                        ? 'No products match these filters.'
                                        : `Showing ${rangeStart}–${rangeEnd} of ${products.total}`}
                                </p>

                                <div className="flex items-center gap-2">
                                    <span className="text-caption text-ink-muted">
                                        Sort
                                    </span>
                                    <Select
                                        aria-label="Sort products"
                                        value={form.sort}
                                        onChange={(event) => {
                                            const sort = event.target.value;
                                            updateField('sort', sort);
                                            navigate({ ...form, sort });
                                        }}
                                        containerClassName="w-48"
                                    >
                                        {sortOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            {hasFilters && (
                                <div className="mb-5 flex flex-wrap items-center gap-2">
                                    {activeFilters.map((filter) => (
                                        <button
                                            key={filter.key}
                                            type="button"
                                            onClick={filter.clear}
                                            className="rounded-control border-line bg-surface text-caption text-ink-muted hover:border-brand/40 hover:text-ink inline-flex items-center gap-1.5 border px-2.5 py-1.5 transition-colors"
                                        >
                                            {filter.label}
                                            <Icon name="close" size="sm" />
                                            <span className="sr-only">
                                                Remove filter
                                            </span>
                                        </button>
                                    ))}

                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        Clear all
                                    </Button>
                                </div>
                            )}

                            <p className="text-caption text-ink-muted mb-4 lg:hidden">
                                {products.total === 0
                                    ? 'No products match these filters.'
                                    : `Showing ${rangeStart}–${rangeEnd} of ${products.total}`}
                            </p>

                            <ProductGrid
                                products={cards}
                                onAddToCart={addToCart}
                                onToggleWishlist={toggleWishlist}
                                wishlistedIds={wishlistedIds}
                                addingIds={addingIds}
                                emptyTitle="No products found"
                                emptyDescription={
                                    hasFilters
                                        ? 'No products match these filters. Try widening your search or price range.'
                                        : 'Products will appear here once sellers publish their catalogs.'
                                }
                                emptyAction={
                                    hasFilters ? (
                                        <Button
                                            variant="outline"
                                            onClick={clearFilters}
                                        >
                                            Clear filters
                                        </Button>
                                    ) : (
                                        <Link
                                            href="/categories"
                                            className={buttonStyles({
                                                variant: 'outline',
                                            })}
                                        >
                                            Browse categories
                                        </Link>
                                    )
                                }
                            />

                            {products.last_page > 1 && (
                                <div className="border-line mt-10 border-t pt-8">
                                    <Pagination
                                        currentPage={products.current_page}
                                        totalPages={products.last_page}
                                        onPageChange={(page) =>
                                            navigate(form, page)
                                        }
                                    />
                                    <p className="text-caption text-ink-muted mt-3 text-center">
                                        Page {products.current_page} of{' '}
                                        {products.last_page}
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </PublicShell>
        </>
    );
}
