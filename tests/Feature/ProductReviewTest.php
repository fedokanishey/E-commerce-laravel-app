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
use Inertia\Testing\AssertableInertia as Assert;
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

    public function test_users_can_delete_their_own_reviews(): void
    {
        $user = User::factory()->create();
        $review = ProductReview::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->delete(route('reviews.destroy', $review))
            ->assertRedirect()
            ->assertSessionHas('status', 'review-deleted');

        $this->assertDatabaseMissing('product_reviews', ['id' => $review->id]);
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

    public function test_users_can_update_their_own_reviews(): void
    {
        $user = User::factory()->create();
        $review = ProductReview::factory()->create([
            'user_id' => $user->id,
            'rating' => 2,
        ]);

        $this->actingAs($user)
            ->patch(route('reviews.update', $review), [
                'rating' => 4,
                'comment' => 'Changed my mind.',
            ])
            ->assertRedirect();

        $review->refresh();

        $this->assertSame(4, $review->rating);
        $this->assertSame('Changed my mind.', $review->comment);
    }

    public function test_users_cannot_update_another_users_review(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $review = ProductReview::factory()->create(['user_id' => $owner->id, 'rating' => 2]);

        $this->actingAs($other)
            ->patch(route('reviews.update', $review), [
                'rating' => 5,
            ])
            ->assertForbidden();

        $this->assertSame(2, $review->refresh()->rating);
    }

    public function test_product_page_exposes_the_current_users_review_for_editing(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $review = ProductReview::factory()->create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'rating' => 4,
            'comment' => 'Solid quality.',
        ]);

        $this->actingAs($user)
            ->get(route('products.show', $product))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('products/show')
                ->where('canReview', false)
                ->where('userReview.id', $review->id)
                ->where('userReview.rating', 4)
                ->where('userReview.comment', 'Solid quality.'));
    }

    public function test_unavailable_products_cannot_receive_reviews(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->draft()->create();

        $this->actingAs($user)
            ->post(route('reviews.store', $product), [
                'rating' => 5,
            ])
            ->assertNotFound();

        $this->assertDatabaseCount('product_reviews', 0);
    }
}
