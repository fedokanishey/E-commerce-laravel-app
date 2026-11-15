<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\SellerOrderStatus;
use App\Models\Order;
use App\Models\SellerOrder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class OrderTotalsService
{
    public function toMinorUnits(int|float|string|null $amount): int
    {
        if ($amount === null) {
            return 0;
        }

        if (is_float($amount)) {
            $amount = number_format($amount, 2, '.', '');
        }

        $amount = trim((string) $amount);

        if ($amount === '') {
            return 0;
        }

        $isNegative = str_starts_with($amount, '-');
        $amount = ltrim($amount, '+-');
        $parts = explode('.', $amount, 2);
        $whole = $parts[0] !== '' ? (int) $parts[0] : 0;
        $fraction = str_pad(substr($parts[1] ?? '', 0, 2), 2, '0');
        $minor = ($whole * 100) + (int) $fraction;

        return $isNegative ? -$minor : $minor;
    }

    public function formatMinor(int $minor): string
    {
        $isNegative = $minor < 0;
        $absolute = abs($minor);

        return ($isNegative ? '-' : '')
            .intdiv($absolute, 100)
            .'.'
            .str_pad((string) ($absolute % 100), 2, '0', STR_PAD_LEFT);
    }

    /**
     * @param  array<int, int>  $sellerSubtotalsMinor
     * @return array<int, int>
     */
    public function allocateDiscount(int $discountMinor, array $sellerSubtotalsMinor): array
    {
        $allocated = array_fill_keys(array_keys($sellerSubtotalsMinor), 0);
        $totalSubtotalMinor = array_sum($sellerSubtotalsMinor);

        if ($discountMinor <= 0 || $totalSubtotalMinor <= 0) {
            return $allocated;
        }

        $remainders = [];
        $allocatedTotal = 0;

        foreach ($sellerSubtotalsMinor as $sellerId => $sellerSubtotalMinor) {
            $numerator = $discountMinor * $sellerSubtotalMinor;
            $base = intdiv($numerator, $totalSubtotalMinor);

            $allocated[$sellerId] = $base;
            $allocatedTotal += $base;
            $remainders[] = [
                'seller_id' => $sellerId,
                'remainder' => $numerator % $totalSubtotalMinor,
            ];
        }

        usort($remainders, function (array $left, array $right): int {
            return ($right['remainder'] <=> $left['remainder'])
                ?: ($left['seller_id'] <=> $right['seller_id']);
        });

        $remainingMinor = $discountMinor - $allocatedTotal;

        foreach ($remainders as $remainder) {
            if ($remainingMinor <= 0) {
                break;
            }

            $allocated[$remainder['seller_id']]++;
            $remainingMinor--;
        }

        return $allocated;
    }

    /**
     * @param  Collection<int, SellerOrder>|null  $sellerOrders
     * @return Collection<int, SellerOrder>
     */
    public function activeSellerOrders(Order $order, ?Collection $sellerOrders = null): Collection
    {
        return $this->sellerOrdersFor($order, $sellerOrders)
            ->reject(fn (SellerOrder $sellerOrder) => $sellerOrder->status === SellerOrderStatus::Cancelled)
            ->values();
    }

    /**
     * @param  Collection<int, SellerOrder>|null  $sellerOrders
     */
    public function amountDueMinor(Order $order, ?Collection $sellerOrders = null): int
    {
        $activeSellerOrders = $this->activeSellerOrders($order, $sellerOrders);

        if ($activeSellerOrders->isEmpty()) {
            return 0;
        }

        $sellerTotalMinor = $activeSellerOrders->sum(
            fn (SellerOrder $sellerOrder) => $this->toMinorUnits($sellerOrder->total)
        );

        return $sellerTotalMinor + $this->toMinorUnits($order->shipping_total);
    }

    /**
     * @param  Collection<int, SellerOrder>|null  $sellerOrders
     */
    public function amountDue(Order $order, ?Collection $sellerOrders = null): string
    {
        return $this->formatMinor($this->amountDueMinor($order, $sellerOrders));
    }

    /**
     * @param  Collection<int, SellerOrder>|null  $sellerOrders
     */
    public function isPartiallyCancelled(Order $order, ?Collection $sellerOrders = null): bool
    {
        $sellerOrders = $this->sellerOrdersFor($order, $sellerOrders);

        return $sellerOrders->contains(
            fn (SellerOrder $sellerOrder) => $sellerOrder->status === SellerOrderStatus::Cancelled
        ) && $sellerOrders->contains(
            fn (SellerOrder $sellerOrder) => $sellerOrder->status !== SellerOrderStatus::Cancelled
        );
    }

    /**
     * @param  Collection<int, SellerOrder>|null  $sellerOrders
     */
    public function syncPayment(Order $order, ?Collection $sellerOrders = null): void
    {
        $payment = $order->payment()->lockForUpdate()->first();

        if ($payment === null) {
            return;
        }

        if ($order->status === OrderStatus::Cancelled) {
            if ($payment->status === PaymentStatus::Pending) {
                $payment->update([
                    'status' => PaymentStatus::Voided,
                    'amount' => $this->formatMinor(0),
                    'paid_at' => null,
                ]);
            }

            return;
        }

        if ($payment->status !== PaymentStatus::Pending) {
            return;
        }

        $amountDueMinor = $this->amountDueMinor($order, $sellerOrders);
        $activeSellerOrders = $this->activeSellerOrders($order, $sellerOrders);

        $payment->amount = $this->formatMinor($amountDueMinor);

        if ($this->allActiveDeliveredAndCollected($activeSellerOrders)) {
            $payment->status = PaymentStatus::Paid;
            $payment->paid_at = Carbon::now();
        } else {
            $payment->paid_at = null;
        }

        $payment->save();
    }

    /**
     * @param  Collection<int, SellerOrder>  $activeSellerOrders
     */
    private function allActiveDeliveredAndCollected(Collection $activeSellerOrders): bool
    {
        return $activeSellerOrders->isNotEmpty()
            && $activeSellerOrders->every(
                fn (SellerOrder $sellerOrder) => $sellerOrder->status === SellerOrderStatus::Delivered
                    && $sellerOrder->cod_collected_at !== null
            );
    }

    /**
     * @param  Collection<int, SellerOrder>|null  $sellerOrders
     * @return Collection<int, SellerOrder>
     */
    private function sellerOrdersFor(Order $order, ?Collection $sellerOrders): Collection
    {
        if ($sellerOrders !== null) {
            return $sellerOrders;
        }

        if ($order->relationLoaded('sellerOrders')) {
            return $order->getRelation('sellerOrders');
        }

        return $order->sellerOrders()->get();
    }
}
