<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\OrderPlaced;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customers_only_see_their_own_notifications(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $ownNotification = $this->createNotification($user);
        $this->createNotification($other);

        $this->actingAs($user)
            ->get(route('notifications.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('notifications/index')
                ->has('notifications.data', 1)
                ->where('notifications.data.0.id', $ownNotification->id));
    }

    public function test_customers_can_mark_their_notifications_as_read(): void
    {
        $user = User::factory()->create();
        $notification = $this->createNotification($user);
        $this->createNotification($user);

        $this->actingAs($user)
            ->patch(route('notifications.read', $notification))
            ->assertRedirect();

        $this->assertNotNull($notification->refresh()->read_at);

        $this->actingAs($user)
            ->post(route('notifications.read-all'))
            ->assertRedirect();

        $this->assertSame(0, $user->unreadNotifications()->count());
    }

    public function test_customers_cannot_modify_another_users_notifications(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $notification = $this->createNotification($owner);

        $this->actingAs($other)
            ->patch(route('notifications.read', $notification))
            ->assertNotFound();

        $this->actingAs($other)
            ->delete(route('notifications.destroy', $notification))
            ->assertNotFound();

        $this->assertNull($notification->refresh()->read_at);
    }

    public function test_customers_can_delete_their_own_notifications(): void
    {
        $user = User::factory()->create();
        $notification = $this->createNotification($user);

        $this->actingAs($user)
            ->delete(route('notifications.destroy', $notification))
            ->assertRedirect();

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    public function test_marking_all_notifications_as_read_does_not_affect_other_users(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->createNotification($user);
        $otherNotification = $this->createNotification($other);

        $this->actingAs($user)
            ->post(route('notifications.read-all'))
            ->assertRedirect();

        $this->assertSame(0, $user->unreadNotifications()->count());
        $this->assertNull($otherNotification->refresh()->read_at);
    }

    private function createNotification(User $user): DatabaseNotification
    {
        return $user->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => OrderPlaced::class,
            'data' => [],
            'read_at' => null,
        ]);
    }
}
