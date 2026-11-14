<?php

namespace Tests\Feature\Storefront;

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProductCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_lists_only_public_products(): void
    {
        Product::factory()->create(['name' => 'Visible product']);
        Product::factory()->draft()->create(['name' => 'Draft product']);
        Product::factory()->unapproved()->create(['name' => 'Unapproved product']);

        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->has('products', 1)
            ->where('products.0.name', 'Visible product'));
    }

    public function test_public_products_can_be_viewed(): void
    {
        $product = Product::factory()->create();

        $this->get(route('products.show', $product))->assertOk();
    }

    public function test_hidden_products_are_not_found(): void
    {
        $draft = Product::factory()->draft()->create();
        $unapproved = Product::factory()->unapproved()->create();

        $this->get(route('products.show', $draft))->assertNotFound();
        $this->get(route('products.show', $unapproved))->assertNotFound();
    }

    public function test_products_can_be_searched(): void
    {
        Product::factory()->create(['name' => 'Blue Running Shoes']);
        Product::factory()->create(['name' => 'Leather Wallet']);

        $response = $this->get(route('products.index', ['q' => 'running']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('products/index')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Blue Running Shoes'));
    }

    public function test_products_from_inactive_sellers_are_not_publicly_visible(): void
    {
        $suspendedSeller = Seller::factory()->suspended()->create();
        $suspendedProduct = Product::factory()->create([
            'seller_id' => $suspendedSeller->id,
            'name' => 'Suspended seller product',
        ]);
        Product::factory()->create(['name' => 'Active seller product']);

        $this->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('home')
                ->has('products', 1)
                ->where('products.0.name', 'Active seller product'));

        $this->get(route('products.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('products/index')
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Active seller product'));

        $this->get(route('products.show', $suspendedProduct))->assertNotFound();
    }

    public function test_products_can_be_filtered_by_price_and_sorted(): void
    {
        Product::factory()->create(['name' => 'Budget item', 'price' => 10]);
        Product::factory()->create(['name' => 'Mid item', 'price' => 50]);
        Product::factory()->create(['name' => 'Luxury item', 'price' => 100]);

        $this->get(route('products.index', [
            'min_price' => 20,
            'max_price' => 80,
            'sort' => 'price_desc',
        ]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('products/index')
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Mid item'));
    }

    public function test_category_filter_includes_child_category_products(): void
    {
        $parent = Category::factory()->create();
        $child = Category::factory()->create(['parent_id' => $parent->id]);
        $other = Category::factory()->create();
        Product::factory()->create([
            'name' => 'Child category item',
            'category_id' => $child->id,
        ]);
        Product::factory()->create([
            'name' => 'Unrelated item',
            'category_id' => $other->id,
        ]);

        $this->get(route('products.index', ['category' => $parent->slug]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('products/index')
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Child category item'));
    }

    public function test_inactive_categories_are_not_public(): void
    {
        $category = Category::factory()->inactive()->create();

        $this->get(route('categories.show', $category))->assertNotFound();
    }
}
