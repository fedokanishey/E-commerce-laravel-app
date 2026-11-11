<?php

namespace App\Http\Controllers\Customer;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderCancellationService;
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
            'status' => ['nullable', Rule::enum(OrderStatus::class)],
            'per_page' => ['nullable', 'integer', Rule::in([10, 20, 50])],
        ]);

        $orders = $request->user()
            ->orders()
            ->with(['items', 'sellerOrders.seller'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate((int) ($filters['per_page'] ?? 10))
            ->withQueryString();

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'filters' => $filters,
            'statuses' => collect(OrderStatus::cases())
                ->map(fn (OrderStatus $status) => ['value' => $status->value, 'label' => $status->label()]),
        ]);
    }

    public function show(Order $order): Response
    {
        Gate::authorize('view', $order);

        $order->load([
            'items.product.images',
            'sellerOrders.seller',
            'payment',
            'coupon',
        ]);

        return Inertia::render('orders/show', [
            'order' => $order,
            'canCancel' => Gate::allows('cancel', $order),
        ]);
    }

    public function cancel(Order $order, OrderCancellationService $cancellationService): RedirectResponse
    {
        Gate::authorize('cancel', $order);

        $cancellationService->cancel($order);

        return redirect()
            ->route('orders.show', $order)
            ->with('status', 'order-cancelled');
    }
}
