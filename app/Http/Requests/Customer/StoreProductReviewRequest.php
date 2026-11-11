<?php

namespace App\Http\Requests\Customer;

use App\Models\Product;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<int, mixed>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $product = $this->route('product');
                $productId = $product instanceof Product ? $product->id : null;

                $exists = $this->user()->reviews()
                    ->where('product_id', $productId)
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('rating', 'You have already reviewed this product.');
                }
            },
        ];
    }
}
