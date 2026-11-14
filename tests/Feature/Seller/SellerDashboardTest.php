<?php

namespace Tests\Feature\Seller;

use App\Enums\SellerOrderStatus;
use App\Models\Product;
use App\Models\Seller;
use App\Models\SellerOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SellerDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_sellers_only_see_metrics_for_their_own_store(): void
    {
        $seller = Seller::factory()->create();
        $other = Seller::factory()->create();
        Product::factory()->count(2)->create(['seller_id' => $seller->id]);
        Product::factory()->create(['seller_id' => $other->id]);
        SellerOrder::factory()->create([
            'seller_id' => $seller->id,
            'status' => SellerOrderStatus::Processing,
            'total' => 75,
        ]);
        SellerOrder::factory()->create([
            'seller_id' => $other->id,
            'status' => SellerOrderStatus::Processing,
            'total' => 999,
        ]);

        $this->actingAs($seller->user)
            ->get(route('seller.statistics'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('seller/statistics')
                ->where('statistics.productCounts.total', 2)
                ->where('statistics.orderCounts.total', 1)
                ->where('statistics.revenue.total', 75));
    }

    public function test_pending_sellers_can_see_their_dashboard_status(): void
    {
        $seller = Seller::factory()->pending()->create();

        $this->actingAs($seller->user)
            ->get(route('seller.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('seller/dashboard'));
    }

    public function test_suspended_sellers_are_redirected_away_from_store_management(): void
    {
        $seller = Seller::factory()->suspended()->create();

        $this->actingAs($seller->user)
            ->get(route('seller.products.index'))
            ->assertRedirect(route('seller.dashboard'));
    }
}
