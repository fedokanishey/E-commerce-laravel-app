<?php

namespace Tests\Feature;

use App\Enums\SellerOrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Seller;
use App\Models\SellerOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_users_can_review_products_once(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)->post(route('reviews.store', $product), [
            'rating' => 5,
            'comment' => 'Excellent quality.',
        ])->assertRedirect();

        $review = ProductReview::query()->sole();
        $this->assertFalse($review->is_verified_purchase);
        $this->assertSame('Excellent quality.', $review->comment);

        $this->actingAs($user)->post(route('reviews.store', $product), [
            'rating' => 4,
        ])->assertSessionHasErrors('rating');

        $this->assertDatabaseCount('product_reviews', 1);
    }

    public function test_reviews_from_verified_purchases_are_flagged(): void
    {
        $user = User::factory()->create();
        $seller = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $seller->id]);
        $order = Order::factory()->create(['user_id' => $user->id]);
        $sellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $seller->id,
            'status' => SellerOrderStatus::Delivered,
        ]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'seller_order_id' => $sellerOrder->id,
            'product_id' => $product->id,
            'seller_id' => $seller->id,
        ]);

        $this->actingAs($user)->post(route('reviews.store', $product), [
            'rating' => 4,
        ])->assertRedirect();

        $this->assertTrue(ProductReview::query()->sole()->is_verified_purchase);
    }

    public function test_users_cannot_delete_another_users_review(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $review = ProductReview::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($other)
            ->delete(route('reviews.destroy', $review))
            ->assertForbidden();
    }
}
