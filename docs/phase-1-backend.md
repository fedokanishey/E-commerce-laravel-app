# Phase 1 — Backend

Single-vendor-storefront-style marketplace backend built with Laravel 13, Inertia.js v3, React 19, TypeScript and Tailwind CSS 4. Phase 1 delivers the complete server-side domain: authentication, catalog, cart, wishlist, addresses, coupons, checkout, multi-seller order fulfilment, reviews, notifications and the seller dashboard.

## Stack and environment

| Concern         | Choice                                                   |
| --------------- | -------------------------------------------------------- |
| Runtime         | PHP 8.3                                                  |
| Framework       | Laravel 13.32                                            |
| Frontend bridge | Inertia.js v3 (`inertiajs/inertia-laravel`)              |
| Auth            | Session guard, `MustVerifyEmail`, database notifications |
| Database        | SQLite (`database/database.sqlite`)                      |
| Testing         | Pest 4 / PHPUnit, SQLite in-memory                       |
| Static analysis | Larastan (PHPStan level 7)                               |
| Formatting      | Laravel Pint                                             |

> **Database limitation.** This workspace has no MySQL server and no `pdo_mysql` extension, so SQLite is used. The schema avoids engine-specific SQL; the only MySQL-specific detail is that `lockForUpdate()` is a no-op on SQLite but remains in the code for MySQL/PostgreSQL deployments.

## Setup

```bash
composer install
npm install
php artisan migrate
php artisan db:seed
npm run dev          # or: composer run dev
```

Seeded demo data: `seller@example.com` / `password` (store "Demo Store"), two products and the coupons `WELCOME10` (10% off) and `SAVE5` ($5 off).

## Architecture

```
app/
  Enums/                 status & type enums (labels, allowed transitions)
  Http/
    Controllers/
      Auth/              registration, login, password reset, email verification
      Storefront/        home, product listing/detail, categories
      Customer/          dashboard, cart, wishlist, addresses, checkout, orders, reviews, notifications
      Seller/            onboarding, dashboard, profile, products, images, orders, statistics
      Settings/          profile and password management
    Middleware/          Inertia shared props, EnsureUserIsSeller
    Requests/            one Form Request per write operation
  Models/                Eloquent models with typed relation generics
  Policies/              Product, Order, SellerOrder, Address, ProductReview, Seller
  Services/              CartService, WishlistService, AddressService, CouponValidator,
                         CheckoutService, OrderCancellationService, SellerOrderService,
                         SellerDashboardService, ProductReviewService
  Notifications/         OrderPlaced, NewSellerOrder, OrderCancelled, SellerOrderStatusUpdated
routes/web.php           public → guest → auth → seller groups
```

Controllers stay thin: validation lives in Form Requests, business rules in services, authorization in policies and policies are enforced through `Gate`/`can`. All monetary values and stock changes are calculated server-side.

## Domain rules

- **Public catalog** = `status = active`, `is_approved = true` **and** the owning seller is active. Draft, inactive, unapproved, suspended-seller and out-of-stock products are hidden or blocked at checkout.
- **Seller onboarding** creates an `active` seller immediately so the seller journey works end-to-end. `pending` and `suspended` remain available to moderation. `EnsureUserIsSeller` lets non-active sellers reach the dashboard to see their status, and redirects their other `/seller/*` requests back to that dashboard.
- **Cart** is one per user, created lazily. Quantity is bounded by current stock; unavailable products are rejected with validation errors.
- **Wishlist** is one per user; toggling returns added/removed feedback and products can move directly into the cart.
- **Coupons** support fixed and percentage discounts, minimum order value, maximum discount cap, start/end window, total usage limit and per-user limit. Usage is recorded only after a successful checkout.
- **Checkout** runs in a single transaction: locks products, revalidates availability/stock/seller status, splits lines by seller into `seller_orders`, snapshots product and shipping data into `order_items`/`orders`, records coupon usage, decrements stock, clears the cart, creates a pending COD payment and notifies the buyer and every seller.
- **Order cancellation** is allowed only while the parent order and every seller order are still `pending`; stock is restored and all seller orders are cancelled atomically.
- **Seller fulfilment** follows `pending → processing → shipped → delivered` (cancellation allowed before shipment). The parent order is recomputed from its seller orders, and the COD payment flips to `paid` once every remaining seller order is delivered.
- **Reviews** require authentication and one review per user per product. `is_verified_purchase` is set when the user has a non-cancelled order item for the product.
- **Notifications** are stored in the database for in-app inbox use; no email delivery is required in Phase 1.

## Authorization matrix

| Resource                    | Rule                                                  |
| --------------------------- | ----------------------------------------------------- |
| Product edit/delete         | active seller who owns the product                    |
| Seller order view           | owning seller; status changes only for active sellers |
| Order view/cancel           | order owner; cancel only while fully pending          |
| Address edit/delete         | address owner                                         |
| Review edit/delete          | review author                                         |
| Seller profile              | seller owner                                          |
| Cart/wishlist item mutation | cart/wishlist owner                                   |

## Routes

Public: `/`, `/products`, `/products/{slug}`, `/categories`, `/categories/{slug}`.

Guest only: `/register`, `/login`, `/forgot-password`, `/reset-password/{token}`.

Authenticated: `/dashboard`, `/verify-email`, `/profile`, `/password`, `/cart`, `/wishlist`, `/addresses`, `/checkout`, `/orders`, `/notifications`, `/seller/onboarding`, plus review create/update/delete on `/products/{product}/reviews` and `/reviews/{review}`.

Seller (`auth` + `seller` middleware): `/seller` dashboard, `/seller/statistics`, `/seller/profile`, `/seller/products` CRUD + image upload/delete, `/seller/orders` and status transitions.

Rate limiters (defined in `AppServiceProvider`): login 5/min per email+IP, register 5/min per IP, password reset 5/min per email+IP, cart 60/min, checkout 10/min, reviews 20/hour, seller writes 60/min.

## Shared Inertia props

`auth.user`, `auth.seller`, `cartItemCount`, `wishlistItemCount`, `unreadNotificationsCount`, `flash.status`, `flash.error`, and the application name. Counts are lazy closures and are skipped for guests.

## Verification

```bash
php artisan test --compact   # 98 tests, 565 assertions — passing
vendor/bin/phpstan analyse   # Larastan level 7 — 0 errors
vendor/bin/pint --dirty      # clean
```

Covered flows: registration/login/logout, catalog visibility and search, cart stock limits and ownership, wishlist toggle/move-to-cart, first-address defaulting, coupon-aware multi-seller checkout, cancellation with stock restore and coupon usage release, seller onboarding and product ownership, seller status transitions with COD capture, verified-purchase reviews, review editing/deletion, and profile/password settings.

Seeders were executed successfully against the local SQLite database.

## Known limitations and next phases

- Phase 3 pages are implemented, including customer review editing and deletion. Final browser-based QA is tracked in `docs/phase-3-qa-checklist.md`.
- Product image uploads use the `public` disk; run `php artisan storage:link` in any environment that serves them.
- No admin UI for approving products or moderating sellers in Phase 1; decisions are represented in the schema and console/DB.
- Coupon discounts are applied at order level only; seller payouts are not netted in Phase 1.
- Email verification is wired but app routes are not yet wrapped in the `verified` middleware; mail uses the `log` driver.
- Phase 2 (atomic component design system) and Phase 3 (pages and integration) are complete; final browser QA follows.
