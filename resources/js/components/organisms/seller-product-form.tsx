import { Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Input } from '@/components/atoms/input';
import { Select } from '@/components/atoms/select';
import { Textarea } from '@/components/atoms/textarea';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { Category, Product, ProductStatus } from '@/types/ecommerce';

type CategoryOption = Pick<Category, 'id' | 'name' | 'parent_id'>;

type SellerProductFormProps = {
    categories: CategoryOption[];
    statuses: Array<{
        value: ProductStatus;
        label: string;
    }>;
    product?: Product;
};

export default function SellerProductForm({
    categories,
    statuses,
    product,
}: SellerProductFormProps) {
    const pageErrors = usePage<{
        errors: Record<string, string | undefined>;
    }>().props.errors;
    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    const form = useForm({
        name: product?.name ?? '',
        sku: product?.sku ?? '',
        category_id: product?.category_id ? String(product.category_id) : '',
        description: product?.description ?? '',
        price: product?.price ? String(product.price) : '',
        compare_at_price: product?.compare_at_price
            ? String(product.compare_at_price)
            : '',
        stock: product ? String(product.stock) : '0',
        status: product?.status ?? ('draft' as ProductStatus),
        images: [] as File[],
    });

    const categoryGroups = useMemo(() => {
        const roots = categories.filter(
            (category) => category.parent_id === null,
        );

        return roots
            .map((root) => ({
                root,
                children: categories.filter(
                    (category) => category.parent_id === root.id,
                ),
            }))
            .filter(
                (group) =>
                    group.children.length > 0 || group.root.parent_id === null,
            );
    }, [categories]);

    const imageError =
        pageErrors['images'] ??
        pageErrors['images.0'] ??
        (form.errors as Record<string, string | undefined>).images;

    const submit = () => {
        if (product) {
            form.transform((data) => ({
                ...data,
                _method: 'patch',
            }));
            form.post(`/seller/products/${product.id}`, {
                forceFormData: true,
                preserveScroll: true,
            });

            return;
        }

        form.post('/seller/products', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleImages = (files: FileList | null) => {
        const next = files ? Array.from(files).slice(0, 5) : [];
        setSelectedImages(next);
        form.setData('images', next);
    };

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
            className="space-y-5"
        >
            <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                <h2 className="text-h3 text-ink">Product details</h2>
                <p className="text-caption text-ink-muted mt-1">
                    Basic information customers will see.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Product name"
                        name="name"
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                        error={form.errors.name}
                        containerClassName="sm:col-span-2"
                        required
                        autoFocus
                    />

                    <Input
                        label="SKU"
                        name="sku"
                        value={form.data.sku}
                        onChange={(event) =>
                            form.setData('sku', event.target.value)
                        }
                        error={form.errors.sku}
                        hint="A unique stock keeping unit for this product."
                        required
                    />

                    <Select
                        label="Category"
                        name="category_id"
                        value={form.data.category_id}
                        onChange={(event) =>
                            form.setData('category_id', event.target.value)
                        }
                        error={form.errors.category_id}
                    >
                        <option value="">Uncategorized</option>
                        {categoryGroups.map(({ root, children }) => (
                            <optgroup key={root.id} label={root.name}>
                                <option value={root.id}>{root.name}</option>
                                {children.map((child) => (
                                    <option key={child.id} value={child.id}>
                                        {child.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </Select>

                    <Textarea
                        label="Description"
                        name="description"
                        value={form.data.description}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                        error={form.errors.description}
                        hint="Describe materials, dimensions, and what makes it useful."
                        rows={6}
                        containerClassName="sm:col-span-2"
                    />
                </div>
            </section>

            <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                <h2 className="text-h3 text-ink">Pricing and inventory</h2>
                <p className="text-caption text-ink-muted mt-1">
                    Set the price, original value, and available stock.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Input
                        label="Price"
                        name="price"
                        type="number"
                        min="0.01"
                        max="999999.99"
                        step="0.01"
                        value={form.data.price}
                        onChange={(event) =>
                            form.setData('price', event.target.value)
                        }
                        error={form.errors.price}
                        required
                    />

                    <Input
                        label="Compare at price"
                        name="compare_at_price"
                        type="number"
                        min="0.01"
                        max="999999.99"
                        step="0.01"
                        value={form.data.compare_at_price}
                        onChange={(event) =>
                            form.setData('compare_at_price', event.target.value)
                        }
                        error={form.errors.compare_at_price}
                        hint="Optional original price."
                    />

                    <Input
                        label="Stock"
                        name="stock"
                        type="number"
                        min="0"
                        max="1000000"
                        step="1"
                        value={form.data.stock}
                        onChange={(event) =>
                            form.setData('stock', event.target.value)
                        }
                        error={form.errors.stock}
                        required
                    />

                    <Select
                        label="Status"
                        name="status"
                        value={form.data.status}
                        onChange={(event) =>
                            form.setData(
                                'status',
                                event.target.value as ProductStatus,
                            )
                        }
                        error={form.errors.status}
                        required
                    >
                        {statuses.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </Select>
                </div>
            </section>

            <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                <h2 className="text-h3 text-ink">Product images</h2>
                <p className="text-caption text-ink-muted mt-1">
                    Upload up to five JPEG, PNG, or WebP images (2 MB each). The
                    first image becomes the primary image.
                </p>

                {product && (product.images?.length ?? 0) > 0 && (
                    <p className="text-caption text-ink-muted mt-3">
                        This product already has {product.images?.length}{' '}
                        {(product.images?.length ?? 0) === 1
                            ? 'image'
                            : 'images'}
                        . Manage existing images from the product page.
                    </p>
                )}

                <div className="mt-4">
                    <label
                        htmlFor="product-images"
                        className="rounded-control border-line-strong bg-surface hover:border-brand/40 flex cursor-pointer flex-col items-center justify-center border border-dashed px-4 py-8 text-center transition-colors"
                    >
                        <span className="bg-brand-soft text-brand-ink flex size-11 items-center justify-center rounded-full">
                            <Icon name="plus" size="md" />
                        </span>
                        <span className="text-small text-ink mt-3 font-medium">
                            Choose images
                        </span>
                        <span className="text-caption text-ink-muted mt-1">
                            PNG, JPG, or WebP up to 2 MB each
                        </span>
                        <input
                            id="product-images"
                            name="images"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(event) =>
                                handleImages(event.target.files)
                            }
                            className="sr-only"
                        />
                    </label>

                    {selectedImages.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                            {selectedImages.map((file) => (
                                <li
                                    key={`${file.name}-${file.size}`}
                                    className="text-small text-ink-muted flex items-center justify-between gap-3"
                                >
                                    <span className="truncate">
                                        {file.name}
                                    </span>
                                    <span className="text-caption text-ink-subtle shrink-0">
                                        {(file.size / 1024).toFixed(0)} KB
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {imageError && (
                        <p className="text-caption text-danger mt-2">
                            {imageError}
                        </p>
                    )}
                </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" loading={form.processing}>
                    <Icon name={product ? 'check' : 'plus'} size="sm" />
                    {product ? 'Save changes' : 'Create product'}
                </Button>

                <Link
                    href={
                        product
                            ? `/seller/products/${product.id}`
                            : '/seller/products'
                    }
                    className={buttonStyles({ variant: 'ghost' })}
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
