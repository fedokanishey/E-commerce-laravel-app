import {
    forwardRef,
    useId,
    type ComponentPropsWithoutRef,
    type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './icon';

type CheckboxProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
    label: ReactNode;
    description?: ReactNode;
    error?: string;
    containerClassName?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            label,
            description,
            error,
            containerClassName,
            className,
            id,
            required,
            disabled,
            ...props
        },
        ref,
    ) => {
        const generatedId = useId();
        const fieldId = id ?? generatedId;
        const descriptionId = description
            ? `${fieldId}-description`
            : undefined;
        const errorId = error ? `${fieldId}-error` : undefined;
        const describedBy =
            [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

        return (
            <div className={cn('flex flex-col gap-1.5', containerClassName)}>
                <label
                    htmlFor={fieldId}
                    className={cn(
                        'group flex cursor-pointer items-start gap-3',
                        disabled && 'cursor-not-allowed opacity-60',
                    )}
                >
                    <input
                        ref={ref}
                        id={fieldId}
                        type="checkbox"
                        required={required}
                        disabled={disabled}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={describedBy}
                        className={cn('peer sr-only', className)}
                        {...props}
                    />

                    <span
                        aria-hidden="true"
                        className="border-line-strong bg-surface peer-checked:border-brand-solid peer-checked:bg-brand-solid peer-checked:text-on-brand peer-focus-visible:ring-brand/30 peer-focus-visible:ring-offset-canvas mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[0.375rem] border text-transparent transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
                    >
                        <Icon name="check" size="sm" />
                    </span>

                    <span className="min-w-0">
                        <span className="text-small text-ink block font-medium">
                            {label}
                            {required && (
                                <span
                                    aria-hidden="true"
                                    className="text-danger ms-1"
                                >
                                    *
                                </span>
                            )}
                        </span>

                        {description && (
                            <span
                                id={descriptionId}
                                className="text-caption text-ink-muted mt-0.5 block"
                            >
                                {description}
                            </span>
                        )}
                    </span>
                </label>

                {error && (
                    <p id={errorId} className="text-caption text-danger">
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

Checkbox.displayName = 'Checkbox';
