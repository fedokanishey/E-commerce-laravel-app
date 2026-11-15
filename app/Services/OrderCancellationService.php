<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\SellerOrderStatus;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\Product;
use App\Models\SellerOrder;
use App\Notifications\OrderCancelled;
use App\Notifications\SellerOrderCancelled;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderCancellationService
{
    public function __construct(private OrderTotalsService $orderTotals) {}

    public function cancel(Order $order): Order
    {
        [$order, $cancelledSellerOrders] = DB::transaction(function () use ($order) {
            $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            $sellerOrders = SellerOrder::query()
                ->where('order_id', $order->id)
                ->with('items')
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $order->setRelation('sellerOrders', $sellerOrders);

            if ($order->status === OrderStatus::Cancelled) {
                throw ValidationException::withMessages([
                    'order' => 'This order has already been cancelled.',
                ]);
            }

            $activeSellerOrders = $sellerOrders
                ->reject(fn (SellerOrder $sellerOrder) => $sellerOrder->status === SellerOrderStatus::Cancelled)
                ->values();

            if ($activeSellerOrders->isEmpty()) {
                throw ValidationException::withMessages([
                    'order' => 'This order has already been cancelled.',
                ]);
            }

            if ($activeSellerOrders->contains(
                fn (SellerOrder $sellerOrder) => $sellerOrder->status !== SellerOrderStatus::Pending
            )) {
                throw ValidationException::withMessages([
                    'order' => 'This order is already being processed by a seller.',
                ]);
            }

            foreach ($activeSellerOrders as $sellerOrder) {
                foreach ($sellerOrder->items as $item) {
                    if ($item->product_id !== null) {
                        Product::query()
                            ->whereKey($item->product_id)
                            ->increment('stock', $item->quantity);
                    }
                }

                $sellerOrder->update(['status' => SellerOrderStatus::Cancelled]);
            }

            $order->update([
                'status' => OrderStatus::Cancelled,
                'cancelled_at' => now(),
            ]);

            CouponUsage::query()->where('order_id', $order->id)->delete();

            $this->orderTotals->syncPayment($order, $sellerOrders);

            return [$order, $activeSellerOrders];
        });

        $order->load('user');
        $order->user->notify(new OrderCancelled($order));

        /** @var Collection<int, SellerOrder> $cancelledSellerOrders */
        foreach ($cancelledSellerOrders as $sellerOrder) {
            $sellerOrder->load('seller.user');
            $sellerOrder->seller->user?->notify(new SellerOrderCancelled($sellerOrder));
        }

        return $order;
    }
}
