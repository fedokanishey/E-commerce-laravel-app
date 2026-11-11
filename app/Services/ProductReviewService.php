<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\SellerOrderStatus;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

class ProductReviewService
{
    public function hasPurchased(User $user, Product $product): bool
    {
        return OrderItem::query()
            ->where('product_id', $product->id)
            ->whereHas('order', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('status', '!=', OrderStatus::Cancelled);
            })
            ->whereHas('sellerOrder', function ($query) {
                $query->where('status', '!=', SellerOrderStatus::Cancelled);
            })
            ->exists();
    }
}
