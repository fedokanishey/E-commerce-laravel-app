import { cn } from '@/lib/utils';
import type { ControlSize } from '@/types/ui';

const sizeClasses: Record<ControlSize, string> = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
};

type SpinnerProps = {
    size?: ControlSize;
    label?: string;
    className?: string;
};

export function Spinner({
    size = 'md',
    label = 'Loading',
    className,
}: SpinnerProps) {
    return (
        <span
            role="status"
            className={cn('inline-flex items-center justify-center', className)}
        >
            <span className="sr-only">{label}</span>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={cn('animate-spin', sizeClasses[size])}
            >
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="opacity-25"
                />
                <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        </span>
    );
}
