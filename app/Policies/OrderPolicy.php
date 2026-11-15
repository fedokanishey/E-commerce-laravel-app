<?php

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Enums\SellerOrderStatus;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id;
    }

    public function cancel(User $user, Order $order): bool
    {
        if ($user->id !== $order->user_id || $order->status === OrderStatus::Cancelled) {
            return false;
        }

        $activeStatuses = $order->sellerOrders()
            ->where('status', '!=', SellerOrderStatus::Cancelled)
            ->pluck('status');

        return $activeStatuses->isNotEmpty()
            && $activeStatuses->every(
                fn (SellerOrderStatus|string $status) => ($status instanceof SellerOrderStatus
                    ? $status
                    : SellerOrderStatus::from($status)) === SellerOrderStatus::Pending
            );
    }
}
