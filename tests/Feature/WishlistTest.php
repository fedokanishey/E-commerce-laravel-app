<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_customers_can_toggle_products_in_their_wishlist(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)
            ->post(route('wishlist.toggle', $product))
            ->assertRedirect();

        $this->assertDatabaseHas('wishlist_items', [
            'wishlist_id' => Wishlist::query()->where('user_id', $user->id)->sole()->id,
            'product_id' => $product->id,
        ]);

        $this->actingAs($user)
            ->post(route('wishlist.toggle', $product))
            ->assertRedirect();

        $this->assertDatabaseMissing('wishlist_items', ['product_id' => $product->id]);
    }

    public function test_customers_cannot_save_unavailable_products(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->draft()->create();

        $this->actingAs($user)
            ->post(route('wishlist.toggle', $product))
            ->assertSessionHasErrors('product_id');

        $this->assertDatabaseCount('wishlist_items', 0);
    }

    public function test_customers_cannot_remove_items_from_another_users_wishlist(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $wishlist = Wishlist::factory()->create(['user_id' => $owner->id]);
        $item = WishlistItem::factory()->create(['wishlist_id' => $wishlist->id]);

        $this->actingAs($other)
            ->delete(route('wishlist.items.destroy', $item))
            ->assertNotFound();

        $this->assertDatabaseHas('wishlist_items', ['id' => $item->id]);
    }

    public function test_moving_a_wishlist_item_to_the_cart_removes_it_from_the_wishlist(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 3]);
        $wishlist = Wishlist::factory()->create(['user_id' => $user->id]);
        WishlistItem::factory()->create([
            'wishlist_id' => $wishlist->id,
            'product_id' => $product->id,
        ]);

        $this->actingAs($user)
            ->post(route('wishlist.move-to-cart', $product))
            ->assertRedirect(route('cart.index'));

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);
        $this->assertDatabaseMissing('wishlist_items', ['product_id' => $product->id]);
    }

    public function test_failed_cart_move_keeps_the_wishlist_item(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->outOfStock()->create();
        $wishlist = Wishlist::factory()->create(['user_id' => $user->id]);
        $item = WishlistItem::factory()->create([
            'wishlist_id' => $wishlist->id,
            'product_id' => $product->id,
        ]);

        $this->actingAs($user)
            ->post(route('wishlist.move-to-cart', $product))
            ->assertSessionHasErrors('product_id');

        $this->assertDatabaseHas('wishlist_items', ['id' => $item->id]);
        $this->assertDatabaseCount('cart_items', 0);
    }
}
