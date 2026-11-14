<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\ProductImageRequest;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    public function store(ProductImageRequest $request, Product $product): RedirectResponse
    {
        Gate::authorize('update', $product);

        $isPrimary = $request->boolean('is_primary');
        $hasImages = $product->images()->exists();

        if ($isPrimary || ! $hasImages) {
            $product->images()->update(['is_primary' => false]);
            $isPrimary = true;
        }

        $product->images()->create([
            'path' => $request->file('image')->store('products/'.$product->id, 'public'),
            'alt_text' => $request->input('alt_text', $product->name),
            'sort_order' => (int) $product->images()->max('sort_order') + 1,
            'is_primary' => $isPrimary,
        ]);

        return back()->with('status', 'product-image-added');
    }

    public function destroy(Product $product, ProductImage $image): RedirectResponse
    {
        Gate::authorize('update', $product);

        abort_unless($image->product_id === $product->id, 404);

        Storage::disk('public')->delete($image->path);
        $image->delete();

        if (! $product->images()->where('is_primary', true)->exists()) {
            $product->images()->orderBy('sort_order')->first()?->update(['is_primary' => true]);
        }

        return back()->with('status', 'product-image-removed');
    }
}
