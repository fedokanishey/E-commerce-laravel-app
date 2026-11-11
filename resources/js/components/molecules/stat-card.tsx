import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/atoms/icon';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';

type StatCardProps = {
    label: string;
    value: ReactNode;
    helper?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    icon?: IconName;
    className?: string;
};

export function StatCard({
    label,
    value,
    helper,
    trend = 'neutral',
    icon,
    className,
}: StatCardProps) {
    return (
        <div className={cn(cardSurface, 'p-5', className)}>
            <div className="flex items-start justify-between gap-3">
                <p className="text-small text-ink-muted font-medium">{label}</p>

                {icon && (
                    <span className="bg-brand-soft text-brand-ink flex size-9 items-center justify-center rounded-full">
                        <Icon name={icon} size="md" />
                    </span>
                )}
            </div>

            <p className="text-h2 text-ink mt-3">{value}</p>

            {helper && (
                <p
                    className={cn(
                        'text-caption mt-1 font-medium',
                        trend === 'up' && 'text-success-ink',
                        trend === 'down' && 'text-danger-ink',
                        trend === 'neutral' && 'text-ink-muted',
                    )}
                >
                    {helper}
                </p>
            )}
        </div>
    );
}
