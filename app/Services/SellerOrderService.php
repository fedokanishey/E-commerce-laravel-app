<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\SellerOrderStatus;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\Product;
use App\Models\SellerOrder;
use App\Notifications\OrderCancelled;
use App\Notifications\SellerOrderStatusUpdated;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class SellerOrderService
{
    public function __construct(private OrderTotalsService $orderTotals) {}

    public function updateStatus(SellerOrder $sellerOrder, SellerOrderStatus $status): SellerOrder
    {
        $sellerOrder = DB::transaction(function () use ($sellerOrder, $status) {
            [$order, $sellerOrders] = $this->lockOrderAndSellerOrders($sellerOrder->order_id);
            $lockedSellerOrder = $this->findSellerOrder($sellerOrders, $sellerOrder->id);

            if ($order->status === OrderStatus::Cancelled) {
                throw ValidationException::withMessages([
                    'status' => 'This order has been cancelled.',
                ]);
            }

            try {
                $lockedSellerOrder->status->transitionTo($status);
            } catch (InvalidArgumentException $exception) {
                throw ValidationException::withMessages([
                    'status' => $exception->getMessage(),
                ]);
            }

            if ($status === SellerOrderStatus::Cancelled) {
                $lockedSellerOrder->load('items');

                foreach ($lockedSellerOrder->items as $item) {
                    if ($item->product_id !== null) {
                        Product::query()
                            ->whereKey($item->product_id)
                            ->increment('stock', $item->quantity);
                    }
                }
            }

            $lockedSellerOrder->update(['status' => $status]);

            $this->synchronizeOrder($order, $sellerOrders);

            return $lockedSellerOrder->refresh();
        });

        $sellerOrder->load('order.user');

        if ($status === SellerOrderStatus::Cancelled && $sellerOrder->order->status === OrderStatus::Cancelled) {
            $sellerOrder->order->user?->notify(new OrderCancelled($sellerOrder->order));
        } else {
            $sellerOrder->order->user?->notify(new SellerOrderStatusUpdated($sellerOrder));
        }

        return $sellerOrder;
    }

    public function confirmCashCollection(SellerOrder $sellerOrder): SellerOrder
    {
        return DB::transaction(function () use ($sellerOrder) {
            [$order, $sellerOrders] = $this->lockOrderAndSellerOrders($sellerOrder->order_id);
            $lockedSellerOrder = $this->findSellerOrder($sellerOrders, $sellerOrder->id);

            if ($order->status === OrderStatus::Cancelled) {
                throw ValidationException::withMessages([
                    'status' => 'This order has been cancelled.',
                ]);
            }

            if ($lockedSellerOrder->status !== SellerOrderStatus::Delivered) {
                throw ValidationException::withMessages([
                    'status' => 'Cash can only be collected after this seller order is delivered.',
                ]);
            }

            if ($lockedSellerOrder->cod_collected_at === null) {
                $lockedSellerOrder->update(['cod_collected_at' => now()]);
            }

            $this->synchronizeOrder($order, $sellerOrders);

            return $lockedSellerOrder->refresh();
        });
    }

    /**
     * @return array{0: Order, 1: Collection<int, SellerOrder>}
     */
    private function lockOrderAndSellerOrders(int $orderId): array
    {
        $order = Order::query()->whereKey($orderId)->lockForUpdate()->firstOrFail();

        $sellerOrders = SellerOrder::query()
            ->where('order_id', $order->id)
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        $order->setRelation('sellerOrders', $sellerOrders);

        return [$order, $sellerOrders];
    }

    /**
     * @param  Collection<int, SellerOrder>  $sellerOrders
     */
    private function findSellerOrder(Collection $sellerOrders, int $sellerOrderId): SellerOrder
    {
        $sellerOrder = $sellerOrders->first(
            fn (SellerOrder $candidate) => $candidate->id === $sellerOrderId
        );

        if ($sellerOrder === null) {
            throw (new ModelNotFoundException)->setModel(SellerOrder::class, [$sellerOrderId]);
        }

        return $sellerOrder;
    }

    /**
     * @param  Collection<int, SellerOrder>  $sellerOrders
     */
    private function synchronizeOrder(Order $order, Collection $sellerOrders): void
    {
        $activeStatuses = $sellerOrders
            ->reject(fn (SellerOrder $sellerOrder) => $sellerOrder->status === SellerOrderStatus::Cancelled)
            ->pluck('status')
            ->map(fn (SellerOrderStatus|string $status) => $status instanceof SellerOrderStatus
                ? $status
                : SellerOrderStatus::from($status));

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

        if ($orderStatus === OrderStatus::Cancelled) {
            CouponUsage::query()->where('order_id', $order->id)->delete();
        }

        $this->orderTotals->syncPayment($order, $sellerOrders);
    }
}
