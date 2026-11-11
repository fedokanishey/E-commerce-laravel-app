<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 20, 500);

        return [
            'user_id' => User::factory(),
            'number' => 'ORD-'.strtoupper(Str::random(12)),
            'status' => OrderStatus::Pending,
            'subtotal' => $subtotal,
            'discount_total' => 0,
            'shipping_total' => 0,
            'grand_total' => $subtotal,
            'coupon_id' => null,
            'shipping_recipient_name' => fake()->name(),
            'shipping_phone' => fake()->phoneNumber(),
            'shipping_address_line_1' => fake()->streetAddress(),
            'shipping_address_line_2' => null,
            'shipping_city' => fake()->city(),
            'shipping_state' => fake()->randomElement(['California', 'Texas', 'New York', 'Florida']),
            'shipping_postal_code' => fake()->postcode(),
            'shipping_country' => fake()->country(),
            'placed_at' => now(),
            'cancelled_at' => null,
        ];
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Cancelled,
            'cancelled_at' => now(),
        ]);
    }
}
