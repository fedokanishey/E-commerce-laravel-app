<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\SellerOrderStatus;
use App\Enums\SellerStatus;
use App\Models\Address;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SellerOrder;
use App\Models\User;
use App\Notifications\NewSellerOrder;
use App\Notifications\OrderPlaced;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function __construct(private CouponValidator $couponValidator) {}

    public function checkout(
        User $user,
        Address $address,
        ?string $couponCode,
        PaymentMethod $method = PaymentMethod::CashOnDelivery,
    ): Order {
        $order = DB::transaction(function () use ($user, $address, $couponCode, $method) {
            $cart = $user->cart()->with('items')->first();

            if ($cart === null || $cart->items->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Your cart is empty.',
                ]);
            }

            $products = Product::query()
                ->with('seller')
                ->whereIn('id', $cart->items->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $lines = [];
            $subtotal = 0.0;

            foreach ($cart->items as $item) {
                $product = $products->get($item->product_id);

                if ($product === null || ! $product->isPurchasable()) {
                    throw ValidationException::withMessages([
                        'cart' => 'One of the products in your cart is no longer available.',
                    ]);
                }

                if ($product->seller->status !== SellerStatus::Active) {
                    throw ValidationException::withMessages([
                        'cart' => "{$product->name} is no longer sold by an active seller.",
                    ]);
                }

                if ($item->quantity < 1 || $item->quantity > $product->stock) {
                    throw ValidationException::withMessages([
                        'cart' => "Only {$product->stock} unit(s) of {$product->name} are available.",
                    ]);
                }

                $unitPrice = round((float) $product->price, 2);
                $lineTotal = round($unitPrice * $item->quantity, 2);
                $subtotal = round($subtotal + $lineTotal, 2);

                $lines[] = [
                    'product_id' => $product->id,
                    'seller_id' => $product->seller_id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'unit_price' => $unitPrice,
                    'quantity' => $item->quantity,
                    'line_total' => $lineTotal,
                ];
            }

            $coupon = $this->couponValidator->findForSubtotal($user, $couponCode, $subtotal);
            $discount = $coupon !== null
                ? $this->couponValidator->discountFor($coupon, $subtotal)
                : 0.0;
            $shipping = 0.0;
            $grandTotal = round(max(0, $subtotal - $discount) + $shipping, 2);

            $order = Order::query()->create([
                'user_id' => $user->id,
                'number' => 'ORD-'.Str::upper((string) Str::ulid()),
                'status' => OrderStatus::Pending,
                'subtotal' => $subtotal,
                'discount_total' => $discount,
                'shipping_total' => $shipping,
                'grand_total' => $grandTotal,
                'coupon_id' => $coupon?->id,
                'placed_at' => now(),
                ...$address->toShippingSnapshot(),
            ]);

            $order->payment()->create([
                'method' => $method,
                'status' => PaymentStatus::Pending,
                'amount' => $grandTotal,
            ]);

            $linesBySeller = collect($lines)->groupBy('seller_id');

            foreach ($linesBySeller as $sellerId => $sellerLines) {
                $sellerSubtotal = round((float) $sellerLines->sum('line_total'), 2);

                $sellerOrder = SellerOrder::query()->create([
                    'order_id' => $order->id,
                    'seller_id' => $sellerId,
                    'status' => SellerOrderStatus::Pending,
                    'subtotal' => $sellerSubtotal,
                    'discount_total' => 0,
                    'total' => $sellerSubtotal,
                ]);

                foreach ($sellerLines as $line) {
                    OrderItem::query()->create([
                        'order_id' => $order->id,
                        'seller_order_id' => $sellerOrder->id,
                        ...$line,
                    ]);
                }
            }

            if ($coupon !== null) {
                CouponUsage::query()->create([
                    'coupon_id' => $coupon->id,
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'discount_amount' => $discount,
                ]);
            }

            foreach ($lines as $line) {
                Product::query()
                    ->whereKey($line['product_id'])
                    ->decrement('stock', $line['quantity']);
            }

            $cart->items()->delete();

            return $order;
        });

        $order->load(['sellerOrders.seller.user', 'user']);

        $order->user->notify(new OrderPlaced($order));

        foreach ($order->sellerOrders as $sellerOrder) {
            $sellerOrder->seller->user?->notify(new NewSellerOrder($sellerOrder));
        }

        return $order;
    }
}
