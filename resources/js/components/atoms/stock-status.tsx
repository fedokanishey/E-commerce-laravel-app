import { cn } from '@/lib/utils';
import type { StockStatusValue } from '@/types/ui';

const statusConfig: Record<
    StockStatusValue,
    { label: string; dotClassName: string; textClassName: string }
> = {
    'in-stock': {
        label: 'In stock',
        dotClassName: 'bg-success',
        textClassName: 'text-success-ink',
    },
    'low-stock': {
        label: 'Low stock',
        dotClassName: 'bg-warning',
        textClassName: 'text-warning-ink',
    },
    'out-of-stock': {
        label: 'Out of stock',
        dotClassName: 'bg-danger',
        textClassName: 'text-danger-ink',
    },
    backorder: {
        label: 'Available on backorder',
        dotClassName: 'bg-info',
        textClassName: 'text-info-ink',
    },
};

type StockStatusProps = {
    status?: StockStatusValue;
    label?: string;
    size?: 'sm' | 'md';
    className?: string;
};

export function StockStatus({
    status = 'in-stock',
    label,
    size = 'sm',
    className,
}: StockStatusProps) {
    const config = statusConfig[status];

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 font-medium',
                size === 'sm' ? 'text-caption' : 'text-small',
                config.textClassName,
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={cn('size-1.5 rounded-full', config.dotClassName)}
            />
            {label ?? config.label}
        </span>
    );
}
