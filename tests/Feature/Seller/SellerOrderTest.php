<?php

namespace Tests\Feature\Seller;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\SellerOrderStatus;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Seller;
use App\Models\SellerOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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

    public function test_sellers_only_see_their_own_orders_in_the_index(): void
    {
        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();
        $ownOrder = SellerOrder::factory()->create(['seller_id' => $seller->id]);
        SellerOrder::factory()->create(['seller_id' => $other->id]);

        $this->actingAs($seller->user)
            ->get(route('seller.orders.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('seller/orders/index')
                ->has('orders.data', 1)
                ->where('orders.data.0.id', $ownOrder->id));
    }

    public function test_sellers_cannot_view_another_sellers_order_detail(): void
    {
        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();
        $sellerOrder = SellerOrder::factory()->create(['seller_id' => $other->id]);

        $this->actingAs($seller->user)
            ->get(route('seller.orders.show', $sellerOrder))
            ->assertForbidden();
    }

    public function test_cancelling_one_seller_order_restores_only_their_stock_and_keeps_the_order_active(): void
    {
        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $seller->id, 'stock' => 5]);
        $order = Order::factory()->create();
        $order->payment()->create([
            'method' => 'cod',
            'status' => PaymentStatus::Pending,
            'amount' => 100,
        ]);
        $cancelledSellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $seller->id,
        ]);
        $activeSellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $other->id,
            'status' => SellerOrderStatus::Processing,
        ]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'seller_order_id' => $cancelledSellerOrder->id,
            'product_id' => $product->id,
            'seller_id' => $seller->id,
            'quantity' => 2,
        ]);

        $this->actingAs($seller->user)
            ->patch(route('seller.orders.status.update', $cancelledSellerOrder), [
                'status' => SellerOrderStatus::Cancelled->value,
            ])
            ->assertRedirect();

        $this->assertSame(SellerOrderStatus::Cancelled, $cancelledSellerOrder->refresh()->status);
        $this->assertSame(7, $product->refresh()->stock);
        $this->assertSame(SellerOrderStatus::Processing, $activeSellerOrder->refresh()->status);
        $this->assertSame(OrderStatus::Processing, $order->refresh()->status);
        $this->assertSame(PaymentStatus::Pending, $order->payment->refresh()->status);
    }

    public function test_cancelling_the_last_seller_order_releases_coupon_usage(): void
    {
        $seller = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $seller->id, 'stock' => 5]);
        $order = Order::factory()->create();
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
        $coupon = Coupon::factory()->create();
        CouponUsage::factory()->create([
            'coupon_id' => $coupon->id,
            'user_id' => $order->user_id,
            'order_id' => $order->id,
        ]);

        $this->actingAs($seller->user)
            ->patch(route('seller.orders.status.update', $sellerOrder), [
                'status' => SellerOrderStatus::Cancelled->value,
            ])
            ->assertRedirect();

        $this->assertSame(OrderStatus::Cancelled, $order->refresh()->status);
        $this->assertSame(7, $product->refresh()->stock);
        $this->assertDatabaseMissing('coupon_usages', ['order_id' => $order->id]);
    }

    public function test_order_is_delivered_and_paid_only_after_all_active_seller_orders_deliver(): void
    {
        $sellerA = Seller::factory()->create();
        $sellerB = Seller::factory()->create();
        $order = Order::factory()->create();
        $order->payment()->create([
            'method' => 'cod',
            'status' => PaymentStatus::Pending,
            'amount' => 100,
        ]);
        $sellerOrderA = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $sellerA->id,
        ]);
        $sellerOrderB = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $sellerB->id,
        ]);

        foreach ([SellerOrderStatus::Processing, SellerOrderStatus::Shipped, SellerOrderStatus::Delivered] as $status) {
            $this->actingAs($sellerA->user)
                ->patch(route('seller.orders.status.update', $sellerOrderA), [
                    'status' => $status->value,
                ])
                ->assertRedirect();
        }

        $this->assertSame(OrderStatus::Pending, $order->refresh()->status);
        $this->assertSame(PaymentStatus::Pending, $order->payment->refresh()->status);

        foreach ([SellerOrderStatus::Processing, SellerOrderStatus::Shipped, SellerOrderStatus::Delivered] as $status) {
            $this->actingAs($sellerB->user)
                ->patch(route('seller.orders.status.update', $sellerOrderB), [
                    'status' => $status->value,
                ])
                ->assertRedirect();
        }

        $this->assertSame(OrderStatus::Delivered, $order->refresh()->status);
        $this->assertSame(PaymentStatus::Paid, $order->payment->refresh()->status);
    }
}
