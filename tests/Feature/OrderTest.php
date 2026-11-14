<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_customers_only_see_their_own_orders_in_the_index(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $ownOrder = Order::factory()->create(['user_id' => $user->id]);
        Order::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user)
            ->get(route('orders.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('orders/index')
                ->has('orders.data', 1)
                ->where('orders.data.0.id', $ownOrder->id));
    }

    public function test_customers_cannot_view_another_users_order(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($other)
            ->get(route('orders.show', $order))
            ->assertForbidden();
    }
}
