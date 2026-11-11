<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AddressTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_first_address_becomes_the_default(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('addresses.store'), $this->payload())->assertRedirect();

        $this->assertDatabaseHas('addresses', [
            'user_id' => $user->id,
            'is_default' => true,
        ]);
    }

    public function test_choosing_a_new_default_unsets_the_previous_one(): void
    {
        $user = User::factory()->create();
        $first = Address::factory()->create(['user_id' => $user->id, 'is_default' => true]);

        $this->actingAs($user)->post(route('addresses.store'), [
            ...$this->payload(),
            'is_default' => true,
        ])->assertRedirect();

        $this->assertFalse($first->refresh()->is_default);
        $this->assertSame(1, $user->addresses()->where('is_default', true)->count());
    }

    public function test_users_cannot_modify_another_users_address(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($other)->get(route('addresses.edit', $address))->assertForbidden();
        $this->actingAs($other)->delete(route('addresses.destroy', $address))->assertForbidden();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(): array
    {
        return [
            'label' => 'Home',
            'recipient_name' => 'Jane Doe',
            'phone' => '+1 555 0100',
            'address_line_1' => '1 Main Street',
            'city' => 'Springfield',
            'state' => 'Illinois',
            'postal_code' => '62701',
            'country' => 'United States',
            'is_default' => false,
        ];
    }
}
