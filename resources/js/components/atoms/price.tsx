import { calculateDiscountPercent, formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

const sizeClasses = {
    sm: 'text-small',
    md: 'text-lg',
    lg: 'text-2xl',
} as const;

type PriceProps = {
    amount: number | string;
    compareAtPrice?: number | string | null;
    currency?: string;
    locale?: string;
    size?: keyof typeof sizeClasses;
    showDiscount?: boolean;
    className?: string;
};

export function Price({
    amount,
    compareAtPrice,
    currency = 'USD',
    locale = 'en-US',
    size = 'md',
    showDiscount = true,
    className,
}: PriceProps) {
    const discount = showDiscount
        ? calculateDiscountPercent(amount, compareAtPrice)
        : null;

    return (
        <span
            className={cn(
                'flex flex-wrap items-baseline gap-x-2 gap-y-1',
                className,
            )}
        >
            <span
                className={cn(
                    'text-ink font-semibold tracking-tight',
                    sizeClasses[size],
                )}
            >
                {formatCurrency(amount, currency, locale)}
            </span>

            {compareAtPrice != null && (
                <span className="text-small text-ink-subtle font-normal line-through">
                    <span className="sr-only">Original price: </span>
                    {formatCurrency(compareAtPrice, currency, locale)}
                </span>
            )}

            {discount !== null && (
                <Badge variant="sale" size="sm">
                    -{discount}%
                </Badge>
            )}
        </span>
    );
}
