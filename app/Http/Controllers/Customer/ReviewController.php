<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreProductReviewRequest;
use App\Http\Requests\Customer\UpdateProductReviewRequest;
use App\Models\Product;
use App\Models\ProductReview;
use App\Services\ProductReviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ReviewController extends Controller
{
    public function store(
        StoreProductReviewRequest $request,
        Product $product,
        ProductReviewService $reviewService,
    ): RedirectResponse {
        abort_unless($product->isPubliclyVisible(), 404);

        $product->reviews()->create([
            'user_id' => $request->user()->id,
            'rating' => $request->integer('rating'),
            'comment' => $request->input('comment'),
            'is_verified_purchase' => $reviewService->hasPurchased($request->user(), $product),
        ]);

        return back()->with('status', 'review-created');
    }

    public function update(UpdateProductReviewRequest $request, ProductReview $review): RedirectResponse
    {
        $review->update($request->validated());

        return back()->with('status', 'review-updated');
    }

    public function destroy(Request $request, ProductReview $review): RedirectResponse
    {
        Gate::authorize('delete', $review);

        $review->delete();

        return back()->with('status', 'review-deleted');
    }
}
