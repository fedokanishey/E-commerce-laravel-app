<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreAddressRequest;
use App\Http\Requests\Customer\UpdateAddressRequest;
use App\Models\Address;
use App\Services\AddressService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('account/addresses/index', [
            'addresses' => $request->user()->addresses()->latest('is_default')->latest('id')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('account/addresses/create');
    }

    public function store(StoreAddressRequest $request, AddressService $addressService): RedirectResponse
    {
        $addressService->create($request->user(), $request->validated());

        return redirect()->route('addresses.index')->with('status', 'address-created');
    }

    public function edit(Address $address): Response
    {
        Gate::authorize('update', $address);

        return Inertia::render('account/addresses/edit', [
            'address' => $address,
        ]);
    }

    public function update(
        UpdateAddressRequest $request,
        Address $address,
        AddressService $addressService,
    ): RedirectResponse {
        Gate::authorize('update', $address);

        $addressService->update($address, $request->validated());

        return redirect()->route('addresses.index')->with('status', 'address-updated');
    }

    public function destroy(Address $address, AddressService $addressService): RedirectResponse
    {
        Gate::authorize('delete', $address);

        $addressService->delete($address);

        return redirect()->route('addresses.index')->with('status', 'address-deleted');
    }
}
