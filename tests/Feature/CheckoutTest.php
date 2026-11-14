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

    public function test_checkout_uses_catalog_prices_and_ignores_tampered_totals(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create(['price' => 30, 'stock' => 5]);
        $cart = Cart::factory()->create(['user_id' => $user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->actingAs($user)->post(route('checkout.store'), [
            'address_id' => $address->id,
            'price' => 1,
            'unit_price' => 1,
            'subtotal' => 2,
            'grand_total' => 2,
        ])->assertRedirect();

        $order = Order::query()->sole();

        $this->assertSame(60.0, (float) $order->subtotal);
        $this->assertSame(60.0, (float) $order->grand_total);
        $this->assertSame(60.0, (float) $order->payment()->sole()->amount);
    }

    public function test_checkout_rejects_an_address_owned_by_another_user(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $other->id]);
        $product = Product::factory()->create();
        $cart = Cart::factory()->create(['user_id' => $user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->actingAs($user)->post(route('checkout.store'), [
            'address_id' => $address->id,
        ])->assertNotFound();

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_rejects_unavailable_products(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->draft()->create(['stock' => 5]);
        $cart = Cart::factory()->create(['user_id' => $user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->actingAs($user)->post(route('checkout.store'), [
            'address_id' => $address->id,
        ])->assertSessionHasErrors('cart');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(5, $product->refresh()->stock);
    }

    public function test_checkout_rejects_quantities_above_available_stock(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create(['stock' => 1]);
        $cart = Cart::factory()->create(['user_id' => $user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->actingAs($user)->post(route('checkout.store'), [
            'address_id' => $address->id,
        ])->assertSessionHasErrors('cart');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(1, $product->refresh()->stock);
    }

    public function test_checkout_enforces_coupon_minimum_order_amount(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create(['price' => 100]);
        $cart = Cart::factory()->create(['user_id' => $user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);
        Coupon::factory()->create([
            'code' => 'MINIMUM',
            'min_order_amount' => 500,
        ]);

        $this->actingAs($user)->post(route('checkout.store'), [
            'address_id' => $address->id,
            'coupon_code' => 'MINIMUM',
        ])->assertSessionHasErrors('coupon_code');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_enforces_coupon_per_user_limit(): void
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
        $coupon = Coupon::factory()->create(['code' => 'ONCE', 'per_user_limit' => 1]);
        $coupon->usages()->create([
            'user_id' => $user->id,
            'order_id' => Order::factory()->create(['user_id' => $user->id])->id,
            'discount_amount' => 5,
        ]);

        $this->actingAs($user)->post(route('checkout.store'), [
            'address_id' => $address->id,
            'coupon_code' => 'ONCE',
        ])->assertSessionHasErrors('coupon_code');

        $this->assertDatabaseCount('orders', 1);
    }

    public function test_checkout_enforces_coupon_global_usage_limit(): void
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
        $coupon = Coupon::factory()->create(['code' => 'LIMITED', 'usage_limit' => 1]);
        $coupon->usages()->create([
            'user_id' => User::factory()->create()->id,
            'order_id' => Order::factory()->create()->id,
            'discount_amount' => 5,
        ]);

        $this->actingAs($user)->post(route('checkout.store'), [
            'address_id' => $address->id,
            'coupon_code' => 'LIMITED',
        ])->assertSessionHasErrors('coupon_code');

        $this->assertDatabaseCount('orders', 1);
    }

    public function test_checkout_caps_percentage_coupon_discounts(): void
    {
        $user = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create(['price' => 100]);
        $cart = Cart::factory()->create(['user_id' => $user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);
        Coupon::factory()->percentage(50)->create([
            'code' => 'HALF',
            'max_discount_amount' => 20,
        ]);

        $this->actingAs($user)->post(route('checkout.store'), [
            'address_id' => $address->id,
            'coupon_code' => 'HALF',
        ])->assertRedirect();

        $order = Order::query()->sole();

        $this->assertSame(20.0, (float) $order->discount_total);
        $this->assertSame(80.0, (float) $order->grand_total);
    }
}
