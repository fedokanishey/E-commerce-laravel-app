<?php

namespace App\Http\Controllers\Seller;

use App\Enums\SellerStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\StoreSellerProfileRequest;
use App\Models\Seller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()->seller !== null) {
            return redirect()->route('seller.dashboard');
        }

        return Inertia::render('seller/onboarding');
    }

    public function store(StoreSellerProfileRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $seller = Seller::query()->create([
            'user_id' => $request->user()->id,
            'store_name' => $data['store_name'],
            'slug' => $this->uniqueSlug($data['store_name']),
            'description' => $data['description'] ?? null,
            'status' => SellerStatus::Active,
            'approved_at' => now(),
        ]);

        if ($request->hasFile('logo')) {
            $seller->update([
                'logo_path' => $request->file('logo')->store('sellers/'.$seller->id, 'public'),
            ]);
        }

        return redirect()
            ->route('seller.dashboard')
            ->with('status', 'seller-profile-created');
    }

    private function uniqueSlug(string $storeName): string
    {
        $base = Str::slug($storeName) ?: 'store';
        $slug = $base;
        $suffix = 2;

        while (Seller::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
