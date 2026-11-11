<?php

namespace App\Http\Controllers\Seller;

use App\Enums\SellerOrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\UpdateSellerOrderStatusRequest;
use App\Models\SellerOrder;
use App\Services\SellerOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(SellerOrderStatus::class)],
        ]);

        $orders = $request->user()->seller
            ->sellerOrders()
            ->with(['order.user', 'items'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('seller/orders/index', [
            'orders' => $orders,
            'filters' => $filters,
            'statuses' => collect(SellerOrderStatus::cases())
                ->map(fn (SellerOrderStatus $status) => ['value' => $status->value, 'label' => $status->label()]),
        ]);
    }

    public function show(SellerOrder $sellerOrder): Response
    {
        Gate::authorize('view', $sellerOrder);

        $sellerOrder->load(['order.user', 'items.product.images', 'order.payment']);

        return Inertia::render('seller/orders/show', [
            'sellerOrder' => $sellerOrder,
            'allowedTransitions' => collect($sellerOrder->status->allowedTransitions())
                ->map(fn (SellerOrderStatus $status) => ['value' => $status->value, 'label' => $status->label()]),
        ]);
    }

    public function updateStatus(
        UpdateSellerOrderStatusRequest $request,
        SellerOrder $sellerOrder,
        SellerOrderService $sellerOrderService,
    ): RedirectResponse {
        Gate::authorize('updateStatus', $sellerOrder);

        $sellerOrderService->updateStatus(
            $sellerOrder,
            SellerOrderStatus::from((string) $request->input('status')),
        );

        return back()->with('status', 'seller-order-status-updated');
    }
}
