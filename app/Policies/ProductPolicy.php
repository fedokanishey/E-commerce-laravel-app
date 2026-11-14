<?php

namespace App\Policies;

use App\Enums\SellerStatus;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->seller !== null;
    }

    public function view(User $user, Product $product): bool
    {
        if ($product->isPubliclyVisible()) {
            return true;
        }

        return $this->viewSeller($user, $product);
    }

    public function viewSeller(User $user, Product $product): bool
    {
        return $user->seller !== null && $user->seller->id === $product->seller_id;
    }

    public function create(User $user): bool
    {
        return $user->seller?->status === SellerStatus::Active;
    }

    public function update(User $user, Product $product): bool
    {
        return $user->seller?->status === SellerStatus::Active
            && $user->seller->id === $product->seller_id;
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->update($user, $product);
    }

    public function restore(User $user, Product $product): bool
    {
        return false;
    }

    public function forceDelete(User $user, Product $product): bool
    {
        return false;
    }
}
