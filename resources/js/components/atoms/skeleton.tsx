import { cn } from '@/lib/utils';

const variantClasses = {
    block: 'rounded-card',
    text: 'h-3 rounded-full',
    circle: 'aspect-square rounded-full',
} as const;

type SkeletonProps = {
    variant?: keyof typeof variantClasses;
    className?: string;
};

export function Skeleton({ variant = 'block', className }: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                'bg-surface-muted animate-pulse',
                variantClasses[variant],
                className,
            )}
        />
    );
}
