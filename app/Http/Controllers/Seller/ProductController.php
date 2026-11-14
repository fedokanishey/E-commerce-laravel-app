<?php

namespace App\Http\Controllers\Seller;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\StoreProductRequest;
use App\Http\Requests\Seller\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'max:20'],
        ]);

        $products = $request->user()->seller
            ->products()
            ->with(['images', 'category'])
            ->withCount('reviews')
            ->search($filters['q'] ?? null)
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('seller/products/index', [
            'products' => $products,
            'filters' => $filters,
            'statuses' => collect(ProductStatus::cases())
                ->map(fn (ProductStatus $status) => ['value' => $status->value, 'label' => $status->label()]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('seller/products/create', [
            'categories' => Category::query()->active()->orderBy('name')->get(['id', 'name', 'parent_id']),
            'statuses' => collect(ProductStatus::cases())
                ->map(fn (ProductStatus $status) => ['value' => $status->value, 'label' => $status->label()]),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $images = $validated['images'] ?? [];
        unset($validated['images']);

        $product = DB::transaction(function () use ($request, $validated, $images) {
            $product = $request->user()->seller->products()->create([
                ...$validated,
                'slug' => $this->uniqueSlug($validated['name']),
                'is_approved' => true,
            ]);

            $this->storeImages($product, $images);

            return $product;
        });

        return redirect()
            ->route('seller.products.show', $product)
            ->with('status', 'product-created');
    }

    public function show(Product $product): Response
    {
        Gate::authorize('viewSeller', $product);

        $product->load(['images', 'category', 'reviews.user:id,name']);

        return Inertia::render('seller/products/show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        Gate::authorize('update', $product);

        $product->load('images');

        return Inertia::render('seller/products/edit', [
            'product' => $product,
            'categories' => Category::query()->active()->orderBy('name')->get(['id', 'name', 'parent_id']),
            'statuses' => collect(ProductStatus::cases())
                ->map(fn (ProductStatus $status) => ['value' => $status->value, 'label' => $status->label()]),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        Gate::authorize('update', $product);

        $validated = $request->validated();
        $images = $validated['images'] ?? [];
        unset($validated['images']);

        DB::transaction(function () use ($product, $validated, $images) {
            $product->update($validated);
            $this->storeImages($product, $images);
        });

        return redirect()
            ->route('seller.products.show', $product)
            ->with('status', 'product-updated');
    }

    public function destroy(Product $product): RedirectResponse
    {
        Gate::authorize('delete', $product);

        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $product->delete();

        return redirect()->route('seller.products.index')->with('status', 'product-deleted');
    }

    /**
     * @param  array<int, UploadedFile>  $images
     */
    private function storeImages(Product $product, array $images): void
    {
        $nextSort = (int) $product->images()->max('sort_order');
        $hasPrimary = $product->images()->where('is_primary', true)->exists();

        foreach ($images as $image) {
            $product->images()->create([
                'path' => $image->store('products/'.$product->id, 'public'),
                'alt_text' => $product->name,
                'sort_order' => ++$nextSort,
                'is_primary' => ! $hasPrimary,
            ]);

            $hasPrimary = true;
        }
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $suffix = 2;

        while (Product::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
