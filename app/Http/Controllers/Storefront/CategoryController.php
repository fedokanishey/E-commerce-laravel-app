<?php

namespace App\Http\Controllers\Storefront;

use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController
{
    public function index(): Response
    {
        return Inertia::render('categories/index', [
            'categories' => Category::query()
                ->active()
                ->with(['children' => fn ($query) => $query->active()->orderBy('sort_order')])
                ->withCount([
                    'products' => fn ($query) => $query->publicCatalog(),
                ])
                ->whereNull('parent_id')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function show(Category $category): Response
    {
        abort_unless($category->is_active, 404);

        $category->load([
            'children' => fn ($query) => $query->active()->orderBy('sort_order'),
            'parent',
        ]);

        $categoryIds = $category->children()->pluck('id')->push($category->id);

        $products = Product::query()
            ->publicCatalog()
            ->whereIn('category_id', $categoryIds)
            ->with(['images', 'seller'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('categories/show', [
            'category' => $category,
            'products' => $products,
        ]);
    }
}
