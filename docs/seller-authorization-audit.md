# Seller Authorization and IDOR Audit

Date: 2026-11-14

Scope: every seller route in `routes/web.php`, including product, image, order, profile, onboarding, dashboard, and statistics endpoints.

Result: no exploitable cross-seller IDOR was found. Existing policies, form requests, scoped queries, and auth-scoped writes were verified with two-seller HTTP tests. Three defense-in-depth changes were added:

- `Seller\ProductController::create()` now explicitly calls `Gate::authorize('create', Product::class)`.
- `Seller\ProductImageController::store()` now explicitly calls `Gate::authorize('update', $product)` in addition to `ProductImageRequest::authorize()`.
- `UpdateSellerProfileRequest::authorize()` now requires an active seller instead of only requiring a seller profile.

## Enforcement layers

1. `auth` middleware protects the entire seller route group.
2. `EnsureUserIsSeller` redirects users without a seller profile to onboarding and redirects pending/suspended sellers to their dashboard for every seller route except `seller.dashboard`.
3. Laravel policies and form-request authorization enforce ownership and active-seller status.
4. Queries and writes are scoped through the authenticated user:
   - `$request->user()->seller->products()`
   - `$request->user()->seller->sellerOrders()`
   - `$request->user()->seller`
   - `$request->user()->id` for onboarding
   - `where('seller_id', $seller->id)` inside `SellerDashboardService`
5. Nested image deletion verifies that the image belongs to the route product before deleting it.

## Route audit

| Method | URI | Authorization mechanism | Isolation evidence |
| --- | --- | --- | --- |
| GET | `/seller` | `auth`, `seller` middleware; dashboard data scoped to the authenticated seller | `SellerAuthorizationTest::test_seller_dashboard_only_contains_authenticated_sellers_metrics`; pending/suspended dashboard access tests |
| GET | `/seller/statistics` | `auth`, `seller` middleware; `SellerDashboardService` filters by authenticated seller ID | `SellerDashboardTest::test_sellers_only_see_metrics_for_their_own_store` |
| GET | `/seller/profile` | `auth`, `seller` middleware; response uses `$request->user()->seller` | `SellerAuthorizationTest::test_seller_profile_updates_only_the_authenticated_seller` |
| PATCH | `/seller/profile` | `auth`, `seller` middleware; active-seller check in `UpdateSellerProfileRequest`; only validated profile fields are updated on `$request->user()->seller` | `SellerProfileTest::test_sellers_can_update_their_store_profile`; `test_uploading_a_new_logo_replaces_the_previous_file`; `SellerAuthorizationTest::test_seller_profile_updates_only_the_authenticated_seller` |
| GET | `/seller/products` | `auth`, `seller` middleware; query starts from `$request->user()->seller->products()` | `SellerAuthorizationTest::test_seller_product_index_only_lists_authenticated_sellers_products` |
| GET | `/seller/products/create` | `auth`, `seller` middleware; `ProductPolicy::create` via explicit `Gate::authorize` | `SellerAuthorizationTest::test_owner_can_manage_their_product_and_view_their_order`; pending/suspended route-blocking tests |
| POST | `/seller/products` | `auth`, `seller` middleware; `StoreProductRequest::authorize()` calls `ProductPolicy::create`; product is created through `$request->user()->seller->products()` | `ProductManagementTest::test_sellers_can_create_products`; `SellerAuthorizationTest::test_product_writes_ignore_forged_seller_ids`; pending/suspended route-blocking tests |
| GET | `/seller/products/{product}` | `auth`, `seller` middleware; `ProductPolicy::viewSeller` ownership check | `ProductManagementTest::test_sellers_cannot_open_another_sellers_public_product_in_their_workspace`; `SellerAuthorizationTest::test_sellers_cannot_view_or_edit_another_sellers_product`; owner success in `test_owner_can_manage_their_product_and_view_their_order` |
| GET | `/seller/products/{product}/edit` | `auth`, `seller` middleware; `ProductPolicy::update` ownership and active-seller check | `SellerAuthorizationTest::test_sellers_cannot_view_or_edit_another_sellers_product`; owner success in `test_owner_can_manage_their_product_and_view_their_order` |
| PUT/PATCH | `/seller/products/{product}` | `auth`, `seller` middleware; `UpdateProductRequest::authorize()` and controller `Gate::authorize('update')`; validated fields only | `ProductManagementTest::test_sellers_cannot_update_another_sellers_product`; `SellerAuthorizationTest::test_sellers_cannot_update_or_delete_another_sellers_product`; `test_product_writes_ignore_forged_seller_ids`; owner success in `test_owner_can_manage_their_product_and_view_their_order` |
| DELETE | `/seller/products/{product}` | `auth`, `seller` middleware; `ProductPolicy::delete` ownership and active-seller check | `SellerAuthorizationTest::test_sellers_cannot_update_or_delete_another_sellers_product`; owner success in `test_owner_can_manage_their_product_and_view_their_order`; pending/suspended route-blocking tests |
| POST | `/seller/products/{product}/images` | `auth`, `seller` middleware; `ProductImageRequest::authorize()` and controller `Gate::authorize('update')`; route product is authoritative | `ProductManagementTest::test_sellers_cannot_upload_images_to_another_sellers_product`; `SellerAuthorizationTest::test_sellers_cannot_upload_replace_or_delete_another_sellers_product_images`; `test_image_upload_ignores_forged_product_id_payloads`; owner image management in `ProductManagementTest::test_sellers_can_manage_images_on_their_own_product` |
| DELETE | `/seller/products/{product}/images/{image}` | `auth`, `seller` middleware; `ProductPolicy::update`; `abort_unless($image->product_id === $product->id, 404)` | `SellerAuthorizationTest::test_sellers_cannot_upload_replace_or_delete_another_sellers_product_images`; `test_sellers_cannot_delete_an_image_through_another_owned_product`; owner image deletion in `ProductManagementTest::test_sellers_can_manage_images_on_their_own_product` |
| GET | `/seller/orders` | `auth`, `seller` middleware; query starts from `$request->user()->seller->sellerOrders()` | `SellerOrderTest::test_sellers_only_see_their_own_orders_in_the_index`; pending/suspended route-blocking tests |
| GET | `/seller/orders/{sellerOrder}` | `auth`, `seller` middleware; `SellerOrderPolicy::view` ownership check | `SellerOrderTest::test_sellers_cannot_view_another_sellers_order_detail`; `SellerAuthorizationTest::test_sellers_cannot_view_or_update_another_sellers_order`; owner success in `test_owner_can_manage_their_product_and_view_their_order` |
| PATCH | `/seller/orders/{sellerOrder}/status` | `auth`, `seller` middleware; `UpdateSellerOrderStatusRequest::authorize()` and controller `Gate::authorize('updateStatus')`; `SellerOrderPolicy::updateStatus` requires active seller and ownership | `SellerOrderTest::test_sellers_cannot_update_another_sellers_order`; `test_sellers_can_progress_their_orders_and_payment_is_captured_on_delivery`; `SellerAuthorizationTest::test_sellers_cannot_view_or_update_another_sellers_order`; `test_order_status_updates_ignore_forged_seller_ids`; pending/suspended route-blocking tests |
| GET | `/seller/onboarding` | `auth` only; redirects users who already have a seller profile to the dashboard | `SellerAuthorizationTest::test_onboarding_page_is_only_available_to_users_without_seller_profiles`; `ProductManagementTest::test_existing_sellers_cannot_submit_onboarding_again` |
| POST | `/seller/onboarding` | `auth` only; `StoreSellerProfileRequest::authorize()` requires no existing seller; seller is created for `$request->user()->id` | `ProductManagementTest::test_seller_onboarding_creates_an_active_seller_profile`; `test_existing_sellers_cannot_submit_onboarding_again`; `SellerAuthorizationTest::test_seller_onboarding_ignores_forged_user_and_status_payloads` |

## Related resources

- Product image viewing: there is no separate seller image-view route. Image metadata is returned only through authorized product `show` and `edit` responses. Product image binaries are stored on the public disk as public storefront assets.
- Store logo upload: handled by the authenticated seller's profile update route. The destination path uses `$seller->id`, and the payload cannot set `logo_path`, `seller_id`, `user_id`, `slug`, or `status`.
- Seller statistics and dashboard data: both use `SellerDashboardService`, which scopes products, seller orders, revenue, best sellers, recent orders, and daily sales by the authenticated seller ID.
- Nested resource references: image upload ignores a forged `product_id`; image deletion rejects a product/image pair that does not match; product creation/update ignore forged `seller_id`; order status updates ignore forged `seller_id`; onboarding ignores forged `user_id`, `status`, and `slug`.

## Expected response behavior

- Unauthenticated seller requests: `302` redirect to `route('login')`.
- Authenticated cross-seller resource access: `403 Forbidden` for product, image, order, and profile operations.
- Nested image/product mismatch: `404 Not Found` after ownership of the route product is confirmed.
- Pending or suspended seller operational requests: `302` redirect to `route('seller.dashboard')`; dashboard remains accessible.
- Successful owner operations: normal `200` page responses or redirects with the expected success flash.

## Verification

```bash
php artisan test --compact
# 98 passed, 565 assertions

vendor/bin/phpstan analyse --no-progress --memory-limit=512M
# 0 errors

vendor/bin/pint --dirty --format agent
# passed
```

The regression suite exercises two distinct seller accounts and direct HTTP requests for read, create, update, delete, nested-resource, payload-manipulation, unauthenticated, and inactive-seller cases. No frontend visibility or navigation logic is used as authorization evidence.
