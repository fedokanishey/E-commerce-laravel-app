import { Head, Link, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Badge } from '@/components/atoms/badge';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Checkbox } from '@/components/atoms/checkbox';
import { Icon } from '@/components/atoms/icon';
import { IconButton } from '@/components/atoms/icon-button';
import { Input } from '@/components/atoms/input';
import { Rating } from '@/components/atoms/rating';
import { Modal } from '@/components/molecules/modal';
import { SellerShell } from '@/components/organisms/seller-shell';
import { formatCurrency } from '@/lib/format';
import { productStatusLabel, productStatusTone } from '@/lib/seller';
import { formatDate, storageUrl } from '@/lib/storefront';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { Product, ProductImage } from '@/types/ecommerce';

type SellerProductShowProps = {
    product: Product;
};

export default function SellerProductShow({ product }: SellerProductShowProps) {
    const [imageToDelete, setImageToDelete] = useState<ProductImage | null>(
        null,
    );
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [uploadKey, setUploadKey] = useState(0);
    const fileInput = useRef<HTMLInputElement>(null);

    const imageForm = useForm({
        image: null as File | null,
        alt_text: product.name,
        is_primary: false,
    });

    const deleteForm = useForm({});
    const imageDeleteForm = useForm({});

    const reviewAverage = Number(product.reviews_avg_rating ?? 0);
    const reviewCount = product.reviews_count ?? product.reviews?.length ?? 0;
    const canViewStorefront =
        product.status === 'active' && product.is_approved;

    const uploadImage = () => {
        imageForm.post(`/seller/products/${product.id}/images`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setUploadKey((key) => key + 1);
                imageForm.reset('image', 'is_primary');
                if (fileInput.current) {
                    fileInput.current.value = '';
                }
            },
        });
    };

    return (
        <>
            <Head title={product.name} />

            <SellerShell
                title={product.name}
                description={`SKU ${product.sku}`}
                eyebrow="Product"
                action={
                    <div className="flex flex-wrap gap-2">
                        {canViewStorefront && (
                            <Link
                                href={`/products/${product.slug}`}
                                className={buttonStyles({
                                    variant: 'outline',
                                    size: 'sm',
                                })}
                            >
                                <Icon name="eye" size="sm" />
                                Storefront
                            </Link>
                        )}
                        <Link
                            href={`/seller/products/${product.id}/edit`}
                            className={buttonStyles({ size: 'sm' })}
                        >
                            <Icon name="settings" size="sm" />
                            Edit product
                        </Link>
                    </div>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className={cn(cardSurface, 'p-5')}>
                        <p className="text-caption text-ink-muted">Price</p>
                        <p className="text-h2 text-ink mt-1 font-semibold">
                            {formatCurrency(product.price)}
                        </p>
                        {product.compare_at_price && (
                            <p className="text-caption text-ink-subtle mt-1 line-through">
                                {formatCurrency(product.compare_at_price)}
                            </p>
                        )}
                    </div>

                    <div className={cn(cardSurface, 'p-5')}>
                        <p className="text-caption text-ink-muted">Stock</p>
                        <p className="text-h2 text-ink mt-1 font-semibold">
                            {product.stock}
                        </p>
                        <p
                            className={cn(
                                'text-caption mt-1',
                                product.stock <= 5
                                    ? 'text-warning-ink'
                                    : 'text-ink-subtle',
                            )}
                        >
                            {product.stock <= 5
                                ? 'Low stock'
                                : 'Available to sell'}
                        </p>
                    </div>

                    <div className={cn(cardSurface, 'p-5')}>
                        <p className="text-caption text-ink-muted">Status</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <Badge
                                variant={productStatusTone(product.status)}
                                dot
                            >
                                {productStatusLabel(product.status)}
                            </Badge>
                            <Badge
                                variant={
                                    product.is_approved ? 'success' : 'warning'
                                }
                            >
                                {product.is_approved
                                    ? 'Approved'
                                    : 'Pending approval'}
                            </Badge>
                        </div>
                    </div>

                    <div className={cn(cardSurface, 'p-5')}>
                        <p className="text-caption text-ink-muted">Reviews</p>
                        <div className="mt-1 flex items-baseline gap-2">
                            <p className="text-h2 text-ink font-semibold">
                                {reviewCount > 0
                                    ? reviewAverage.toFixed(1)
                                    : '—'}
                            </p>
                            {reviewCount > 0 && (
                                <Rating value={reviewAverage} size="sm" />
                            )}
                        </div>
                        <p className="text-caption text-ink-subtle mt-1">
                            {reviewCount}{' '}
                            {reviewCount === 1 ? 'review' : 'reviews'}
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                        <h2 className="text-h3 text-ink">Description</h2>
                        {product.description ? (
                            <p className="text-small text-ink-muted mt-3 whitespace-pre-line">
                                {product.description}
                            </p>
                        ) : (
                            <p className="text-small text-ink-subtle mt-3">
                                No description yet.{' '}
                                <Link
                                    href={`/seller/products/${product.id}/edit`}
                                    className="text-brand hover:underline"
                                >
                                    Add one
                                </Link>{' '}
                                to help customers decide.
                            </p>
                        )}

                        <dl className="border-line mt-5 grid gap-3 border-t pt-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-caption text-ink-muted">
                                    Category
                                </dt>
                                <dd className="text-small text-ink mt-0.5">
                                    {product.category?.name ?? 'Uncategorized'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-caption text-ink-muted">
                                    Product ID
                                </dt>
                                <dd className="text-small text-ink mt-0.5">
                                    #{product.id}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-caption text-ink-muted">
                                    Created
                                </dt>
                                <dd className="text-small text-ink mt-0.5">
                                    {formatDate(product.created_at)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-caption text-ink-muted">
                                    Last updated
                                </dt>
                                <dd className="text-small text-ink mt-0.5">
                                    {formatDate(product.updated_at)}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className={cn(cardSurface, 'p-5 sm:p-6')}>
                        <h2 className="text-h3 text-ink">Images</h2>
                        <p className="text-caption text-ink-muted mt-1">
                            The primary image appears in the storefront.
                        </p>

                        {(product.images?.length ?? 0) > 0 ? (
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {product.images?.map((image) => {
                                    const url = storageUrl(image.path);

                                    return (
                                        <div
                                            key={image.id}
                                            className="group border-line rounded-control bg-surface-muted relative aspect-square overflow-hidden border"
                                        >
                                            {url ? (
                                                <img
                                                    src={url}
                                                    alt={image.alt_text ?? ''}
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

                                            {image.is_primary && (
                                                <Badge
                                                    variant="brand"
                                                    size="sm"
                                                    className="absolute start-2 top-2"
                                                >
                                                    Primary
                                                </Badge>
                                            )}

                                            <IconButton
                                                label="Remove image"
                                                icon="trash"
                                                variant="danger"
                                                className="bg-surface/90 absolute end-2 top-2 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                                                onClick={() =>
                                                    setImageToDelete(image)
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-small text-ink-subtle mt-4">
                                No images yet. Add one below.
                            </p>
                        )}

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                uploadImage();
                            }}
                            className="border-line mt-4 space-y-3 border-t pt-4"
                        >
                            <label
                                htmlFor="new-product-image"
                                className="rounded-control border-line-strong bg-surface hover:border-brand/40 flex cursor-pointer flex-col items-center justify-center border border-dashed px-3 py-5 text-center transition-colors"
                            >
                                <Icon
                                    name="plus"
                                    size="md"
                                    className="text-brand"
                                />
                                <span className="text-small text-ink mt-1.5 font-medium">
                                    Add image
                                </span>
                                <span className="text-caption text-ink-muted">
                                    JPEG, PNG, or WebP · 2 MB max
                                </span>
                                <input
                                    key={uploadKey}
                                    ref={fileInput}
                                    id="new-product-image"
                                    name="image"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="sr-only"
                                    onChange={(event) =>
                                        imageForm.setData(
                                            'image',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                            </label>

                            {imageForm.data.image && (
                                <p className="text-caption text-ink-muted truncate">
                                    {imageForm.data.image.name}
                                </p>
                            )}

                            <Input
                                label="Alt text"
                                name="alt_text"
                                value={imageForm.data.alt_text}
                                onChange={(event) =>
                                    imageForm.setData(
                                        'alt_text',
                                        event.target.value,
                                    )
                                }
                                error={imageForm.errors.alt_text}
                            />

                            <Checkbox
                                label="Make primary"
                                checked={imageForm.data.is_primary}
                                onChange={(event) =>
                                    imageForm.setData(
                                        'is_primary',
                                        event.target.checked,
                                    )
                                }
                            />

                            {imageForm.errors.image && (
                                <p className="text-caption text-danger">
                                    {imageForm.errors.image}
                                </p>
                            )}

                            <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                loading={imageForm.processing}
                                disabled={!imageForm.data.image}
                                className="w-full"
                            >
                                Upload image
                            </Button>
                        </form>
                    </section>
                </div>

                <section
                    className={cn(
                        cardSurface,
                        'border-danger/30 mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6',
                    )}
                >
                    <div>
                        <h2 className="text-h3 text-ink">Delete product</h2>
                        <p className="text-small text-ink-muted mt-1">
                            This permanently removes the product and its images.
                            Existing order history is preserved.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => setConfirmingDelete(true)}
                        className="shrink-0"
                    >
                        <Icon name="trash" size="sm" />
                        Delete product
                    </Button>
                </section>

                {(product.reviews?.length ?? 0) > 0 && (
                    <section className={cn(cardSurface, 'mt-6 p-5 sm:p-6')}>
                        <h2 className="text-h3 text-ink">Recent reviews</h2>

                        <ul className="divide-line mt-3 divide-y">
                            {product.reviews?.slice(0, 5).map((review) => (
                                <li key={review.id} className="py-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-small text-ink font-medium">
                                            {review.user?.name ?? 'Customer'}
                                        </p>
                                        <Rating
                                            value={review.rating}
                                            size="sm"
                                        />
                                    </div>
                                    {review.comment && (
                                        <p className="text-small text-ink-muted mt-1.5">
                                            {review.comment}
                                        </p>
                                    )}
                                    <p className="text-caption text-ink-subtle mt-1">
                                        {formatDate(review.created_at)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <Modal
                    open={confirmingDelete}
                    onClose={() => setConfirmingDelete(false)}
                    title="Delete this product?"
                    description={`${product.name} will be removed from your catalog.`}
                    footer={
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => setConfirmingDelete(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                loading={deleteForm.processing}
                                onClick={() =>
                                    deleteForm.delete(
                                        `/seller/products/${product.id}`,
                                    )
                                }
                            >
                                Delete product
                            </Button>
                        </>
                    }
                >
                    <p className="text-small text-ink-muted">
                        This action cannot be undone. Products referenced by
                        existing orders will remain in those order records.
                    </p>
                </Modal>

                <Modal
                    open={imageToDelete !== null}
                    onClose={() => setImageToDelete(null)}
                    title="Remove this image?"
                    size="sm"
                    footer={
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => setImageToDelete(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                loading={imageDeleteForm.processing}
                                onClick={() => {
                                    if (!imageToDelete) {
                                        return;
                                    }

                                    imageDeleteForm.delete(
                                        `/seller/products/${product.id}/images/${imageToDelete.id}`,
                                        {
                                            preserveScroll: true,
                                            onSuccess: () =>
                                                setImageToDelete(null),
                                        },
                                    );
                                }}
                            >
                                Remove image
                            </Button>
                        </>
                    }
                >
                    <p className="text-small text-ink-muted">
                        The image will be deleted permanently. If it was
                        primary, the next image becomes primary.
                    </p>
                </Modal>
            </SellerShell>
        </>
    );
}
