import {
    forwardRef,
    type ComponentPropsWithoutRef,
    type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { FormField } from './form-field';
import { Icon, type IconName } from './icon';

type InputProps = ComponentPropsWithoutRef<'input'> & {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string;
    startIcon?: IconName;
    endSlot?: ReactNode;
    containerClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            hint,
            error,
            startIcon,
            endSlot,
            containerClassName,
            className,
            id,
            required,
            ...props
        },
        ref,
    ) => (
        <FormField
            id={id}
            label={label}
            hint={hint}
            error={error}
            required={required}
            className={containerClassName}
        >
            {({ id: fieldId, describedBy, invalid }) => (
                <div className="relative">
                    {startIcon && (
                        <Icon
                            name={startIcon}
                            size="md"
                            className="text-ink-subtle pointer-events-none absolute start-3 top-1/2 -translate-y-1/2"
                        />
                    )}

                    <input
                        ref={ref}
                        id={fieldId}
                        required={required}
                        aria-invalid={invalid || undefined}
                        aria-describedby={describedBy}
                        className={cn(
                            'rounded-control border-line bg-surface text-small text-ink placeholder:text-ink-subtle h-11 w-full border px-3 transition-colors outline-none',
                            'focus:border-brand focus-visible:ring-brand/30 focus-visible:ring-offset-canvas focus-visible:ring-2 focus-visible:ring-offset-2',
                            'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/20',
                            'disabled:bg-surface-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
                            startIcon && 'ps-10',
                            endSlot && 'pe-10',
                            className,
                        )}
                        {...props}
                    />

                    {endSlot && (
                        <span className="absolute end-2 top-1/2 -translate-y-1/2">
                            {endSlot}
                        </span>
                    )}
                </div>
            )}
        </FormField>
    ),
);

Input.displayName = 'Input';
