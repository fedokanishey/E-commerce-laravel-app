# Database ERD

```mermaid
erDiagram
    USERS ||--o| SELLERS : "owns"
    USERS ||--o| CARTS : "has"
    USERS ||--o| WISHLISTS : "has"
    USERS ||--o{ ADDRESSES : "has"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ PRODUCT_REVIEWS : "writes"
    USERS ||--o{ COUPON_USAGES : "redeems"

    SELLERS ||--o{ PRODUCTS : "sells"
    SELLERS ||--o{ SELLER_ORDERS : "fulfils"
    SELLERS ||--o{ ORDER_ITEMS : "supplies"

    CATEGORIES ||--o{ CATEGORIES : "parent of"
    CATEGORIES ||--o{ PRODUCTS : "classifies"

    PRODUCTS ||--o{ PRODUCT_IMAGES : "has"
    PRODUCTS ||--o{ PRODUCT_REVIEWS : "receives"
    PRODUCTS ||--o{ CART_ITEMS : "added to"
    PRODUCTS ||--o{ WISHLIST_ITEMS : "saved in"
    PRODUCTS ||--o{ ORDER_ITEMS : "snapshot in"

    CARTS ||--o{ CART_ITEMS : "contains"
    WISHLISTS ||--o{ WISHLIST_ITEMS : "contains"

    ORDERS ||--o{ SELLER_ORDERS : "split into"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    ORDERS ||--o| PAYMENTS : "paid by"
    ORDERS ||--o{ COUPON_USAGES : "uses"

    SELLER_ORDERS ||--o{ ORDER_ITEMS : "groups"

    COUPONS ||--o{ COUPON_USAGES : "tracked by"

    USERS {
        bigint id PK
        string name
        string email UK
        timestamp email_verified_at
        string password
    }

    SELLERS {
        bigint id PK
        bigint user_id FK,UK
        string store_name
        string slug UK
        string status "pending|active|suspended"
        timestamp approved_at
    }

    CATEGORIES {
        bigint id PK
        bigint parent_id FK
        string name
        string slug UK
        boolean is_active
        int sort_order
    }

    PRODUCTS {
        bigint id PK
        bigint seller_id FK
        bigint category_id FK
        string name
        string slug UK
        string sku UK
        decimal price
        decimal compare_at_price
        int stock
        string status "draft|active|inactive"
        boolean is_approved
    }

    PRODUCT_IMAGES {
        bigint id PK
        bigint product_id FK
        string path
        string alt_text
        int sort_order
        boolean is_primary
    }

    CARTS {
        bigint id PK
        bigint user_id FK,UK
    }

    CART_ITEMS {
        bigint id PK
        bigint cart_id FK
        bigint product_id FK
        int quantity
    }

    WISHLISTS {
        bigint id PK
        bigint user_id FK,UK
    }

    WISHLIST_ITEMS {
        bigint id PK
        bigint wishlist_id FK
        bigint product_id FK
    }

    ADDRESSES {
        bigint id PK
        bigint user_id FK
        string label
        string recipient_name
        string phone
        string address_line_1
        string address_line_2
        string city
        string state
        string postal_code
        string country
        boolean is_default
    }

    COUPONS {
        bigint id PK
        string code UK
        string type "fixed|percentage"
        decimal value
        decimal min_order_amount
        decimal max_discount_amount
        timestamp starts_at
        timestamp expires_at
        int usage_limit
        int per_user_limit
        boolean is_active
    }

    COUPON_USAGES {
        bigint id PK
        bigint coupon_id FK
        bigint user_id FK
        bigint order_id FK
        decimal discount_amount
    }

    ORDERS {
        bigint id PK
        bigint user_id FK
        string number UK
        string status "pending|processing|shipped|delivered|cancelled"
        decimal subtotal
        decimal discount_total
        decimal shipping_total
        decimal grand_total
        bigint coupon_id FK
        string shipping_recipient_name
        string shipping_phone
        string shipping_address_line_1
        string shipping_address_line_2
        string shipping_city
        string shipping_state
        string shipping_postal_code
        string shipping_country
        timestamp placed_at
        timestamp cancelled_at
    }

    SELLER_ORDERS {
        bigint id PK
        bigint order_id FK
        bigint seller_id FK
        string status "pending|processing|shipped|delivered|cancelled"
        decimal subtotal
        decimal discount_total
        decimal total
    }

    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint seller_order_id FK
        bigint product_id FK
        bigint seller_id FK
        string product_name
        string sku
        decimal unit_price
        int quantity
        decimal line_total
    }

    PAYMENTS {
        bigint id PK
        bigint order_id FK,UK
        string method "cod"
        string status "pending|paid|failed|refunded"
        decimal amount
        string transaction_reference
        timestamp paid_at
    }

    PRODUCT_REVIEWS {
        bigint id PK
        bigint product_id FK
        bigint user_id FK
        int rating "1-5"
        text comment
        boolean is_verified_purchase
    }

    NOTIFICATIONS {
        string id PK
        string type
        string notifiable_type
        bigint notifiable_id
        text data
        timestamp read_at
    }
```

Notes:

- `order_items` and the `orders.shipping_*` columns are immutable snapshots captured at checkout; they survive later product or address edits.
- A single order fans out into one `seller_orders` row per seller, while `order_items` still belong to the parent order.
- `carts`, `wishlists`, and `sellers` are one-per-user (`user_id` unique).
- Laravel's `cache`, `jobs`, `sessions`, `password_reset_tokens`, and `notifications` tables back the framework infrastructure.
