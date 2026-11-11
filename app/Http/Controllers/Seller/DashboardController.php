<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Services\SellerDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, SellerDashboardService $dashboardService): Response
    {
        return Inertia::render('seller/dashboard', [
            'overview' => $dashboardService->overview($request->user()->seller),
        ]);
    }
}
