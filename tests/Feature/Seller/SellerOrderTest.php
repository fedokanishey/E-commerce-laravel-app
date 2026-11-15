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
use App\Notifications\OrderCancelled;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SellerOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_sellers_can_progress_their_orders_and_payment_is_collected_after_delivery(): void
    {
        $seller = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $seller->id, 'stock' => 5]);
        $order = Order::factory()->create([
            'subtotal' => 100,
            'grand_total' => 100,
        ]);
        $order->payment()->create([
            'method' => 'cod',
            'status' => PaymentStatus::Pending,
            'amount' => 100,
        ]);
        $sellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $seller->id,
            'status' => SellerOrderStatus::Pending,
            'subtotal' => 100,
            'discount_total' => 0,
            'total' => 100,
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
        $this->assertSame(PaymentStatus::Pending, $order->payment->refresh()->status);
        $this->assertSame(100.0, (float) $order->payment->amount);
        $this->assertNull($sellerOrder->cod_collected_at);

        $this->actingAs($seller->user)
            ->post(route('seller.orders.cod-collection', $sellerOrder))
            ->assertRedirect();

        $this->assertNotNull($sellerOrder->refresh()->cod_collected_at);
        $this->assertSame(PaymentStatus::Paid, $order->payment->refresh()->status);
        $this->assertNotNull($order->payment->paid_at);
    }

    public function test_sellers_cannot_confirm_cash_collection_before_delivery(): void
    {
        $seller = Seller::factory()->create();
        $order = Order::factory()->create();
        $order->payment()->create([
            'method' => 'cod',
            'status' => PaymentStatus::Pending,
            'amount' => 100,
        ]);
        $sellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $seller->id,
            'status' => SellerOrderStatus::Shipped,
        ]);

        $this->actingAs($seller->user)
            ->post(route('seller.orders.cod-collection', $sellerOrder))
            ->assertSessionHasErrors('status');

        $this->assertNull($sellerOrder->refresh()->cod_collected_at);
        $this->assertSame(PaymentStatus::Pending, $order->payment->refresh()->status);
    }

    public function test_sellers_cannot_confirm_cash_collection_for_another_sellers_order(): void
    {
        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();
        $sellerOrder = SellerOrder::factory()->create([
            'seller_id' => $other->id,
            'status' => SellerOrderStatus::Delivered,
        ]);

        $this->actingAs($seller->user)
            ->post(route('seller.orders.cod-collection', $sellerOrder))
            ->assertForbidden();
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
        $order = Order::factory()->create([
            'subtotal' => 150,
            'grand_total' => 150,
        ]);
        $order->payment()->create([
            'method' => 'cod',
            'status' => PaymentStatus::Pending,
            'amount' => 150,
        ]);
        $cancelledSellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $seller->id,
            'subtotal' => 50,
            'discount_total' => 0,
            'total' => 50,
        ]);
        $activeSellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $other->id,
            'status' => SellerOrderStatus::Processing,
            'subtotal' => 100,
            'discount_total' => 0,
            'total' => 100,
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
        $this->assertSame(100.0, (float) $order->payment->amount);
    }

    public function test_cancelling_the_last_seller_order_releases_coupon_usage(): void
    {
        $seller = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $seller->id, 'stock' => 5]);
        $order = Order::factory()->create([
            'subtotal' => 100,
            'grand_total' => 100,
        ]);
        $order->payment()->create([
            'method' => 'cod',
            'status' => PaymentStatus::Pending,
            'amount' => 100,
        ]);
        $sellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $seller->id,
            'status' => SellerOrderStatus::Pending,
            'subtotal' => 100,
            'discount_total' => 0,
            'total' => 100,
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
        $this->assertSame(PaymentStatus::Voided, $order->payment->refresh()->status);
        $this->assertSame(0.0, (float) $order->payment->amount);
    }

    public function test_order_is_delivered_before_payment_and_paid_only_after_all_cash_is_collected(): void
    {
        $sellerA = Seller::factory()->create();
        $sellerB = Seller::factory()->create();
        $order = Order::factory()->create([
            'subtotal' => 100,
            'grand_total' => 100,
        ]);
        $order->payment()->create([
            'method' => 'cod',
            'status' => PaymentStatus::Pending,
            'amount' => 100,
        ]);
        $sellerOrderA = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $sellerA->id,
            'subtotal' => 60,
            'discount_total' => 0,
            'total' => 60,
        ]);
        $sellerOrderB = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $sellerB->id,
            'subtotal' => 40,
            'discount_total' => 0,
            'total' => 40,
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
        $this->assertSame(PaymentStatus::Pending, $order->payment->refresh()->status);
        $this->assertSame(100.0, (float) $order->payment->amount);

        $this->actingAs($sellerA->user)
            ->post(route('seller.orders.cod-collection', $sellerOrderA))
            ->assertRedirect();

        $this->assertSame(PaymentStatus::Pending, $order->payment->refresh()->status);

        $this->actingAs($sellerB->user)
            ->post(route('seller.orders.cod-collection', $sellerOrderB))
            ->assertRedirect();

        $this->assertSame(PaymentStatus::Paid, $order->payment->refresh()->status);
        $this->assertNotNull($sellerOrderA->refresh()->cod_collected_at);
        $this->assertNotNull($sellerOrderB->refresh()->cod_collected_at);
    }
}
