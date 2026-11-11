<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\SellerOrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Seller;
use App\Models\SellerOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderCancellationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customers_can_cancel_pending_orders_and_stock_is_restored(): void
    {
        $user = User::factory()->create();
        $seller = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $seller->id, 'stock' => 3]);
        $order = Order::factory()->create(['user_id' => $user->id]);
        $sellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $seller->id,
            'status' => SellerOrderStatus::Pending,
        ]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'seller_order_id' => $sellerOrder->id,
            'product_id' => $product->id,
            'seller_id' => $seller->id,
            'quantity' => 2,
        ]);

        $this->actingAs($user)
            ->post(route('orders.cancel', $order))
            ->assertRedirect(route('orders.show', $order));

        $this->assertSame(OrderStatus::Cancelled, $order->refresh()->status);
        $this->assertSame(5, $product->refresh()->stock);
        $this->assertSame(SellerOrderStatus::Cancelled, $sellerOrder->refresh()->status);
    }

    public function test_customers_cannot_cancel_orders_that_sellers_have_started(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id]);
        SellerOrder::factory()->create([
            'order_id' => $order->id,
            'status' => SellerOrderStatus::Processing,
        ]);

        $this->actingAs($user)
            ->post(route('orders.cancel', $order))
            ->assertForbidden();
    }

    public function test_customers_cannot_cancel_another_users_order(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($other)
            ->post(route('orders.cancel', $order))
            ->assertForbidden();
    }
}
