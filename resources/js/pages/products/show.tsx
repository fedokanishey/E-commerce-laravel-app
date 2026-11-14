import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Price } from '@/components/atoms/price';
import { Rating } from '@/components/atoms/rating';
import { Select } from '@/components/atoms/select';
import { StockStatus } from '@/components/atoms/stock-status';
import { Textarea } from '@/components/atoms/textarea';
import { Breadcrumbs } from '@/components/molecules/breadcrumbs';
import { Modal } from '@/components/molecules/modal';
import { SectionHeading } from '@/components/molecules/section-heading';
import { Tabs } from '@/components/molecules/tabs';
import { QuantityStepper } from '@/components/molecules/quantity-stepper';
import { PublicShell } from '@/components/organisms/public-shell';
import { ProductGrid } from '@/components/organisms/product-grid';
import { useStorefrontActions } from '@/hooks/use-storefront-actions';
import {
    formatDate as formatStorefrontDate,
    mapProductCard,
    primaryImage,
    productGridData,
    productStockStatus,
    storageUrl,
} from '@/lib/storefront';
import { cn } from '@/lib/utils';
import type { Product, ProductReview, SharedData } from '@/types/ecommerce';

type ProductShowProps = {
    product: Product;
    averageRating: number;
    reviewCount: number;
    relatedProducts: Product[];
    canReview: boolean;
    userReview: ProductReview | null;
};

function ReviewItem({ review }: { review: ProductReview }) {
    return (
        <article className="border-line border-b py-5 first:pt-0 last:border-0">
            <div className="flex items-start gap-3">
                <Avatar
                    name={review.user?.name ?? 'Customer'}
                    size="sm"
                    className="mt-0.5"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-small text-ink font-semibold">
                            {review.user?.name ?? 'Customer'}
                        </p>
                        {review.is_verified_purchase && (
                            <Badge variant="success" size="sm">
                                Verified purchase
                            </Badge>
                        )}
                        <span className="text-caption text-ink-subtle">
                            {formatStorefrontDate(review.created_at)}
                        </span>
                    </div>

                    <Rating
                        value={review.rating}
                        className="mt-1.5"
                        count={undefined}
                    />

                    {review.comment && (
                        <p className="text-small text-ink-muted mt-2.5 whitespace-pre-line">
                            {review.comment}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function ProductShow({
    product,
    averageRating,
    reviewCount,
    relatedProducts,
    canReview,
    userReview,
}: ProductShowProps) {
    const { auth } = usePage<SharedData>().props;
    const { addingIds, wishlistedIds, addToCart, toggleWishlist } =
        useStorefrontActions();
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [editingReview, setEditingReview] = useState(false);
    const [confirmingReviewDelete, setConfirmingReviewDelete] = useState(false);
    const [deletingReview, setDeletingReview] = useState(false);
    const reviewForm = useForm({
        rating: 5,
        comment: '',
    });
    const reviewId = userReview?.id ?? null;

    useEffect(() => {
        reviewForm.setData({
            rating: userReview?.rating ?? 5,
            comment: userReview?.comment ?? '',
        });
        setEditingReview(false);
    }, [reviewId]);

    const images = product.images ?? [];
    const selectedImage = images[activeImage] ?? primaryImage(product);
    const card = mapProductCard(product);
    const stockStatus = productStockStatus(product);
    const isOutOfStock = stockStatus === 'out-of-stock';
    const isWishlisted = wishlistedIds.has(product.id);
    const maxQuantity = Math.max(1, Math.min(product.stock, 99));

    const submitReview = () => {
        if (userReview) {
            reviewForm.patch(`/reviews/${userReview.id}`, {
                preserveScroll: true,
                onSuccess: () => setEditingReview(false),
            });

            return;
        }

        reviewForm.post(`/products/${product.slug}/reviews`, {
            preserveScroll: true,
            onSuccess: () => reviewForm.reset(),
        });
    };

    const deleteReview = () => {
        if (!userReview) {
            return;
        }

        setDeletingReview(true);

        router.delete(`/reviews/${userReview.id}`, {
            preserveScroll: true,
            onSuccess: () => setConfirmingReviewDelete(false),
            onFinish: () => setDeletingReview(false),
        });
    };

    const cancelReviewEdit = () => {
        setEditingReview(false);
        reviewForm.setData({
            rating: userReview?.rating ?? 5,
            comment: userReview?.comment ?? '',
        });
        reviewForm.clearErrors();
    };

    const reviewContent = (
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
            <div>
                {product.reviews && product.reviews.length > 0 ? (
                    <div>
                        {product.reviews.map((review) => (
                            <ReviewItem key={review.id} review={review} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-card border-line border border-dashed p-10 text-center">
                        <span className="bg-brand-soft text-brand-ink inline-flex size-12 items-center justify-center rounded-full">
                            <Icon name="star" size="lg" />
                        </span>
                        <p className="text-h3 text-ink mt-4">No reviews yet</p>
                        <p className="text-small text-ink-muted mt-1">
                            Be the first to share what you think.
                        </p>
                    </div>
                )}
            </div>

            <div className="rounded-card border-line bg-surface-muted/50 h-fit border p-5">
                <h3 className="text-h3 text-ink">
                    {userReview
                        ? editingReview
                            ? 'Edit your review'
                            : 'Your review'
                        : 'Write a review'}
                </h3>

                {!auth.user ? (
                    <div className="mt-3">
                        <p className="text-small text-ink-muted">
                            Sign in to share your experience with this product.
                        </p>
                        <Link
                            href="/login"
                            className={buttonStyles({
                                variant: 'outline',
                                size: 'sm',
                                className: 'mt-4',
                            })}
                        >
                            Sign in to review
                        </Link>
                    </div>
                ) : userReview && !editingReview ? (
                    <div className="mt-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Rating value={userReview.rating} />
                            <Badge variant="brand" size="sm">
                                Published
                            </Badge>
                        </div>

                        <p className="text-small text-ink-muted mt-3 whitespace-pre-line">
                            {userReview.comment?.trim() ||
                                'You did not add a written comment.'}
                        </p>

                        <p className="text-caption text-ink-subtle mt-3">
                            Updated{' '}
                            {formatStorefrontDate(userReview.updated_at)}
                        </p>

                        <div className="border-line mt-4 flex flex-wrap gap-2 border-t pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingReview(true)}
                            >
                                <Icon name="settings" size="sm" />
                                Edit review
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-danger-ink hover:bg-danger-soft hover:text-danger-ink"
                                onClick={() => setConfirmingReviewDelete(true)}
                            >
                                <Icon name="trash" size="sm" />
                                Delete
                            </Button>
                        </div>
                    </div>
                ) : userReview || canReview ? (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            submitReview();
                        }}
                        className="mt-4 space-y-4"
                    >
                        <Select
                            label="Rating"
                            value={reviewForm.data.rating}
                            onChange={(event) =>
                                reviewForm.setData(
                                    'rating',
                                    Number(event.target.value),
                                )
                            }
                            error={reviewForm.errors.rating}
                        >
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <option key={rating} value={rating}>
                                    {rating} {rating === 1 ? 'star' : 'stars'}
                                    {rating === 5 ? ' — Excellent' : ''}
                                </option>
                            ))}
                        </Select>

                        <Textarea
                            label="Your review"
                            placeholder="What stood out? How was the quality?"
                            value={reviewForm.data.comment}
                            onChange={(event) =>
                                reviewForm.setData(
                                    'comment',
                                    event.target.value,
                                )
                            }
                            error={reviewForm.errors.comment}
                            hint="Optional, up to 2,000 characters."
                        />

                        <Button
                            type="submit"
                            fullWidth
                            loading={reviewForm.processing}
                        >
                            {userReview ? 'Save changes' : 'Post review'}
                        </Button>

                        {userReview && (
                            <Button
                                variant="outline"
                                fullWidth
                                onClick={cancelReviewEdit}
                            >
                                Cancel
                            </Button>
                        )}
                    </form>
                ) : (
                    <p className="text-small text-ink-muted mt-3">
                        You have already reviewed this product. Thanks for
                        sharing your thoughts.
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <>
            <Head title={product.name} />

            <PublicShell>
                <div className="ds-container py-8 lg:py-10">
                    <Breadcrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Shop', href: '/products' },
                            ...(product.category
                                ? [
                                      {
                                          label: product.category.name,
                                          href: `/categories/${product.category.slug}`,
                                      },
                                  ]
                                : []),
                            { label: product.name },
                        ]}
                    />
                </div>

                <section className="ds-container grid gap-10 pb-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:pb-16">
                    <div className="grid gap-4 sm:grid-cols-[5rem_1fr]">
                        {images.length > 1 && (
                            <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col">
                                {images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        type="button"
                                        onClick={() => setActiveImage(index)}
                                        aria-label={`View image ${index + 1} of ${product.name}`}
                                        aria-current={
                                            index === activeImage
                                                ? 'true'
                                                : undefined
                                        }
                                        className={cn(
                                            'rounded-control border-line bg-surface-muted aspect-square w-20 shrink-0 overflow-hidden border-2 transition-colors',
                                            index === activeImage
                                                ? 'border-brand'
                                                : 'hover:border-brand/40',
                                        )}
                                    >
                                        <img
                                            src={
                                                storageUrl(image.path) ??
                                                undefined
                                            }
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div
                            className={cn(
                                'bg-surface-muted rounded-panel border-line relative overflow-hidden border',
                                images.length > 1
                                    ? 'order-1 sm:order-2'
                                    : 'order-1 sm:col-span-2',
                            )}
                        >
                            <div className="aspect-square">
                                {selectedImage ? (
                                    <img
                                        src={
                                            storageUrl(selectedImage.path) ??
                                            undefined
                                        }
                                        alt={
                                            selectedImage.alt_text ??
                                            product.name
                                        }
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="text-brand/35 flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,var(--ds-brand-soft),var(--ds-surface-muted))]">
                                        <Icon name="package" size={96} />
                                    </div>
                                )}
                            </div>

                            {product.compare_at_price && (
                                <Badge
                                    variant="sale"
                                    className="absolute start-4 top-4"
                                >
                                    Sale
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            {product.category && (
                                <Link
                                    href={`/categories/${product.category.slug}`}
                                    className="text-caption text-brand hover:text-brand-ink font-semibold uppercase transition-colors"
                                >
                                    {product.category.name}
                                </Link>
                            )}
                            <StockStatus status={stockStatus} size="md" />
                        </div>

                        <h1 className="text-h1 text-ink mt-3">
                            {product.name}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-4">
                            {reviewCount > 0 ? (
                                <Rating
                                    value={averageRating}
                                    count={reviewCount}
                                    showValue
                                />
                            ) : (
                                <span className="text-small text-ink-muted">
                                    No reviews yet
                                </span>
                            )}

                            {product.sku && (
                                <span className="text-caption text-ink-subtle">
                                    SKU {product.sku}
                                </span>
                            )}
                        </div>

                        <div className="mt-5">
                            <Price
                                amount={product.price}
                                compareAtPrice={product.compare_at_price}
                                size="lg"
                            />
                        </div>

                        <p className="text-body text-ink-muted mt-5">
                            {product.description
                                ? product.description.length > 280
                                    ? `${product.description.slice(0, 280)}…`
                                    : product.description
                                : 'A considered addition to your everyday routine, made and shipped by an independent seller.'}
                        </p>

                        <div className="border-line mt-6 border-y py-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-brand-soft text-brand-ink flex size-10 items-center justify-center rounded-full">
                                    <Icon name="store" size="sm" />
                                </span>
                                <div>
                                    <p className="text-caption text-ink-subtle">
                                        Sold by
                                    </p>
                                    <p className="text-small text-ink font-semibold">
                                        {product.seller?.store_name ??
                                            'Independent seller'}
                                    </p>
                                </div>
                                <Badge
                                    variant="outline"
                                    size="sm"
                                    className="ms-auto"
                                >
                                    Marketplace seller
                                </Badge>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <QuantityStepper
                                    value={quantity}
                                    onChange={setQuantity}
                                    max={maxQuantity}
                                    disabled={isOutOfStock}
                                />

                                <Button
                                    size="lg"
                                    className="min-w-40 flex-1"
                                    loading={addingIds.has(product.id)}
                                    disabled={isOutOfStock}
                                    onClick={() => addToCart(card, quantity)}
                                >
                                    {!addingIds.has(product.id) && (
                                        <Icon name="shopping-bag" size="sm" />
                                    )}
                                    {isOutOfStock
                                        ? 'Out of stock'
                                        : 'Add to cart'}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 sm:flex-none"
                                    onClick={() => toggleWishlist(card)}
                                    aria-pressed={isWishlisted}
                                >
                                    <Icon
                                        name="heart"
                                        size="sm"
                                        filled={isWishlisted}
                                        className={cn(
                                            isWishlisted && 'text-danger',
                                        )}
                                    />
                                    <span className="hidden sm:inline">
                                        {isWishlisted ? 'Saved' : 'Save'}
                                    </span>
                                </Button>
                            </div>

                            <div className="text-caption text-ink-muted mt-4 flex flex-wrap gap-x-5 gap-y-2">
                                <span className="inline-flex items-center gap-1.5">
                                    <Icon name="truck" size="sm" />
                                    Tracked delivery
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Icon name="shield-check" size="sm" />
                                    Secure checkout
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Icon name="refresh" size="sm" />
                                    Easy returns
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-line bg-surface border-y">
                    <div className="ds-container py-10 lg:py-14">
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            items={[
                                {
                                    id: 'description',
                                    label: 'Description',
                                    content: (
                                        <div className="max-w-3xl">
                                            <p className="text-body text-ink-muted whitespace-pre-line">
                                                {product.description ||
                                                    'This product does not have a description yet.'}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    id: 'details',
                                    label: 'Details',
                                    content: (
                                        <dl className="grid max-w-2xl gap-x-8 gap-y-4 sm:grid-cols-2">
                                            <div>
                                                <dt className="text-caption text-ink-subtle">
                                                    SKU
                                                </dt>
                                                <dd className="text-small text-ink mt-1 font-medium">
                                                    {product.sku}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-caption text-ink-subtle">
                                                    Category
                                                </dt>
                                                <dd className="text-small text-ink mt-1 font-medium">
                                                    {product.category?.name ??
                                                        'Uncategorized'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-caption text-ink-subtle">
                                                    Seller
                                                </dt>
                                                <dd className="text-small text-ink mt-1 font-medium">
                                                    {product.seller
                                                        ?.store_name ??
                                                        'Independent seller'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-caption text-ink-subtle">
                                                    Availability
                                                </dt>
                                                <dd className="mt-1">
                                                    <StockStatus
                                                        status={stockStatus}
                                                    />
                                                </dd>
                                            </div>
                                        </dl>
                                    ),
                                },
                                {
                                    id: 'reviews',
                                    label: 'Reviews',
                                    count: reviewCount,
                                    content: reviewContent,
                                },
                            ]}
                        />
                    </div>
                </section>

                {relatedProducts.length > 0 && (
                    <section className="ds-container py-section">
                        <SectionHeading
                            eyebrow="You may also like"
                            title="More from the same corner."
                            action={
                                product.category ? (
                                    <Link
                                        href={`/categories/${product.category.slug}`}
                                        className={buttonStyles({
                                            variant: 'outline',
                                            size: 'sm',
                                        })}
                                    >
                                        More in {product.category.name}
                                    </Link>
                                ) : undefined
                            }
                        />

                        <ProductGrid
                            className="mt-8"
                            products={productGridData(relatedProducts)}
                            onAddToCart={addToCart}
                            onToggleWishlist={toggleWishlist}
                            wishlistedIds={wishlistedIds}
                            addingIds={addingIds}
                            emptyTitle="No related products"
                        />
                    </section>
                )}
            </PublicShell>

            <Modal
                open={confirmingReviewDelete}
                onClose={() => setConfirmingReviewDelete(false)}
                title="Delete your review?"
                description={product.name}
                size="sm"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmingReviewDelete(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            loading={deletingReview}
                            onClick={deleteReview}
                        >
                            Delete review
                        </Button>
                    </>
                }
            >
                <p className="text-small text-ink-muted">
                    Your rating and comment will be removed from this product.
                    You can write a new review afterwards.
                </p>
            </Modal>
        </>
    );
}
