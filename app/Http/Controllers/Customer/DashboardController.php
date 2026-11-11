<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use App\Services\WishlistService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(
        Request $request,
        CartService $cartService,
        WishlistService $wishlistService,
    ): Response {
        $user = $request->user();

        $orders = $user->orders()
            ->with(['items', 'sellerOrders.seller'])
            ->latest()
            ->limit(5)
            ->get();

        $orderCounts = $user->orders()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $cart = $cartService->cartFor($user);
        $wishlist = $wishlistService->wishlistFor($user);

        return Inertia::render('dashboard', [
            'recentOrders' => $orders,
            'orderCounts' => $orderCounts,
            'cartItemCount' => (int) $cart->items()->sum('quantity'),
            'wishlistItemCount' => $wishlist->items()->count(),
            'addressCount' => $user->addresses()->count(),
            'unreadNotificationsCount' => $user->unreadNotifications()->count(),
        ]);
    }
}
