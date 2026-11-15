# Phase 3 QA Checklist

## Automated coverage completed

- Storefront public visibility, search, price filters, category hierarchy, sorting, and inactive category handling.
- Customer cart, wishlist, address, checkout, coupon allocation, order isolation, partial multi-seller cancellation (stock restore, amount due, coupon usage release, payment voiding), notifications, reviews, and account settings.
- Review ownership, editing, deletion, and product-page review state exposure.
- Seller onboarding, profile/logo updates, product CRUD, image ownership, order isolation and status transitions, explicit COD collection, dashboard/statistics isolation, and inactive-seller access.
- Authorization regressions for cross-user and cross-seller access, including direct HTTP IDOR attempts against seller products, images, orders, profile data, dashboard/statistics, and onboarding payloads.
- Full seller authorization audit documented in `docs/seller-authorization-audit.md`.

Last full run: `php artisan test --compact` - 108 passed, 657 assertions.

## Pending manual checks for the final comprehensive pass

- Sign in with a brand-new customer account and complete the public storefront, cart, checkout, order, notification, and review flows.
- Edit and delete your own product review from the product page; confirm the updated rating/comment, modal behavior, and return of the create form.
- Complete seller onboarding with a new account and confirm dashboard, products, and orders are usable immediately.
- Sign in as a pending or suspended seller and confirm only dashboard/overview tools are offered.
- Update seller order statuses through processing, shipped, delivered, and cancelled paths; confirm customer notifications, per-order COD collection, and payment state.
- Save seller profile details and upload/replace a logo through the browser.
- Read and delete notifications; verify unread counts update across the shared layout.
- Delete an account from settings and confirm logout and related-data behavior.
- Visually confirm partial multi-seller cancellation states, amount due, cancelled group styling, and COD collection controls when only some seller orders are cancelled.
- Final responsive sweep at desktop and mobile widths with no horizontal overflow.
- Final light/dark theme and RTL sweep across public, customer, and seller pages.
- Final browser console/network pass for runtime errors or failed API calls.
