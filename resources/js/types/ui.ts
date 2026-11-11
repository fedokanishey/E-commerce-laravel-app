export type ControlSize = 'sm' | 'md' | 'lg';

export type Tone =
    | 'neutral'
    | 'brand'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info';

export type StockStatusValue =
    | 'in-stock'
    | 'low-stock'
    | 'out-of-stock'
    | 'backorder';

export type NavItem = {
    label: string;
    href: string;
    active?: boolean;
    badge?: string | number;
};

export type UserSummary = {
    name: string;
    avatar?: string | null;
};

export type ProductCardData = {
    id: number | string;
    name: string;
    href: string;
    price: number | string;
    compareAtPrice?: number | string | null;
    currency?: string;
    imageUrl?: string | null;
    imageAlt?: string;
    rating?: number;
    reviewCount?: number;
    stockStatus?: StockStatusValue;
    badge?: string;
    sellerName?: string;
};

export type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
    className?: string;
};
