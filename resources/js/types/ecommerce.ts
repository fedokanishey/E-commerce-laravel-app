export type DecimalValue = number | string;

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

export type SellerStatus = 'pending' | 'active' | 'suspended';
export type ProductStatus = 'draft' | 'active' | 'inactive';
export type PaymentMethod = 'cod';
export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

export type SellerSummary = {
    id: number;
    user_id: number;
    store_name: string;
    slug: string;
    description: string | null;
    logo_path: string | null;
    status: SellerStatus;
    approved_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Seller = SellerSummary & {
    products?: Product[];
    seller_orders?: SellerOrder[];
};

export type ProductImage = {
    id: number;
    product_id: number;
    path: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
};

export type Category = {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    description: string | null;
    image_path: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    products_count?: number;
    children?: Category[];
    parent?: Category | null;
};

export type ProductReview = {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    comment: string | null;
    is_verified_purchase: boolean;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
    };
};

export type Product = {
    id: number;
    seller_id: number;
    category_id: number | null;
    name: string;
    slug: string;
    sku: string;
    description: string | null;
    price: string;
    compare_at_price: string | null;
    stock: number;
    status: ProductStatus;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    images?: ProductImage[];
    seller?: SellerSummary;
    category?: Category | null;
    reviews?: ProductReview[];
    reviews_avg_rating?: number | string | null;
    reviews_count?: number;
    order_items_count?: number;
};

export type FilterOption = {
    value: string;
    label: string;
};

export type ProductFilters = {
    q?: string | null;
    category?: string | null;
    min_price?: number | string | null;
    max_price?: number | string | null;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular' | null;
    per_page?: 12 | 24 | 48 | null;
};

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
};

export type SharedData = {
    name: string;
    auth: {
        user: AuthUser | null;
        seller: {
            id: number;
            store_name: string;
            slug: string;
            status: SellerStatus;
            logo_path: string | null;
        } | null;
    };
    cartItemCount: number;
    wishlistItemCount: number;
    wishlistProductIds: number[];
    unreadNotificationsCount: number;
    flash: {
        status: string | null;
        error: string | null;
    };
    [key: string]: unknown;
};

export type SellerOrder = {
    id: number;
    order_id: number;
    seller_id: number;
    status: OrderStatus;
    subtotal: string;
    discount_total: string;
    total: string;
    cod_collected_at: string | null;
    created_at: string;
    updated_at: string;
    order?: Order & {
        user?: AuthUser;
    };
    seller?: SellerSummary;
    items?: OrderItem[];
};

export type SellerProductCounts = {
    total: number;
    active: number;
    draft: number;
    inactive: number;
    pending_approval: number;
    out_of_stock: number;
};

export type SellerOrderCounts = {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
};

export type BestSellingProduct = {
    product_id: number | null;
    product_name: string;
    sold_quantity: number | string;
    sales_total: number | string;
};

export type SellerOverview = {
    productCounts: SellerProductCounts;
    orderCounts: SellerOrderCounts;
    revenue: {
        total: number;
        last_30_days: number;
    };
    bestSellingProducts: BestSellingProduct[];
    recentOrders: SellerOrder[];
};

export type DailySale = {
    sale_date: string;
    order_count: number | string;
    total: number | string;
};

export type SellerStatistics = SellerOverview & {
    dailySales: DailySale[];
};

export type OrderItem = {
    id: number;
    order_id: number;
    seller_order_id: number;
    product_id: number | null;
    seller_id: number | null;
    product_name: string;
    sku: string;
    unit_price: string;
    quantity: number;
    line_total: string;
    product?: Product;
};

export type Address = {
    id: number;
    user_id: number;
    label: string;
    recipient_name: string;
    phone: string;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
};

export type CartItem = {
    id: number;
    quantity: number;
    product: Product;
    unit_price: number;
    line_total: number;
    is_available: boolean;
};

export type WishlistItem = {
    id: number;
    wishlist_id: number;
    product_id: number;
    product: Product;
    created_at: string;
    updated_at: string;
};

export type Payment = {
    id: number;
    order_id: number;
    method: 'cod';
    status: 'pending' | 'paid' | 'failed' | 'refunded' | 'voided';
    amount: string;
    transaction_reference: string | null;
    paid_at: string | null;
};

export type Coupon = {
    id: number;
    code: string;
    type: 'fixed' | 'percentage';
    value: string;
    min_order_amount: string;
    max_discount_amount: string | null;
    starts_at: string | null;
    expires_at: string | null;
    usage_limit: number | null;
    per_user_limit: number;
    is_active: boolean;
};

export type Order = {
    id: number;
    user_id: number;
    number: string;
    status: OrderStatus;
    subtotal: string;
    discount_total: string;
    shipping_total: string;
    grand_total: string;
    coupon_id: number | null;
    shipping_recipient_name: string;
    shipping_phone: string;
    shipping_address_line_1: string;
    shipping_address_line_2: string | null;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    placed_at: string;
    cancelled_at: string | null;
    amount_due?: string;
    is_partially_cancelled?: boolean;
    created_at: string;
    updated_at: string;
    items?: OrderItem[];
    seller_orders?: SellerOrder[];
    payment?: Payment | null;
    coupon?: Coupon | null;
};

export type AccountNotification = {
    id: string;
    type: string;
    data: {
        type: string;
        message: string;
        order_id?: number;
        order_number?: string;
        seller_order_id?: number;
        status?: string;
        total?: string;
    };
    read_at: string | null;
    created_at: string;
};
