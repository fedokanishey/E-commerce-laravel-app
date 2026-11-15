<?php

namespace Tests\Feature;

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
use App\Models\User;
use App\Notifications\OrderCancelled;
use App\Notifications\SellerOrderCancelled;
use App\Notifications\SellerOrderStatusUpdated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrderCancellationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customers_can_cancel_pending_orders_and_stock_is_restored(): void
    {
        $user = User::factory()->create();
        $seller = Seller::factory()->create();
        $product = Product::factory()->create(['seller_id' => $seller->id, 'stock' => 3]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
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
            'user_id' => $user->id,
            'order_id' => $order->id,
        ]);

        $this->actingAs($user)
            ->post(route('orders.cancel', $order))
            ->assertRedirect(route('orders.show', $order));

        $this->assertSame(OrderStatus::Cancelled, $order->refresh()->status);
        $this->assertSame(5, $product->refresh()->stock);
        $this->assertSame(SellerOrderStatus::Cancelled, $sellerOrder->refresh()->status);
        $this->assertDatabaseMissing('coupon_usages', ['order_id' => $order->id]);
        $this->assertSame(PaymentStatus::Voided, $order->payment->refresh()->status);
        $this->assertSame(0.0, (float) $order->payment->amount);
        $this->assertNull($order->payment->paid_at);
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

    public function test_customers_can_cancel_remaining_pending_seller_orders_after_a_partial_cancellation(): void
    {
        $user = User::factory()->create();
        $cancelledSeller = Seller::factory()->create();
        $activeSeller = Seller::factory()->create();
        $cancelledProduct = Product::factory()->create([
            'seller_id' => $cancelledSeller->id,
            'stock' => 3,
        ]);
        $activeProduct = Product::factory()->create([
            'seller_id' => $activeSeller->id,
            'stock' => 3,
        ]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'subtotal' => 150,
            'grand_total' => 150,
        ]);
        $order->payment()->create([
            'method' => 'cod',
            'status' => PaymentStatus::Pending,
            'amount' => 100,
        ]);
        $cancelledSellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $cancelledSeller->id,
            'status' => SellerOrderStatus::Cancelled,
            'subtotal' => 50,
            'discount_total' => 0,
            'total' => 50,
        ]);
        $activeSellerOrder = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $activeSeller->id,
            'status' => SellerOrderStatus::Pending,
            'subtotal' => 100,
            'discount_total' => 0,
            'total' => 100,
        ]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'seller_order_id' => $cancelledSellerOrder->id,
            'product_id' => $cancelledProduct->id,
            'seller_id' => $cancelledSeller->id,
            'quantity' => 2,
        ]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'seller_order_id' => $activeSellerOrder->id,
            'product_id' => $activeProduct->id,
            'seller_id' => $activeSeller->id,
            'quantity' => 2,
        ]);
        $coupon = Coupon::factory()->create();
        CouponUsage::factory()->create([
            'coupon_id' => $coupon->id,
            'user_id' => $user->id,
            'order_id' => $order->id,
        ]);

        $this->actingAs($user)
            ->post(route('orders.cancel', $order))
            ->assertRedirect(route('orders.show', $order));

        $this->assertSame(SellerOrderStatus::Cancelled, $activeSellerOrder->refresh()->status);
        $this->assertSame(SellerOrderStatus::Cancelled, $cancelledSellerOrder->refresh()->status);
        $this->assertSame(OrderStatus::Cancelled, $order->refresh()->status);
        $this->assertSame(5, $activeProduct->refresh()->stock);
        $this->assertSame(3, $cancelledProduct->refresh()->stock);
        $this->assertSame(PaymentStatus::Voided, $order->payment->refresh()->status);
        $this->assertSame(0.0, (float) $order->payment->amount);
        $this->assertDatabaseMissing('coupon_usages', ['order_id' => $order->id]);
    }

    public function test_customers_cannot_cancel_remaining_items_when_an_active_seller_order_is_processing(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id]);
        SellerOrder::factory()->create([
            'order_id' => $order->id,
            'status' => SellerOrderStatus::Cancelled,
        ]);
        SellerOrder::factory()->create([
            'order_id' => $order->id,
            'status' => SellerOrderStatus::Processing,
        ]);

        $this->actingAs($user)
            ->post(route('orders.cancel', $order))
            ->assertForbidden();
    }

    public function test_customer_order_page_exposes_amount_due_and_partial_cancellation_state(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'subtotal' => 150,
            'grand_total' => 150,
        ]);
        SellerOrder::factory()->create([
            'order_id' => $order->id,
            'status' => SellerOrderStatus::Cancelled,
            'subtotal' => 50,
            'discount_total' => 0,
            'total' => 50,
        ]);
        SellerOrder::factory()->create([
            'order_id' => $order->id,
            'status' => SellerOrderStatus::Pending,
            'subtotal' => 100,
            'discount_total' => 0,
            'total' => 100,
        ]);

        $this->actingAs($user)
            ->get(route('orders.show', $order))
            ->assertInertia(fn (Assert $page) => $page
                ->component('orders/show')
                ->where('amountDue', '100.00')
                ->where('isPartiallyCancelled', true)
                ->where('canCancel', true));
    }

    public function test_customer_full_cancellation_notifies_the_customer_and_every_affected_seller(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $sellerA = Seller::factory()->create();
        $sellerB = Seller::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id]);
        $sellerOrderA = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $sellerA->id,
            'status' => SellerOrderStatus::Pending,
        ]);
        $sellerOrderB = SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $sellerB->id,
            'status' => SellerOrderStatus::Pending,
        ]);

        $this->actingAs($user)
            ->post(route('orders.cancel', $order))
            ->assertRedirect(route('orders.show', $order));

        Notification::assertSentTo($user, OrderCancelled::class);
        Notification::assertSentTo($sellerA->user, SellerOrderCancelled::class);
        Notification::assertSentTo($sellerB->user, SellerOrderCancelled::class);
    }

    public function test_customer_cancelling_remaining_items_notifies_the_remaining_seller_and_the_customer(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $cancelledSeller = Seller::factory()->create();
        $activeSeller = Seller::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id]);
        SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $cancelledSeller->id,
            'status' => SellerOrderStatus::Cancelled,
        ]);
        SellerOrder::factory()->create([
            'order_id' => $order->id,
            'seller_id' => $activeSeller->id,
            'status' => SellerOrderStatus::Pending,
        ]);

        $this->actingAs($user)
            ->post(route('orders.cancel', $order))
            ->assertRedirect(route('orders.show', $order));

        Notification::assertSentTo($activeSeller->user, SellerOrderCancelled::class);
        Notification::assertNotSentTo($cancelledSeller->user, SellerOrderCancelled::class);
        Notification::assertSentTo($user, OrderCancelled::class);
        Notification::assertNotSentTo($user, SellerOrderStatusUpdated::class);
    }
}
