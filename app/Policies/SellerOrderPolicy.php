<?php

namespace App\Policies;

use App\Enums\SellerStatus;
use App\Models\SellerOrder;
use App\Models\User;

class SellerOrderPolicy
{
    public function view(User $user, SellerOrder $sellerOrder): bool
    {
        return $user->seller !== null
            && $user->seller->id === $sellerOrder->seller_id;
    }

    public function updateStatus(User $user, SellerOrder $sellerOrder): bool
    {
        return $user->seller?->status === SellerStatus::Active
            && $user->seller->id === $sellerOrder->seller_id;
    }

    public function confirmCashCollection(User $user, SellerOrder $sellerOrder): bool
    {
        return $this->updateStatus($user, $sellerOrder);
    }
}
