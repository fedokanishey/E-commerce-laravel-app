<?php

namespace App\Services;

use App\Enums\ProductStatus;
use App\Enums\SellerOrderStatus;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Seller;
use App\Models\SellerOrder;
use Illuminate\Support\Collection;

class SellerDashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function overview(Seller $seller): array
    {
        $products = Product::query()->where('seller_id', $seller->id);

        $productCounts = [
            'total' => (clone $products)->count(),
            'active' => (clone $products)->where('status', ProductStatus::Active)->count(),
            'draft' => (clone $products)->where('status', ProductStatus::Draft)->count(),
            'inactive' => (clone $products)->where('status', ProductStatus::Inactive)->count(),
            'pending_approval' => (clone $products)->where('is_approved', false)->count(),
            'out_of_stock' => (clone $products)->where('stock', 0)->count(),
        ];

        $sellerOrders = SellerOrder::query()->where('seller_id', $seller->id);

        $orderCounts = [
            'total' => (clone $sellerOrders)->count(),
            'pending' => (clone $sellerOrders)->where('status', SellerOrderStatus::Pending)->count(),
            'processing' => (clone $sellerOrders)->where('status', SellerOrderStatus::Processing)->count(),
            'shipped' => (clone $sellerOrders)->where('status', SellerOrderStatus::Shipped)->count(),
            'delivered' => (clone $sellerOrders)->where('status', SellerOrderStatus::Delivered)->count(),
            'cancelled' => (clone $sellerOrders)->where('status', SellerOrderStatus::Cancelled)->count(),
        ];

        $completedSales = (clone $sellerOrders)
            ->where('status', '!=', SellerOrderStatus::Cancelled);

        $revenue = [
            'total' => round((float) (clone $completedSales)->sum('total'), 2),
            'last_30_days' => round((float) (clone $completedSales)->where('created_at', '>=', now()->subDays(30))->sum('total'), 2),
        ];

        return [
            'productCounts' => $productCounts,
            'orderCounts' => $orderCounts,
            'revenue' => $revenue,
            'bestSellingProducts' => $this->bestSellingProducts($seller),
            'recentOrders' => $this->recentOrders($seller),
        ];
    }

    /**
     * @return Collection<int, OrderItem>
     */
    public function bestSellingProducts(Seller $seller, int $limit = 5): Collection
    {
        return OrderItem::query()
            ->where('seller_id', $seller->id)
            ->whereHas('sellerOrder', function ($query) {
                $query->where('status', '!=', SellerOrderStatus::Cancelled);
            })
            ->selectRaw('product_id, product_name, SUM(quantity) as sold_quantity, SUM(line_total) as sales_total')
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('sold_quantity')
            ->limit($limit)
            ->get();
    }

    /**
     * @return Collection<int, SellerOrder>
     */
    public function recentOrders(Seller $seller, int $limit = 10): Collection
    {
        return SellerOrder::query()
            ->where('seller_id', $seller->id)
            ->with(['order.user', 'items'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * @return array<string, mixed>
     */
    public function statistics(Seller $seller): array
    {
        $overview = $this->overview($seller);

        $dailySales = SellerOrder::query()
            ->where('seller_id', $seller->id)
            ->where('status', '!=', SellerOrderStatus::Cancelled)
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as sale_date, COUNT(*) as order_count, SUM(total) as total')
            ->groupBy('sale_date')
            ->orderBy('sale_date')
            ->get();

        return [
            ...$overview,
            'dailySales' => $dailySales,
        ];
    }
}
