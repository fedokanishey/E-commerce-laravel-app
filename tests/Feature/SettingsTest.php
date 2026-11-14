<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_update_their_profile(): void
    {
        $user = User::factory()->create(['email' => 'old@example.com']);

        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => 'New Name',
            'email' => 'new@example.com',
        ])->assertRedirect(route('profile.edit'));

        $user->refresh();
        $this->assertSame('New Name', $user->name);
        $this->assertSame('new@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_users_can_update_their_password(): void
    {
        $user = User::factory()->create(['password' => 'password']);

        $this->actingAs($user)->put(route('password.update'), [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertRedirect();

        $this->assertTrue(Hash::check('new-password', $user->refresh()->password));
    }

    public function test_profile_updates_require_a_unique_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);
        $user = User::factory()->create();

        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => 'New Name',
            'email' => 'taken@example.com',
        ])->assertSessionHasErrors('email');
    }

    public function test_users_cannot_delete_their_account_with_the_wrong_password(): void
    {
        $user = User::factory()->create(['password' => 'password']);

        $this->actingAs($user)
            ->delete(route('profile.destroy'), ['password' => 'wrong-password'])
            ->assertSessionHasErrors('password', null, 'userDeletion');

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_users_can_delete_their_account_and_are_logged_out(): void
    {
        $user = User::factory()->create(['password' => 'password']);

        $this->actingAs($user)
            ->delete(route('profile.destroy'), ['password' => 'password'])
            ->assertRedirect(route('home'));

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertGuest();
    }
}
