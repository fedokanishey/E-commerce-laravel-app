<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\SellerOrderStatus;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\Product;
use App\Models\SellerOrder;
use App\Notifications\OrderCancelled;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderCancellationService
{
    public function cancel(Order $order): Order
    {
        $order = DB::transaction(function () use ($order) {
            $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();
            $order->load('sellerOrders');

            if ($order->status !== OrderStatus::Pending) {
                throw ValidationException::withMessages([
                    'order' => 'This order can no longer be cancelled.',
                ]);
            }

            $blocked = $order->sellerOrders->contains(
                fn (SellerOrder $sellerOrder) => $sellerOrder->status !== SellerOrderStatus::Pending
            );

            if ($blocked) {
                throw ValidationException::withMessages([
                    'order' => 'This order is already being processed by a seller.',
                ]);
            }

            foreach ($order->items as $item) {
                if ($item->product_id !== null) {
                    Product::query()
                        ->whereKey($item->product_id)
                        ->increment('stock', $item->quantity);
                }
            }

            $order->sellerOrders()->update(['status' => SellerOrderStatus::Cancelled->value]);
            $order->update([
                'status' => OrderStatus::Cancelled,
                'cancelled_at' => now(),
            ]);

            CouponUsage::query()->where('order_id', $order->id)->delete();

            return $order;
        });

        $order->load('user');
        $order->user->notify(new OrderCancelled($order));

        return $order;
    }
}
