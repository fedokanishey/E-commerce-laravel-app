import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { disabledStyles, focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-9 px-3 text-small',
    md: 'h-11 px-4 text-small',
    lg: 'h-12 px-5 text-body',
    icon: 'size-11 p-0',
};

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'bg-brand-solid text-on-brand hover:bg-brand-solid-hover active:opacity-90',
    secondary:
        'bg-brand-soft text-brand-ink hover:bg-brand-soft/80 active:opacity-90',
    outline:
        'border border-line-strong bg-surface text-ink hover:border-brand/40 hover:bg-surface-muted',
    ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
    danger: 'bg-danger-solid text-on-danger hover:bg-danger-solid/90 active:opacity-90',
    link: 'h-auto rounded-none px-0 text-brand underline-offset-4 hover:text-brand-ink hover:underline',
};

type ButtonStyleOptions = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
};

export function buttonStyles({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
}: ButtonStyleOptions = {}) {
    return cn(
        'rounded-control ease-smooth inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 select-none',
        focusRing,
        disabledStyles,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className,
    );
}

type ButtonProps = ComponentPropsWithoutRef<'button'> &
    ButtonStyleOptions & {
        loading?: boolean;
    };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            className,
            loading = false,
            disabled,
            type = 'button',
            children,
            ...props
        },
        ref,
    ) => (
        <button
            ref={ref}
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={buttonStyles({
                variant,
                size,
                fullWidth,
                className,
            })}
            {...props}
        >
            {loading && <Spinner size="sm" className="text-current" />}
            {children}
        </button>
    ),
);

Button.displayName = 'Button';
