<?php

namespace Tests\Feature\Seller;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_without_a_seller_profile_are_redirected_to_onboarding(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('seller.products.index'))
            ->assertRedirect(route('seller.onboarding.create'));
    }

    public function test_sellers_can_create_products(): void
    {
        $seller = Seller::factory()->create();

        $response = $this->actingAs($seller->user)->post(route('seller.products.store'), [
            'name' => 'Handmade Mug',
            'sku' => 'MUG-001',
            'price' => 19.99,
            'stock' => 12,
            'status' => ProductStatus::Active->value,
        ]);

        $product = Product::query()->sole();

        $response->assertRedirect(route('seller.products.show', $product));
        $this->assertSame($seller->id, $product->seller_id);
        $this->assertTrue($product->is_approved);
        $this->assertSame('handmade-mug', $product->slug);
    }

    public function test_sellers_cannot_update_another_sellers_product(): void
    {
        $owner = Seller::factory()->create();
        $other = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $owner->id]);

        $response = $this->actingAs($other->user)->patch(route('seller.products.update', $product), [
            'name' => 'Hijacked',
            'sku' => $product->sku,
            'price' => 5,
            'stock' => 1,
            'status' => ProductStatus::Active->value,
        ]);

        $response->assertForbidden();
        $this->assertSame($owner->id, $product->refresh()->seller_id);
    }

    public function test_seller_onboarding_creates_an_active_seller_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('seller.onboarding.store'), [
            'store_name' => 'Northwind Goods',
        ]);

        $response->assertRedirect(route('seller.dashboard'));
        $this->assertDatabaseHas('sellers', [
            'user_id' => $user->id,
            'store_name' => 'Northwind Goods',
            'slug' => 'northwind-goods',
        ]);
    }

    public function test_sellers_cannot_open_another_sellers_public_product_in_their_workspace(): void
    {
        $owner = Seller::factory()->create();
        $other = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $owner->id]);

        $this->actingAs($other->user)
            ->get(route('seller.products.show', $product))
            ->assertForbidden();
    }

    public function test_sellers_cannot_upload_images_to_another_sellers_product(): void
    {
        Storage::fake('public');

        $owner = Seller::factory()->create();
        $other = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $owner->id]);

        $this->actingAs($other->user)
            ->post(route('seller.products.images.store', $product), [
                'image' => $this->fakePng('hijacked.png'),
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('product_images', 0);
    }

    public function test_sellers_can_manage_images_on_their_own_product(): void
    {
        Storage::fake('public');

        $seller = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $seller->id]);

        $this->actingAs($seller->user)
            ->post(route('seller.products.images.store', $product), [
                'image' => $this->fakePng('first.png'),
            ])
            ->assertRedirect();

        $first = $product->images()->sole();

        Storage::disk('public')->assertExists($first->path);
        $this->assertTrue($first->is_primary);

        $this->actingAs($seller->user)
            ->post(route('seller.products.images.store', $product), [
                'image' => $this->fakePng('second.png'),
                'is_primary' => true,
            ])
            ->assertRedirect();

        $second = $product->images()->whereKeyNot($first->id)->sole();

        $this->assertFalse($first->refresh()->is_primary);
        $this->assertTrue($second->is_primary);
        Storage::disk('public')->assertExists($second->path);

        $this->actingAs($seller->user)
            ->delete(route('seller.products.images.destroy', [$product, $second]))
            ->assertRedirect();

        Storage::disk('public')->assertMissing($second->path);
        $this->assertDatabaseMissing('product_images', ['id' => $second->id]);
        $this->assertTrue($first->refresh()->is_primary);
    }

    public function test_existing_sellers_cannot_submit_onboarding_again(): void
    {
        $seller = Seller::factory()->create(['store_name' => 'Original Store']);

        $this->actingAs($seller->user)
            ->post(route('seller.onboarding.store'), [
                'store_name' => 'Replacement Store',
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('sellers', 1);
        $this->assertSame('Original Store', $seller->refresh()->store_name);
    }

    private function fakePng(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='),
        );
    }
}
