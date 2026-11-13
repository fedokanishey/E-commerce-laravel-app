import type { ProductStatus, SellerStatus } from '@/types/ecommerce';
import type { Tone } from '@/types/ui';

const productStatusTones: Record<ProductStatus, Tone> = {
    active: 'success',
    draft: 'neutral',
    inactive: 'warning',
};

const sellerStatusTones: Record<SellerStatus, Tone> = {
    active: 'success',
    pending: 'warning',
    suspended: 'danger',
};

const productStatusLabels: Record<ProductStatus, string> = {
    active: 'Active',
    draft: 'Draft',
    inactive: 'Inactive',
};

const sellerStatusLabels: Record<SellerStatus, string> = {
    active: 'Active',
    pending: 'Pending',
    suspended: 'Suspended',
};

export function productStatusTone(status: ProductStatus): Tone {
    return productStatusTones[status] ?? 'neutral';
}

export function productStatusLabel(status: ProductStatus): string {
    return productStatusLabels[status] ?? status;
}

export function sellerStatusTone(status: SellerStatus): Tone {
    return sellerStatusTones[status] ?? 'neutral';
}

export function sellerStatusLabel(status: SellerStatus): string {
    return sellerStatusLabels[status] ?? status;
}
