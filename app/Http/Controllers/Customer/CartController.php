<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\AddToCartRequest;
use App\Http\Requests\Customer\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(Request $request, CartService $cartService): Response
    {
        $cart = $cartService->cartFor($request->user());
        $cart->load(['items.product.images', 'items.product.seller']);

        $items = $cart->items->map(fn (CartItem $item) => [
            'id' => $item->id,
            'quantity' => $item->quantity,
            'product' => $item->product,
            'unit_price' => (float) $item->product->price,
            'line_total' => round((float) $item->product->price * $item->quantity, 2),
            'is_available' => $item->product->isPurchasable(),
        ]);

        return Inertia::render('cart/index', [
            'items' => $items,
            'summary' => [
                'item_count' => (int) $items->sum('quantity'),
                'subtotal' => round((float) $items->sum('line_total'), 2),
            ],
        ]);
    }

    public function store(AddToCartRequest $request, CartService $cartService): RedirectResponse
    {
        $product = Product::query()->publicCatalog()->findOrFail($request->integer('product_id'));

        $cartService->addProduct($request->user(), $product, $request->integer('quantity'));

        return back()->with('status', 'product-added-to-cart');
    }

    public function update(
        UpdateCartItemRequest $request,
        CartItem $cartItem,
        CartService $cartService,
    ): RedirectResponse {
        abort_unless($cartItem->cart->user_id === $request->user()->id, 404);

        $cartService->updateQuantity($cartItem, $request->integer('quantity'));

        return back()->with('status', 'cart-updated');
    }

    public function destroy(Request $request, CartItem $cartItem, CartService $cartService): RedirectResponse
    {
        abort_unless($cartItem->cart->user_id === $request->user()->id, 404);

        $cartService->removeItem($cartItem);

        return back()->with('status', 'cart-item-removed');
    }

    public function clear(Request $request, CartService $cartService): RedirectResponse
    {
        $cart = $cartService->cartFor($request->user());
        $cartService->clear($cart);

        return back()->with('status', 'cart-cleared');
    }
}
