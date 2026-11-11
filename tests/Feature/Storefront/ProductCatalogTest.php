<?php

namespace Tests\Feature\Storefront;

use App\Models\Product;
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
}
