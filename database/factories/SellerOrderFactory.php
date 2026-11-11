<?php

namespace Database\Factories;

use App\Enums\SellerOrderStatus;
use App\Models\Order;
use App\Models\Seller;
use App\Models\SellerOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SellerOrder>
 */
class SellerOrderFactory extends Factory
{
    protected $model = SellerOrder::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 20, 500);

        return [
            'order_id' => Order::factory(),
            'seller_id' => Seller::factory(),
            'status' => SellerOrderStatus::Pending,
            'subtotal' => $subtotal,
            'discount_total' => 0,
            'total' => $subtotal,
        ];
    }
}
