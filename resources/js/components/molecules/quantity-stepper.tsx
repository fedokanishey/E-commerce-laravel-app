import { Icon } from '@/components/atoms/icon';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';

type QuantityStepperProps = {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    label?: string;
    className?: string;
};

export function QuantityStepper({
    value,
    onChange,
    min = 1,
    max = 99,
    disabled = false,
    label = 'Quantity',
    className,
}: QuantityStepperProps) {
    const canDecrease = !disabled && value > min;
    const canIncrease = !disabled && value < max;

    const buttonClassName = cn(
        'text-ink-muted hover:bg-surface-muted hover:text-ink inline-flex size-11 items-center justify-center transition-colors',
        focusRing,
        'disabled:pointer-events-none disabled:opacity-40',
    );

    return (
        <div
            role="group"
            aria-label={label}
            className={cn(
                'rounded-control border-line bg-surface inline-flex items-center overflow-hidden border',
                disabled && 'opacity-60',
                className,
            )}
        >
            <button
                type="button"
                aria-label="Decrease quantity"
                disabled={!canDecrease}
                onClick={() => onChange(Math.max(min, value - 1))}
                className={cn(buttonClassName, 'border-line border-e')}
            >
                <Icon name="minus" size="sm" />
            </button>

            <span
                aria-live="polite"
                className="text-small text-ink min-w-11 text-center font-semibold"
            >
                {value}
            </span>

            <button
                type="button"
                aria-label="Increase quantity"
                disabled={!canIncrease}
                onClick={() => onChange(Math.min(max, value + 1))}
                className={cn(buttonClassName, 'border-line border-s')}
            >
                <Icon name="plus" size="sm" />
            </button>
        </div>
    );
}
