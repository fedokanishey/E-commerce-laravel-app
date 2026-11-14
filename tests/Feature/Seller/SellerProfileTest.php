<?php

namespace Tests\Feature\Seller;

use App\Models\Seller;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SellerProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_sellers_can_update_their_store_profile(): void
    {
        $seller = Seller::factory()->create(['store_name' => 'Old Store']);

        $this->actingAs($seller->user)
            ->patch(route('seller.profile.update'), [
                'store_name' => 'New Store',
                'description' => 'Updated description.',
            ])
            ->assertRedirect(route('seller.profile.edit'));

        $seller->refresh();

        $this->assertSame('New Store', $seller->store_name);
        $this->assertSame('Updated description.', $seller->description);
    }

    public function test_uploading_a_new_logo_replaces_the_previous_file(): void
    {
        Storage::fake('public');

        $seller = Seller::factory()->create(['logo_path' => 'sellers/1/old.png']);
        Storage::disk('public')->put('sellers/1/old.png', 'old');

        $this->actingAs($seller->user)
            ->patch(route('seller.profile.update'), [
                'store_name' => $seller->store_name,
                'logo' => $this->fakePng('new.png'),
            ])
            ->assertRedirect(route('seller.profile.edit'));

        $seller->refresh();

        Storage::disk('public')->assertMissing('sellers/1/old.png');
        Storage::disk('public')->assertExists($seller->logo_path);
    }

    private function fakePng(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='),
        );
    }
}
