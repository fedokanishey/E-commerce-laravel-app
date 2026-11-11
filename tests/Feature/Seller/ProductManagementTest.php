<?php

namespace Tests\Feature\Seller;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
