<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\UpdateSellerProfileRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('seller/profile/edit', [
            'seller' => $request->user()->seller,
        ]);
    }

    public function update(UpdateSellerProfileRequest $request): RedirectResponse
    {
        $seller = $request->user()->seller;
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            if ($seller->logo_path !== null) {
                Storage::disk('public')->delete($seller->logo_path);
            }

            $data['logo_path'] = $request->file('logo')->store('sellers/'.$seller->id, 'public');
        }

        unset($data['logo']);

        $seller->update($data);

        return redirect()->route('seller.profile.edit')->with('status', 'seller-profile-updated');
    }
}
