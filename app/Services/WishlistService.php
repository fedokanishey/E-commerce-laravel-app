<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use Illuminate\Validation\ValidationException;

class WishlistService
{
    public function wishlistFor(User $user): Wishlist
    {
        return Wishlist::query()->firstOrCreate(['user_id' => $user->id]);
    }

    /**
     * @return bool True when the product was added, false when it was removed.
     */
    public function toggle(User $user, Product $product): bool
    {
        $wishlist = $this->wishlistFor($user);
        $item = $wishlist->items()->where('product_id', $product->id)->first();

        if ($item !== null) {
            $item->delete();

            return false;
        }

        if (! $product->isPubliclyVisible()) {
            throw ValidationException::withMessages([
                'product_id' => 'This product cannot be saved to a wishlist.',
            ]);
        }

        $wishlist->items()->create(['product_id' => $product->id]);

        return true;
    }

    public function removeItem(WishlistItem $item): void
    {
        $item->delete();
    }
}
