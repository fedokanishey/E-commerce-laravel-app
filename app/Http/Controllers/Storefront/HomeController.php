<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $products = Product::query()
            ->publicCatalog()
            ->with(['images', 'seller', 'category'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->latest()
            ->limit(8)
            ->get();

        $categories = Category::query()
            ->active()
            ->whereNull('parent_id')
            ->withCount([
                'products' => fn ($query) => $query->publicCatalog(),
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->limit(8)
            ->get();

        return Inertia::render('home', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }
}
