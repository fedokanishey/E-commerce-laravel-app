<?php

namespace App\Http\Controllers\Storefront;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController
{
    /**
     * @return array<string, mixed>
     */
    private function filters(Request $request): array
    {
        return $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:150'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0', 'gte:min_price'],
            'sort' => ['nullable', Rule::in(['newest', 'price_asc', 'price_desc', 'rating', 'popular'])],
            'per_page' => ['nullable', 'integer', Rule::in([12, 24, 48])],
        ]);
    }

    public function index(Request $request): Response
    {
        $filters = $this->filters($request);
        $perPage = (int) ($filters['per_page'] ?? 12);

        $query = Product::query()
            ->publicCatalog()
            ->with(['images', 'seller', 'category'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->search($filters['q'] ?? null);

        if (! empty($filters['category'])) {
            $category = Category::query()->where('slug', $filters['category'])->first();

            if ($category !== null) {
                $categoryIds = $category->children()->pluck('id')->push($category->id);
                $query->whereIn('category_id', $categoryIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        if (isset($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        match ($filters['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('price')->orderByDesc('id'),
            'price_desc' => $query->orderByDesc('price')->orderByDesc('id'),
            'rating' => $query->orderByDesc('reviews_avg_rating')->orderByDesc('id'),
            'popular' => $query->withCount('orderItems')->orderByDesc('order_items_count')->orderByDesc('id'),
            default => $query->latest()->orderByDesc('id'),
        };

        return Inertia::render('products/index', [
            'products' => $query->paginate($perPage)->withQueryString(),
            'filters' => (object) $filters,
            'categories' => Category::query()
                ->active()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'parent_id']),
        ]);
    }

    public function show(Request $request, Product $product): Response
    {
        $user = $request->user();

        $isOwner = $user !== null
            && $user->seller !== null
            && $user->seller->id === $product->seller_id;

        abort_unless($product->isPubliclyVisible() || $isOwner, 404);

        $product->load([
            'images',
            'seller',
            'category',
            'reviews' => fn ($query) => $query->with('user:id,name')->latest()->limit(10),
        ]);

        $reviewsQuery = $product->reviews();
        $averageRating = round((float) (clone $reviewsQuery)->avg('rating'), 2);
        $reviewCount = (clone $reviewsQuery)->count();

        $relatedProducts = Product::query()
            ->publicCatalog()
            ->whereKeyNot($product->id)
            ->when($product->category_id, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->with(['images', 'seller'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->limit(4)
            ->get();

        return Inertia::render('products/show', [
            'product' => $product,
            'averageRating' => $averageRating,
            'reviewCount' => $reviewCount,
            'relatedProducts' => $relatedProducts,
            'canReview' => $user !== null && ! $user->reviews()->where('product_id', $product->id)->exists(),
        ]);
    }
}
