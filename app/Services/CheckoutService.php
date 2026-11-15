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
    public function __construct(
        private CouponValidator $couponValidator,
        private OrderTotalsService $orderTotals,
    ) {}

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
            $subtotalMinor = 0;

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

                $unitPriceMinor = $this->orderTotals->toMinorUnits($product->price);
                $lineTotalMinor = $unitPriceMinor * $item->quantity;
                $subtotalMinor += $lineTotalMinor;

                $lines[] = [
                    'product_id' => $product->id,
                    'seller_id' => $product->seller_id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'unit_price_minor' => $unitPriceMinor,
                    'quantity' => $item->quantity,
                    'line_total_minor' => $lineTotalMinor,
                ];
            }

            $coupon = $this->couponValidator->findForSubtotalMinor($user, $couponCode, $subtotalMinor);
            $discountMinor = $coupon !== null
                ? $this->couponValidator->discountForMinor($coupon, $subtotalMinor)
                : 0;
            $shippingMinor = 0;
            $grandTotalMinor = max(0, $subtotalMinor - $discountMinor) + $shippingMinor;

            $order = Order::query()->create([
                'user_id' => $user->id,
                'number' => 'ORD-'.Str::upper((string) Str::ulid()),
                'status' => OrderStatus::Pending,
                'subtotal' => $this->orderTotals->formatMinor($subtotalMinor),
                'discount_total' => $this->orderTotals->formatMinor($discountMinor),
                'shipping_total' => $this->orderTotals->formatMinor($shippingMinor),
                'grand_total' => $this->orderTotals->formatMinor($grandTotalMinor),
                'coupon_id' => $coupon?->id,
                'placed_at' => now(),
                ...$address->toShippingSnapshot(),
            ]);

            $order->payment()->create([
                'method' => $method,
                'status' => PaymentStatus::Pending,
                'amount' => $this->orderTotals->formatMinor($grandTotalMinor),
            ]);

            $linesBySeller = collect($lines)->groupBy('seller_id');

            $sellerSubtotalsMinor = $linesBySeller
                ->map(fn ($sellerLines) => (int) $sellerLines->sum('line_total_minor'))
                ->all();

            $allocatedDiscountsMinor = $this->orderTotals->allocateDiscount(
                $discountMinor,
                $sellerSubtotalsMinor,
            );

            foreach ($linesBySeller as $sellerId => $sellerLines) {
                $sellerSubtotalMinor = $sellerSubtotalsMinor[$sellerId];
                $sellerDiscountMinor = $allocatedDiscountsMinor[$sellerId];
                $sellerTotalMinor = $sellerSubtotalMinor - $sellerDiscountMinor;

                $sellerOrder = SellerOrder::query()->create([
                    'order_id' => $order->id,
                    'seller_id' => $sellerId,
                    'status' => SellerOrderStatus::Pending,
                    'subtotal' => $this->orderTotals->formatMinor($sellerSubtotalMinor),
                    'discount_total' => $this->orderTotals->formatMinor($sellerDiscountMinor),
                    'total' => $this->orderTotals->formatMinor($sellerTotalMinor),
                ]);

                foreach ($sellerLines as $line) {
                    OrderItem::query()->create([
                        'order_id' => $order->id,
                        'seller_order_id' => $sellerOrder->id,
                        'product_id' => $line['product_id'],
                        'seller_id' => $line['seller_id'],
                        'product_name' => $line['product_name'],
                        'sku' => $line['sku'],
                        'unit_price' => $this->orderTotals->formatMinor($line['unit_price_minor']),
                        'quantity' => $line['quantity'],
                        'line_total' => $this->orderTotals->formatMinor($line['line_total_minor']),
                    ]);
                }
            }

            if ($coupon !== null) {
                CouponUsage::query()->create([
                    'coupon_id' => $coupon->id,
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'discount_amount' => $this->orderTotals->formatMinor($discountMinor),
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
