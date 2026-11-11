<?php

namespace App\Services;

use App\Enums\CouponType;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CouponValidator
{
    public function findForSubtotal(User $user, ?string $code, float $subtotal): ?Coupon
    {
        $code = $code !== null ? strtoupper(trim($code)) : null;

        if ($code === null || $code === '') {
            return null;
        }

        $coupon = Coupon::query()->where('code', $code)->lockForUpdate()->first();

        if ($coupon === null) {
            throw ValidationException::withMessages([
                'coupon_code' => 'The coupon code is invalid.',
            ]);
        }

        if (! $coupon->is_active || ! $coupon->hasStarted() || $coupon->hasExpired()) {
            throw ValidationException::withMessages([
                'coupon_code' => 'The coupon code is not valid for this order.',
            ]);
        }

        if ((float) $coupon->min_order_amount > $subtotal) {
            throw ValidationException::withMessages([
                'coupon_code' => 'Your order does not meet the minimum amount for this coupon.',
            ]);
        }

        if ($coupon->usage_limit !== null && $coupon->usages()->count() >= $coupon->usage_limit) {
            throw ValidationException::withMessages([
                'coupon_code' => 'This coupon has reached its usage limit.',
            ]);
        }

        if ($coupon->usages()->where('user_id', $user->id)->count() >= $coupon->per_user_limit) {
            throw ValidationException::withMessages([
                'coupon_code' => 'You have already used this coupon the maximum number of times.',
            ]);
        }

        return $coupon;
    }

    public function discountFor(Coupon $coupon, float $subtotal): float
    {
        $discount = $coupon->type === CouponType::Fixed
            ? (float) $coupon->value
            : round($subtotal * ((float) $coupon->value / 100), 2);

        if ($coupon->max_discount_amount !== null) {
            $discount = min($discount, (float) $coupon->max_discount_amount);
        }

        return round(max(0, min($discount, $subtotal)), 2);
    }
}
