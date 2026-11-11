<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WishlistItem;
use App\Services\CartService;
use App\Services\WishlistService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request, WishlistService $wishlistService): Response
    {
        $wishlist = $wishlistService->wishlistFor($request->user());
        $wishlist->load(['items.product.images', 'items.product.seller']);

        return Inertia::render('wishlist/index', [
            'items' => $wishlist->items,
        ]);
    }

    public function toggle(
        Request $request,
        Product $product,
        WishlistService $wishlistService,
    ): RedirectResponse {
        $added = $wishlistService->toggle($request->user(), $product);

        return back()->with(
            'status',
            $added ? 'wishlist-item-added' : 'wishlist-item-removed',
        );
    }

    public function destroy(
        Request $request,
        WishlistItem $wishlistItem,
        WishlistService $wishlistService,
    ): RedirectResponse {
        abort_unless($wishlistItem->wishlist->user_id === $request->user()->id, 404);

        $wishlistService->removeItem($wishlistItem);

        return back()->with('status', 'wishlist-item-removed');
    }

    public function moveToCart(
        Request $request,
        Product $product,
        WishlistService $wishlistService,
        CartService $cartService,
    ): RedirectResponse {
        $cartService->addProduct($request->user(), $product, 1);

        $wishlist = $wishlistService->wishlistFor($request->user());
        $wishlist->items()->where('product_id', $product->id)->delete();

        return redirect()->route('cart.index')->with('status', 'product-moved-to-cart');
    }
}
