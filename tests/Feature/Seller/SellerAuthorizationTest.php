<?php

namespace Tests\Feature\Seller;

use App\Enums\ProductStatus;
use App\Enums\SellerOrderStatus;
use App\Enums\SellerStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Seller;
use App\Models\SellerOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SellerAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_product_index_only_lists_authenticated_sellers_products(): void
    {
        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();
        Product::factory()->count(2)->create(['seller_id' => $seller->id]);
        Product::factory()->create(['seller_id' => $other->id]);

        $this->actingAs($seller->user)
            ->get(route('seller.products.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('seller/products/index')
                ->has('products.data', 2)
                ->where('products.data', fn ($products) => collect($products)->every(
                    fn ($product) => $product['seller_id'] === $seller->id,
                )));
    }

    public function test_seller_dashboard_only_contains_authenticated_sellers_metrics(): void
    {
        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();
        Product::factory()->count(2)->create(['seller_id' => $seller->id]);
        Product::factory()->create(['seller_id' => $other->id]);
        SellerOrder::factory()->create(['seller_id' => $seller->id]);
        SellerOrder::factory()->count(2)->create(['seller_id' => $other->id]);

        $this->actingAs($seller->user)
            ->get(route('seller.dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('seller/dashboard')
                ->where('overview.productCounts.total', 2)
                ->where('overview.orderCounts.total', 1));
    }

    public function test_sellers_cannot_view_or_edit_another_sellers_product(): void
    {
        $owner = Seller::factory()->create();
        $other = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $owner->id]);

        $this->actingAs($other->user)
            ->get(route('seller.products.show', $product))
            ->assertForbidden();

        $this->actingAs($other->user)
            ->get(route('seller.products.edit', $product))
            ->assertForbidden();
    }

    public function test_sellers_cannot_update_or_delete_another_sellers_product(): void
    {
        $owner = Seller::factory()->create();
        $other = Seller::factory()->create();
        $product = Product::factory()->create([
            'seller_id' => $owner->id,
            'name' => 'Original name',
        ]);

        $this->actingAs($other->user)
            ->put(route('seller.products.update', $product), [
                'name' => 'Hijacked',
                'sku' => $product->sku,
                'price' => 5,
                'stock' => 1,
                'status' => ProductStatus::Active->value,
            ])
            ->assertForbidden();

        $product->refresh();

        $this->assertSame($owner->id, $product->seller_id);
        $this->assertSame('Original name', $product->name);

        $this->actingAs($other->user)
            ->delete(route('seller.products.destroy', $product))
            ->assertForbidden();

        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_product_writes_ignore_forged_seller_ids(): void
    {
        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();

        $this->actingAs($seller->user)
            ->post(route('seller.products.store'), [
                'seller_id' => $other->id,
                'name' => 'Forged Product',
                'sku' => 'FORGED-1',
                'price' => 10,
                'stock' => 3,
                'status' => ProductStatus::Active->value,
            ])
            ->assertRedirect();

        $product = Product::query()->where('sku', 'FORGED-1')->sole();

        $this->assertSame($seller->id, $product->seller_id);
        $this->assertNotSame($other->id, $product->seller_id);

        $this->actingAs($seller->user)
            ->patch(route('seller.products.update', $product), [
                'seller_id' => $other->id,
                'name' => 'Updated Product',
                'sku' => 'FORGED-1',
                'price' => 12,
                'stock' => 4,
                'status' => ProductStatus::Active->value,
            ])
            ->assertRedirect(route('seller.products.show', $product));

        $product->refresh();

        $this->assertSame($seller->id, $product->seller_id);
        $this->assertSame('Updated Product', $product->name);
    }

    public function test_onboarding_page_is_only_available_to_users_without_seller_profiles(): void
    {
        $user = User::factory()->create();
        $seller = Seller::factory()->create();

        $this->actingAs($user)
            ->get(route('seller.onboarding.create'))
            ->assertOk();

        $this->actingAs($seller->user)
            ->get(route('seller.onboarding.create'))
            ->assertRedirect(route('seller.dashboard'));
    }

    public function test_seller_onboarding_ignores_forged_user_and_status_payloads(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($user)
            ->post(route('seller.onboarding.store'), [
                'user_id' => $other->id,
                'store_name' => 'Scoped Store',
                'status' => SellerStatus::Suspended->value,
                'slug' => 'hijacked',
            ])
            ->assertRedirect(route('seller.dashboard'));

        $seller = Seller::query()->where('user_id', $user->id)->sole();

        $this->assertSame('Scoped Store', $seller->store_name);
        $this->assertSame('scoped-store', $seller->slug);
        $this->assertSame(SellerStatus::Active, $seller->status);
        $this->assertDatabaseMissing('sellers', ['user_id' => $other->id]);
    }

    public function test_sellers_cannot_upload_replace_or_delete_another_sellers_product_images(): void
    {
        Storage::fake('public');

        $owner = Seller::factory()->create();
        $other = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $owner->id]);

        $this->actingAs($other->user)
            ->post(route('seller.products.images.store', $product), [
                'image' => $this->fakePng('hijacked.png'),
                'is_primary' => true,
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('product_images', 0);

        $image = ProductImage::factory()->create([
            'product_id' => $product->id,
            'path' => 'products/'.$product->id.'/owned.png',
        ]);
        Storage::disk('public')->put($image->path, 'image');

        $this->actingAs($other->user)
            ->delete(route('seller.products.images.destroy', [$product, $image]))
            ->assertForbidden();

        $this->assertDatabaseHas('product_images', ['id' => $image->id]);
        Storage::disk('public')->assertExists($image->path);
    }

    public function test_sellers_cannot_delete_an_image_through_another_owned_product(): void
    {
        Storage::fake('public');

        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();
        $ownProduct = Product::factory()->create(['seller_id' => $seller->id]);
        $otherProduct = Product::factory()->create(['seller_id' => $other->id]);
        $otherImage = ProductImage::factory()->create([
            'product_id' => $otherProduct->id,
            'path' => 'products/'.$otherProduct->id.'/other.png',
        ]);
        Storage::disk('public')->put($otherImage->path, 'image');

        $this->actingAs($seller->user)
            ->delete(route('seller.products.images.destroy', [$ownProduct, $otherImage]))
            ->assertNotFound();

        $this->assertDatabaseHas('product_images', ['id' => $otherImage->id]);
        Storage::disk('public')->assertExists($otherImage->path);
    }

    public function test_image_upload_ignores_forged_product_id_payloads(): void
    {
        Storage::fake('public');

        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();
        $ownProduct = Product::factory()->create(['seller_id' => $seller->id]);
        $otherProduct = Product::factory()->create(['seller_id' => $other->id]);

        $this->actingAs($seller->user)
            ->post(route('seller.products.images.store', $ownProduct), [
                'image' => $this->fakePng('owned.png'),
                'product_id' => $otherProduct->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('product_images', [
            'product_id' => $ownProduct->id,
        ]);
        $this->assertDatabaseMissing('product_images', [
            'product_id' => $otherProduct->id,
        ]);
    }

    public function test_sellers_cannot_view_or_update_another_sellers_order(): void
    {
        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();
        $sellerOrder = SellerOrder::factory()->create([
            'seller_id' => $other->id,
            'status' => SellerOrderStatus::Pending,
        ]);

        $this->actingAs($seller->user)
            ->get(route('seller.orders.show', $sellerOrder))
            ->assertForbidden();

        $this->actingAs($seller->user)
            ->patch(route('seller.orders.status.update', $sellerOrder), [
                'status' => SellerOrderStatus::Processing->value,
            ])
            ->assertForbidden();

        $this->assertSame(SellerOrderStatus::Pending, $sellerOrder->refresh()->status);
    }

    public function test_order_status_updates_ignore_forged_seller_ids(): void
    {
        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();
        $order = Order::factory()->create();
        $sellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $seller->id,
            'status' => SellerOrderStatus::Pending,
        ]);

        $this->actingAs($seller->user)
            ->patch(route('seller.orders.status.update', $sellerOrder), [
                'seller_id' => $other->id,
                'status' => SellerOrderStatus::Processing->value,
            ])
            ->assertRedirect();

        $sellerOrder->refresh();

        $this->assertSame($seller->id, $sellerOrder->seller_id);
        $this->assertSame(SellerOrderStatus::Processing, $sellerOrder->status);
    }

    public function test_seller_profile_updates_only_the_authenticated_seller(): void
    {
        $seller = Seller::factory()->create([
            'store_name' => 'Seller A',
            'slug' => 'seller-a',
        ]);
        $other = Seller::factory()->create([
            'store_name' => 'Seller B',
            'slug' => 'seller-b',
        ]);

        $this->actingAs($seller->user)
            ->get(route('seller.profile.edit'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('seller/profile/edit')
                ->where('seller.id', $seller->id));

        $this->actingAs($seller->user)
            ->patch(route('seller.profile.update'), [
                'store_name' => 'Seller A Updated',
                'seller_id' => $other->id,
                'user_id' => $other->user_id,
                'status' => SellerStatus::Suspended->value,
                'slug' => 'hijacked',
                'logo_path' => 'sellers/'.$other->id.'/hijacked.png',
            ])
            ->assertRedirect(route('seller.profile.edit'));

        $seller->refresh();
        $other->refresh();

        $this->assertSame('Seller A Updated', $seller->store_name);
        $this->assertSame('seller-a', $seller->slug);
        $this->assertSame(SellerStatus::Active, $seller->status);
        $this->assertNull($seller->logo_path);
        $this->assertSame('Seller B', $other->store_name);
        $this->assertSame('seller-b', $other->slug);
        $this->assertSame(SellerStatus::Active, $other->status);
    }

    public function test_owner_can_manage_their_product_and_view_their_order(): void
    {
        Storage::fake('public');

        $seller = Seller::factory()->create();
        $product = Product::factory()->create([
            'seller_id' => $seller->id,
            'name' => 'Original name',
        ]);
        $image = ProductImage::factory()->create([
            'product_id' => $product->id,
            'path' => 'products/'.$product->id.'/owned.png',
        ]);
        Storage::disk('public')->put($image->path, 'image');

        $this->actingAs($seller->user)
            ->get(route('seller.products.create'))
            ->assertOk();

        $this->actingAs($seller->user)
            ->get(route('seller.products.show', $product))
            ->assertOk();

        $this->actingAs($seller->user)
            ->get(route('seller.products.edit', $product))
            ->assertOk();

        $this->actingAs($seller->user)
            ->patch(route('seller.products.update', $product), [
                'name' => 'Updated name',
                'sku' => $product->sku,
                'price' => $product->price,
                'stock' => $product->stock,
                'status' => $product->status->value,
            ])
            ->assertRedirect(route('seller.products.show', $product));

        $this->assertSame('Updated name', $product->refresh()->name);

        $order = Order::factory()->create();
        $sellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $seller->id,
        ]);

        $this->actingAs($seller->user)
            ->get(route('seller.orders.show', $sellerOrder))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('seller/orders/show')
                ->where('sellerOrder.id', $sellerOrder->id));

        $this->actingAs($seller->user)
            ->delete(route('seller.products.destroy', $product))
            ->assertRedirect(route('seller.products.index'));

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
        $this->assertDatabaseMissing('product_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing($image->path);
    }

    public function test_pending_sellers_are_blocked_from_operational_routes(): void
    {
        $this->assertInactiveSellerBlocked(SellerStatus::Pending);
    }

    public function test_suspended_sellers_are_blocked_from_operational_routes(): void
    {
        $this->assertInactiveSellerBlocked(SellerStatus::Suspended);
    }

    public function test_unauthenticated_seller_requests_redirect_to_login(): void
    {
        $product = Product::factory()->create();

        $this->get(route('seller.products.index'))->assertRedirect(route('login'));
        $this->get(route('seller.products.show', $product))->assertRedirect(route('login'));
        $this->post(route('seller.products.store'), [])->assertRedirect(route('login'));
        $this->patch(route('seller.profile.update'), [])->assertRedirect(route('login'));
    }

    private function assertInactiveSellerBlocked(SellerStatus $status): void
    {
        Storage::fake('public');

        $seller = Seller::factory()->create(['status' => $status]);
        $originalStoreName = $seller->store_name;
        $product = Product::factory()->create([
            'seller_id' => $seller->id,
            'name' => 'Original name',
        ]);
        $image = ProductImage::factory()->create([
            'product_id' => $product->id,
            'path' => 'products/'.$product->id.'/owned.png',
        ]);
        Storage::disk('public')->put($image->path, 'image');
        $order = Order::factory()->create();
        $sellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $seller->id,
            'status' => SellerOrderStatus::Pending,
        ]);

        $dashboard = route('seller.dashboard');
        $user = $seller->user;

        $this->actingAs($user)->get($dashboard)->assertOk();
        $this->actingAs($user)->get(route('seller.statistics'))->assertRedirect($dashboard);
        $this->actingAs($user)->get(route('seller.profile.edit'))->assertRedirect($dashboard);
        $this->actingAs($user)->patch(route('seller.profile.update'), [
            'store_name' => 'Blocked update',
        ])->assertRedirect($dashboard);
        $this->actingAs($user)->get(route('seller.products.index'))->assertRedirect($dashboard);
        $this->actingAs($user)->get(route('seller.products.create'))->assertRedirect($dashboard);
        $this->actingAs($user)->get(route('seller.products.show', $product))->assertRedirect($dashboard);
        $this->actingAs($user)->get(route('seller.products.edit', $product))->assertRedirect($dashboard);
        $this->actingAs($user)->post(route('seller.products.store'), [
            'name' => 'Blocked product',
            'sku' => 'BLOCKED-SKU',
            'price' => 10,
            'stock' => 1,
            'status' => ProductStatus::Active->value,
        ])->assertRedirect($dashboard);
        $this->actingAs($user)->patch(route('seller.products.update', $product), [
            'name' => 'Blocked update',
            'sku' => $product->sku,
            'price' => $product->price,
            'stock' => $product->stock,
            'status' => ProductStatus::Active->value,
        ])->assertRedirect($dashboard);
        $this->actingAs($user)->delete(route('seller.products.destroy', $product))->assertRedirect($dashboard);
        $this->actingAs($user)->post(route('seller.products.images.store', $product), [
            'image' => $this->fakePng('blocked.png'),
        ])->assertRedirect($dashboard);
        $this->actingAs($user)->delete(route('seller.products.images.destroy', [$product, $image]))->assertRedirect($dashboard);
        $this->actingAs($user)->get(route('seller.orders.index'))->assertRedirect($dashboard);
        $this->actingAs($user)->get(route('seller.orders.show', $sellerOrder))->assertRedirect($dashboard);
        $this->actingAs($user)->patch(route('seller.orders.status.update', $sellerOrder), [
            'status' => SellerOrderStatus::Processing->value,
        ])->assertRedirect($dashboard);

        $this->assertSame($originalStoreName, $seller->refresh()->store_name);
        $this->assertSame('Original name', $product->refresh()->name);
        $this->assertSame(SellerOrderStatus::Pending, $sellerOrder->refresh()->status);
        $this->assertDatabaseHas('products', ['id' => $product->id]);
        $this->assertDatabaseMissing('products', ['sku' => 'BLOCKED-SKU']);
        $this->assertDatabaseHas('product_images', ['id' => $image->id]);
        Storage::disk('public')->assertExists($image->path);
    }

    private function fakePng(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='),
        );
    }
}
