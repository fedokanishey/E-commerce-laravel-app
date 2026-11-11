export function toNumber(value: number | string): number {
    return typeof value === 'number' ? value : Number.parseFloat(value);
}

export function formatCurrency(
    amount: number | string,
    currency = 'USD',
    locale = 'en-US',
): string {
    const value = toNumber(amount);

    if (!Number.isFinite(value)) {
        return '—';
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatCompactNumber(value: number, locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

export function formatRating(value: number): string {
    return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

export function calculateDiscountPercent(
    price: number | string,
    compareAtPrice?: number | string | null,
): number | null {
    const current = toNumber(price);
    const previous =
        compareAtPrice == null ? Number.NaN : toNumber(compareAtPrice);

    if (
        !Number.isFinite(current) ||
        !Number.isFinite(previous) ||
        previous <= current
    ) {
        return null;
    }

    return Math.round(((previous - current) / previous) * 100);
}

export function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}
