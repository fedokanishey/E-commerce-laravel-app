import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Tone } from '@/types/ui';

type BadgeVariant = Tone | 'sale' | 'outline';

const variantClasses: Record<BadgeVariant, string> = {
    neutral: 'border-line bg-surface-muted text-ink-muted',
    brand: 'border-brand/15 bg-brand-soft text-brand-ink',
    success: 'border-success/20 bg-success-soft text-success-ink',
    warning: 'border-warning/20 bg-warning-soft text-warning-ink',
    danger: 'border-danger/20 bg-danger-soft text-danger-ink',
    info: 'border-info/20 bg-info-soft text-info-ink',
    sale: 'border-warning/20 bg-warning-soft text-warning-ink',
    outline: 'border-line-strong bg-transparent text-ink-muted',
};

type BadgeProps = {
    children: ReactNode;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    dot?: boolean;
    className?: string;
};

export function Badge({
    children,
    variant = 'neutral',
    size = 'md',
    dot = false,
    className,
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
                size === 'sm'
                    ? 'px-2 py-0.5 text-[0.6875rem] leading-4'
                    : 'text-caption px-2.5 py-1',
                variantClasses[variant],
                className,
            )}
        >
            {dot && (
                <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-current"
                />
            )}
            {children}
        </span>
    );
}
