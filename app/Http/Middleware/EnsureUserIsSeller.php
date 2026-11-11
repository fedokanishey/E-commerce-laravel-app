<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSeller
{
    public function handle(Request $request, Closure $next): Response
    {
        $seller = $request->user()?->seller;

        if ($seller === null) {
            return redirect()
                ->route('seller.onboarding.create')
                ->with('error', 'Create a seller profile to access the seller dashboard.');
        }

        if (! $seller->isActive()) {
            return redirect()
                ->route('seller.onboarding.create')
                ->with('error', 'Your seller account is not active.');
        }

        return $next($request);
    }
}
