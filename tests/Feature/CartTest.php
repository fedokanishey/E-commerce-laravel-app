<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_add_products_to_the_cart(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 5]);

        $response = $this->actingAs($user)->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    public function test_cart_quantity_cannot_exceed_stock(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 3]);
        $cart = Cart::factory()->create(['user_id' => $user->id]);
        $item = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user)->patch(route('cart.items.update', $item), [
            'quantity' => 4,
        ]);

        $response->assertSessionHasErrors('quantity');
        $this->assertDatabaseHas('cart_items', ['id' => $item->id, 'quantity' => 2]);
    }

    public function test_users_can_remove_cart_items(): void
    {
        $user = User::factory()->create();
        $cart = Cart::factory()->create(['user_id' => $user->id]);
        $item = CartItem::factory()->create(['cart_id' => $cart->id]);

        $this->actingAs($user)
            ->delete(route('cart.items.destroy', $item))
            ->assertRedirect();

        $this->assertDatabaseMissing('cart_items', ['id' => $item->id]);
    }

    public function test_users_cannot_modify_another_users_cart_item(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $cart = Cart::factory()->create(['user_id' => $owner->id]);
        $item = CartItem::factory()->create(['cart_id' => $cart->id]);

        $this->actingAs($other)
            ->delete(route('cart.items.destroy', $item))
            ->assertNotFound();
    }

    public function test_wishlist_items_can_be_toggled_and_moved_to_the_cart(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 5]);

        $this->actingAs($user)
            ->post(route('wishlist.toggle', $product))
            ->assertRedirect();

        $this->assertDatabaseHas('wishlist_items', ['product_id' => $product->id]);

        $this->actingAs($user)
            ->post(route('wishlist.move-to-cart', $product))
            ->assertRedirect(route('cart.index'));

        $this->assertDatabaseMissing('wishlist_items', ['product_id' => $product->id]);
        $this->assertDatabaseHas('cart_items', ['product_id' => $product->id, 'quantity' => 1]);

        $this->actingAs($user)
            ->post(route('wishlist.toggle', $product))
            ->assertRedirect();
        $this->actingAs($user)
            ->post(route('wishlist.toggle', $product))
            ->assertRedirect();

        $this->assertDatabaseMissing('wishlist_items', ['product_id' => $product->id]);
    }
}
