<?php

namespace App\Services;

use App\Enums\CouponType;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CouponValidator
{
    public function __construct(private OrderTotalsService $orderTotals) {}

    public function findForSubtotal(User $user, ?string $code, float $subtotal): ?Coupon
    {
        return $this->findForSubtotalMinor(
            $user,
            $code,
            $this->orderTotals->toMinorUnits($subtotal),
        );
    }

    public function findForSubtotalMinor(User $user, ?string $code, int $subtotalMinor): ?Coupon
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

        if ($this->orderTotals->toMinorUnits($coupon->min_order_amount) > $subtotalMinor) {
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
        return (float) $this->orderTotals->formatMinor(
            $this->discountForMinor($coupon, $this->orderTotals->toMinorUnits($subtotal)),
        );
    }

    public function discountForMinor(Coupon $coupon, int $subtotalMinor): int
    {
        $discountMinor = $coupon->type === CouponType::Fixed
            ? $this->orderTotals->toMinorUnits($coupon->value)
            : intdiv(($subtotalMinor * $this->orderTotals->toMinorUnits($coupon->value)) + 5000, 10000);

        if ($coupon->max_discount_amount !== null) {
            $discountMinor = min(
                $discountMinor,
                $this->orderTotals->toMinorUnits($coupon->max_discount_amount),
            );
        }

        return max(0, min($discountMinor, $subtotalMinor));
    }
}
