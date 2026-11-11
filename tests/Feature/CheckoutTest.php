<?php

namespace Tests\Feature;

use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;
use App\Notifications\NewSellerOrder;
use App\Notifications\OrderPlaced;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_creates_one_seller_order_per_seller_and_updates_stock(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $user->id]);
        $sellerA = Seller::factory()->create();
        $sellerB = Seller::factory()->create();
        $productA = Product::factory()->create([
            'seller_id' => $sellerA->id,
            'price' => 100,
            'stock' => 10,
        ]);
        $productB = Product::factory()->create([
            'seller_id' => $sellerB->id,
            'price' => 50,
            'stock' => 5,
        ]);

        $cart = Cart::factory()->create(['user_id' => $user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $productA->id,
            'quantity' => 2,
        ]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $productB->id,
            'quantity' => 1,
        ]);

        $coupon = Coupon::factory()->percentage(10)->create(['code' => 'SAVE10']);

        $response = $this->actingAs($user)->post(route('checkout.store'), [
            'address_id' => $address->id,
            'coupon_code' => 'SAVE10',
        ]);

        $order = Order::query()->sole();

        $response->assertRedirect(route('orders.show', $order));

        $this->assertSame(2, $order->sellerOrders()->count());
        $this->assertSame(2, $order->items()->count());
        $this->assertSame(250.0, (float) $order->subtotal);
        $this->assertSame(25.0, (float) $order->discount_total);
        $this->assertSame(225.0, (float) $order->grand_total);

        $this->assertSame(8, $productA->refresh()->stock);
        $this->assertSame(4, $productB->refresh()->stock);
        $this->assertSame(0, $cart->items()->count());
        $this->assertDatabaseHas('coupon_usages', [
            'coupon_id' => $coupon->id,
            'order_id' => $order->id,
        ]);

        $payment = $order->payment()->sole();
        $this->assertSame(PaymentStatus::Pending, $payment->status);
        $this->assertSame(225.0, (float) $payment->amount);

        Notification::assertSentTo($user, OrderPlaced::class);
        Notification::assertSentTo($sellerA->user, NewSellerOrder::class);
        Notification::assertSentTo($sellerB->user, NewSellerOrder::class);
    }

    public function test_checkout_rejects_expired_coupons(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create();
        $cart = Cart::factory()->create(['user_id' => $user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        Coupon::factory()->expired()->create(['code' => 'OLD']);

        $response = $this->actingAs($user)->post(route('checkout.store'), [
            'address_id' => $address->id,
            'coupon_code' => 'OLD',
        ]);

        $response->assertSessionHasErrors('coupon_code');
        $this->assertDatabaseCount('orders', 0);
    }
}
