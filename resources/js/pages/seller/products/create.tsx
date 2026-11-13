import { Head } from '@inertiajs/react';
import { Icon } from '@/components/atoms/icon';
import SellerProductForm from '@/components/organisms/seller-product-form';
import { SellerShell } from '@/components/organisms/seller-shell';
import type { Category, ProductStatus } from '@/types/ecommerce';

type SellerProductCreateProps = {
    categories: Array<Pick<Category, 'id' | 'name' | 'parent_id'>>;
    statuses: Array<{
        value: ProductStatus;
        label: string;
    }>;
};

export default function SellerProductCreate({
    categories,
    statuses,
}: SellerProductCreateProps) {
    return (
        <>
            <Head title="New product" />

            <SellerShell
                title="New product"
                description="Add an item to your catalog and choose when it goes live."
                eyebrow="Catalog"
                action={
                    <span className="text-caption text-ink-muted flex items-center gap-1.5">
                        <Icon name="eye-off" size="sm" />
                        Drafts stay hidden from shoppers
                    </span>
                }
            >
                <SellerProductForm
                    categories={categories}
                    statuses={statuses}
                />
            </SellerShell>
        </>
    );
}
