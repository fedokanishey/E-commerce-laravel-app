import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/atoms/icon';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { Tone } from '@/types/ui';

type AlertTone = Exclude<Tone, 'brand'>;

const toneConfig: Record<
    AlertTone,
    { icon: IconName; className: string; iconClassName: string }
> = {
    neutral: {
        icon: 'info',
        className: 'border-line bg-surface-muted text-ink',
        iconClassName: 'text-ink-muted',
    },
    info: {
        icon: 'info',
        className: 'border-info/20 bg-info-soft text-info-ink',
        iconClassName: 'text-info',
    },
    success: {
        icon: 'check',
        className: 'border-success/20 bg-success-soft text-success-ink',
        iconClassName: 'text-success',
    },
    warning: {
        icon: 'alert-circle',
        className: 'border-warning/20 bg-warning-soft text-warning-ink',
        iconClassName: 'text-warning',
    },
    danger: {
        icon: 'alert-circle',
        className: 'border-danger/20 bg-danger-soft text-danger-ink',
        iconClassName: 'text-danger',
    },
};

type AlertProps = {
    tone?: AlertTone;
    title?: ReactNode;
    children?: ReactNode;
    action?: ReactNode;
    onDismiss?: () => void;
    dismissLabel?: string;
    className?: string;
};

export function Alert({
    tone = 'neutral',
    title,
    children,
    action,
    onDismiss,
    dismissLabel = 'Dismiss alert',
    className,
}: AlertProps) {
    const config = toneConfig[tone];

    return (
        <div
            role={tone === 'danger' ? 'alert' : 'status'}
            className={cn(
                'rounded-card flex items-start gap-3 border px-4 py-3',
                config.className,
                className,
            )}
        >
            <Icon
                name={config.icon}
                size="md"
                className={cn('mt-0.5', config.iconClassName)}
            />

            <div className="min-w-0 flex-1">
                {title && <p className="text-small font-semibold">{title}</p>}
                {children && (
                    <div className="text-small mt-0.5 opacity-90">
                        {children}
                    </div>
                )}
            </div>

            {action && <div className="shrink-0">{action}</div>}

            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label={dismissLabel}
                    className={cn(
                        'shrink-0 rounded-full p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10',
                        focusRing,
                    )}
                >
                    <Icon name="close" size="sm" />
                </button>
            )}
        </div>
    );
}
