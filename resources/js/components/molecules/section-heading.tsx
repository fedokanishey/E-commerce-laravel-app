import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionHeadingProps = {
    eyebrow?: string;
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    align?: 'start' | 'center';
    className?: string;
};

export function SectionHeading({
    eyebrow,
    title,
    description,
    action,
    align = 'start',
    className,
}: SectionHeadingProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-4',
                align === 'center'
                    ? 'items-center text-center'
                    : 'sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className="max-w-2xl">
                {eyebrow && (
                    <p className="text-eyebrow text-brand mb-2 uppercase">
                        {eyebrow}
                    </p>
                )}

                <h2 className="text-h2 text-ink">{title}</h2>

                {description && (
                    <p className="text-small text-ink-muted mt-2">
                        {description}
                    </p>
                )}
            </div>

            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
