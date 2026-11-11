<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\SellerOrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\SellerOrder;
use App\Notifications\SellerOrderStatusUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class SellerOrderService
{
    public function updateStatus(SellerOrder $sellerOrder, SellerOrderStatus $status): SellerOrder
    {
        $sellerOrder = DB::transaction(function () use ($sellerOrder, $status) {
            $sellerOrder = SellerOrder::query()->whereKey($sellerOrder->id)->lockForUpdate()->firstOrFail();
            $order = Order::query()->whereKey($sellerOrder->order_id)->lockForUpdate()->firstOrFail();

            if ($order->status === OrderStatus::Cancelled) {
                throw ValidationException::withMessages([
                    'status' => 'This order has been cancelled.',
                ]);
            }

            try {
                $sellerOrder->status->transitionTo($status);
            } catch (InvalidArgumentException $exception) {
                throw ValidationException::withMessages([
                    'status' => $exception->getMessage(),
                ]);
            }

            if ($status === SellerOrderStatus::Cancelled) {
                foreach ($sellerOrder->items as $item) {
                    if ($item->product_id !== null) {
                        Product::query()
                            ->whereKey($item->product_id)
                            ->increment('stock', $item->quantity);
                    }
                }
            }

            $sellerOrder->update(['status' => $status]);

            $this->synchronizeOrder($order);

            return $sellerOrder->refresh();
        });

        $sellerOrder->load('order.user');
        $sellerOrder->order->user?->notify(new SellerOrderStatusUpdated($sellerOrder));

        return $sellerOrder;
    }

    private function synchronizeOrder(Order $order): void
    {
        $statuses = $order->sellerOrders()
            ->pluck('status')
            ->map(fn (SellerOrderStatus|string $status) => $status instanceof SellerOrderStatus
                ? $status
                : SellerOrderStatus::from($status));

        $activeStatuses = $statuses->reject(
            fn (SellerOrderStatus $status) => $status === SellerOrderStatus::Cancelled
        );

        $orderStatus = match (true) {
            $activeStatuses->isEmpty() => OrderStatus::Cancelled,
            $activeStatuses->every(fn (SellerOrderStatus $status) => $status === SellerOrderStatus::Delivered) => OrderStatus::Delivered,
            $activeStatuses->contains(fn (SellerOrderStatus $status) => $status === SellerOrderStatus::Pending) => OrderStatus::Pending,
            $activeStatuses->contains(fn (SellerOrderStatus $status) => $status === SellerOrderStatus::Processing) => OrderStatus::Processing,
            default => OrderStatus::Shipped,
        };

        $order->update([
            'status' => $orderStatus,
            'cancelled_at' => $orderStatus === OrderStatus::Cancelled ? now() : null,
        ]);

        if ($orderStatus === OrderStatus::Delivered) {
            $order->payment()->update([
                'status' => PaymentStatus::Paid,
                'paid_at' => now(),
            ]);
        }
    }
}
