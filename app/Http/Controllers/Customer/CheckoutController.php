<?php

namespace App\Http\Controllers\Customer;

use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CheckoutRequest;
use App\Services\CartService;
use App\Services\CheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function create(Request $request, CartService $cartService): Response|RedirectResponse
    {
        $cart = $cartService->cartFor($request->user());
        $cart->load(['items.product.images', 'items.product.seller']);

        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $subtotal = $cart->items->sum(
            fn ($item) => (float) $item->product->price * $item->quantity
        );

        return Inertia::render('checkout/index', [
            'items' => $cart->items,
            'addresses' => $request->user()->addresses()->latest('is_default')->latest('id')->get(),
            'summary' => [
                'subtotal' => round((float) $subtotal, 2),
                'shipping' => 0,
                'total' => round((float) $subtotal, 2),
            ],
            'paymentMethods' => [
                ['value' => PaymentMethod::CashOnDelivery->value, 'label' => PaymentMethod::CashOnDelivery->label()],
            ],
        ]);
    }

    public function store(
        CheckoutRequest $request,
        CheckoutService $checkoutService,
    ): RedirectResponse {
        $address = $request->user()->addresses()->findOrFail($request->integer('address_id'));
        $method = PaymentMethod::tryFrom((string) $request->input('payment_method', PaymentMethod::CashOnDelivery->value))
            ?? PaymentMethod::CashOnDelivery;

        $order = $checkoutService->checkout(
            $request->user(),
            $address,
            $request->input('coupon_code'),
            $method,
        );

        return redirect()
            ->route('orders.show', $order)
            ->with('status', 'order-placed');
    }
}
