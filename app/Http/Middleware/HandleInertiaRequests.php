<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => fn () => $user === null ? null : [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                ],
                'seller' => fn () => $user?->seller === null ? null : [
                    'id' => $user->seller->id,
                    'store_name' => $user->seller->store_name,
                    'slug' => $user->seller->slug,
                    'status' => $user->seller->status,
                    'logo_path' => $user->seller->logo_path,
                ],
            ],
            'cartItemCount' => fn () => $user === null
                ? 0
                : (int) ($user->cart?->items()->sum('quantity') ?? 0),
            'wishlistItemCount' => fn () => $user === null
                ? 0
                : ($user->wishlist?->items()->count() ?? 0),
            'unreadNotificationsCount' => fn () => $user === null
                ? 0
                : $user->unreadNotifications()->count(),
            'flash' => [
                'status' => $request->session()->get('status'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
