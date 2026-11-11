import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/atoms/icon';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
    title: string;
    description?: string;
    icon?: IconName;
    action?: ReactNode;
    className?: string;
};

export function EmptyState({
    title,
    description,
    icon = 'package',
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'rounded-card border-line-strong bg-surface flex flex-col items-center justify-center border border-dashed px-6 py-12 text-center',
                className,
            )}
        >
            <span className="bg-brand-soft text-brand-ink flex size-12 items-center justify-center rounded-full">
                <Icon name={icon} size="lg" />
            </span>

            <h3 className="text-h3 text-ink mt-4">{title}</h3>

            {description && (
                <p className="text-small text-ink-muted mt-1.5 max-w-md">
                    {description}
                </p>
            )}

            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
