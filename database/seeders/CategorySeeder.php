<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Electronics' => ['Smartphones', 'Laptops', 'Audio'],
            'Fashion' => ['Men', 'Women', 'Accessories'],
            'Home & Living' => ['Furniture', 'Kitchen', 'Decor'],
            'Books' => [],
            'Sports & Outdoors' => [],
        ];

        foreach ($categories as $name => $children) {
            $parent = Category::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'is_active' => true],
            );

            foreach ($children as $child) {
                Category::query()->updateOrCreate(
                    ['slug' => Str::slug($child)],
                    ['name' => $child, 'parent_id' => $parent->id, 'is_active' => true],
                );
            }
        }
    }
}
