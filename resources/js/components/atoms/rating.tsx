import { formatCompactNumber, formatRating } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Icon } from './icon';

type RatingProps = {
    value: number;
    max?: number;
    count?: number;
    size?: 'sm' | 'md';
    showValue?: boolean;
    className?: string;
};

export function Rating({
    value,
    max = 5,
    count,
    size = 'sm',
    showValue = false,
    className,
}: RatingProps) {
    const clampedValue = Math.min(Math.max(value, 0), max);
    const starSize = size === 'sm' ? 14 : 18;
    const label = `${formatRating(clampedValue)} out of ${max} stars${
        count != null ? `, ${count} reviews` : ''
    }`;

    return (
        <span
            role="img"
            aria-label={label}
            className={cn('inline-flex items-center gap-1.5', className)}
        >
            <span
                aria-hidden="true"
                className="inline-flex items-center gap-0.5"
            >
                {Array.from({ length: max }, (_, index) => {
                    const percentage = Math.min(
                        Math.max(clampedValue - index, 0),
                        1,
                    );

                    return (
                        <span
                            key={index}
                            className="relative inline-flex shrink-0"
                        >
                            <Icon
                                name="star"
                                filled
                                size={starSize}
                                className="text-line-strong"
                            />
                            {percentage > 0 && (
                                <span
                                    className="absolute inset-y-0 start-0 overflow-hidden"
                                    style={{ width: `${percentage * 100}%` }}
                                >
                                    <Icon
                                        name="star"
                                        filled
                                        size={starSize}
                                        className="text-rating"
                                    />
                                </span>
                            )}
                        </span>
                    );
                })}
            </span>

            {showValue && (
                <span className="text-small text-ink font-medium">
                    {formatRating(clampedValue)}
                </span>
            )}

            {count != null && (
                <span className="text-caption text-ink-muted">
                    ({formatCompactNumber(count)})
                </span>
            )}
        </span>
    );
}
