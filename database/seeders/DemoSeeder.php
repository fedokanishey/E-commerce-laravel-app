<?php

namespace Database\Seeders;

use App\Enums\CouponType;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $sellerUser = User::query()->firstOrCreate(
            ['email' => 'seller@example.com'],
            ['name' => 'Demo Seller', 'password' => Hash::make('password')],
        );

        $seller = Seller::query()->firstOrCreate(
            ['user_id' => $sellerUser->id],
            [
                'store_name' => 'Demo Store',
                'slug' => 'demo-store',
                'description' => 'A demo store used for local development.',
                'status' => 'active',
                'approved_at' => now(),
            ],
        );

        $category = Category::query()->where('slug', 'electronics')->first()
            ?? Category::query()->active()->first();

        Product::query()->firstOrCreate(
            ['sku' => 'DEMO-001'],
            [
                'seller_id' => $seller->id,
                'category_id' => $category?->id,
                'name' => 'Wireless Headphones',
                'slug' => 'wireless-headphones',
                'description' => 'Comfortable over-ear wireless headphones.',
                'price' => 99.99,
                'compare_at_price' => 129.99,
                'stock' => 25,
                'status' => ProductStatus::Active,
                'is_approved' => true,
            ],
        );

        Product::query()->firstOrCreate(
            ['sku' => 'DEMO-002'],
            [
                'seller_id' => $seller->id,
                'category_id' => $category?->id,
                'name' => 'Mechanical Keyboard',
                'slug' => 'mechanical-keyboard',
                'description' => 'A compact mechanical keyboard for developers.',
                'price' => 79.50,
                'compare_at_price' => null,
                'stock' => 40,
                'status' => ProductStatus::Active,
                'is_approved' => true,
            ],
        );

        Coupon::query()->firstOrCreate(
            ['code' => 'WELCOME10'],
            [
                'type' => CouponType::Percentage,
                'value' => 10,
                'min_order_amount' => 25,
                'max_discount_amount' => 50,
                'starts_at' => null,
                'expires_at' => now()->addYear(),
                'usage_limit' => null,
                'per_user_limit' => 1,
                'is_active' => true,
            ],
        );

        Coupon::query()->firstOrCreate(
            ['code' => 'SAVE5'],
            [
                'type' => CouponType::Fixed,
                'value' => 5,
                'min_order_amount' => 20,
                'max_discount_amount' => null,
                'starts_at' => null,
                'expires_at' => now()->addYear(),
                'usage_limit' => 100,
                'per_user_limit' => 2,
                'is_active' => true,
            ],
        );
    }
}
