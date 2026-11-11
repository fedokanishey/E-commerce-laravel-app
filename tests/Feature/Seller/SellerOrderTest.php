<?php

namespace Tests\Feature\Seller;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\SellerOrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Seller;
use App\Models\SellerOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SellerOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_sellers_can_progress_their_orders_and_payment_is_captured_on_delivery(): void
    {
        $seller = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $seller->id, 'stock' => 5]);
        $order = Order::factory()->create();
        $order->payment()->create([
            'method' => 'cod',
            'status' => PaymentStatus::Pending,
            'amount' => 100,
        ]);
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

        $this->actingAs($seller->user)
            ->patch(route('seller.orders.status.update', $sellerOrder), [
                'status' => SellerOrderStatus::Processing->value,
            ])
            ->assertRedirect();

        $this->assertSame(SellerOrderStatus::Processing, $sellerOrder->refresh()->status);
        $this->assertSame(OrderStatus::Processing, $order->refresh()->status);

        $this->actingAs($seller->user)
            ->patch(route('seller.orders.status.update', $sellerOrder), [
                'status' => SellerOrderStatus::Delivered->value,
            ])
            ->assertSessionHasErrors('status');

        $this->actingAs($seller->user)
            ->patch(route('seller.orders.status.update', $sellerOrder), [
                'status' => SellerOrderStatus::Shipped->value,
            ]);

        $this->actingAs($seller->user)
            ->patch(route('seller.orders.status.update', $sellerOrder), [
                'status' => SellerOrderStatus::Delivered->value,
            ]);

        $this->assertSame(SellerOrderStatus::Delivered, $sellerOrder->refresh()->status);
        $this->assertSame(OrderStatus::Delivered, $order->refresh()->status);
        $this->assertSame(PaymentStatus::Paid, $order->payment->refresh()->status);
    }

    public function test_sellers_cannot_update_another_sellers_order(): void
    {
        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();
        $sellerOrder = SellerOrder::factory()->create(['seller_id' => $other->id]);

        $this->actingAs($seller->user)
            ->patch(route('seller.orders.status.update', $sellerOrder), [
                'status' => SellerOrderStatus::Processing->value,
            ])
            ->assertForbidden();
    }
}
