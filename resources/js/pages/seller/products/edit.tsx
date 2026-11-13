import { Head, Link } from '@inertiajs/react';
import { buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import SellerProductForm from '@/components/organisms/seller-product-form';
import { SellerShell } from '@/components/organisms/seller-shell';
import type { Category, Product, ProductStatus } from '@/types/ecommerce';

type SellerProductEditProps = {
    product: Product;
    categories: Array<Pick<Category, 'id' | 'name' | 'parent_id'>>;
    statuses: Array<{
        value: ProductStatus;
        label: string;
    }>;
};

export default function SellerProductEdit({
    product,
    categories,
    statuses,
}: SellerProductEditProps) {
    return (
        <>
            <Head title={`Edit ${product.name}`} />

            <SellerShell
                title={`Edit ${product.name}`}
                description="Update product information, pricing, and availability."
                eyebrow="Catalog"
                action={
                    <Link
                        href={`/seller/products/${product.id}`}
                        className={buttonStyles({
                            variant: 'outline',
                            size: 'sm',
                        })}
                    >
                        <Icon name="eye" size="sm" />
                        View product
                    </Link>
                }
            >
                <SellerProductForm
                    product={product}
                    categories={categories}
                    statuses={statuses}
                />
            </SellerShell>
        </>
    );
}
