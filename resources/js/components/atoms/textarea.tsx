import {
    forwardRef,
    type ComponentPropsWithoutRef,
    type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { FormField } from './form-field';

type TextareaProps = ComponentPropsWithoutRef<'textarea'> & {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string;
    containerClassName?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            hint,
            error,
            containerClassName,
            className,
            id,
            required,
            rows = 4,
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
                <textarea
                    ref={ref}
                    id={fieldId}
                    rows={rows}
                    required={required}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                    className={cn(
                        'rounded-control border-line bg-surface text-small text-ink placeholder:text-ink-subtle min-h-28 w-full resize-y border px-3 py-2.5 leading-6 transition-colors outline-none',
                        'focus:border-brand focus-visible:ring-brand/30 focus-visible:ring-offset-canvas focus-visible:ring-2 focus-visible:ring-offset-2',
                        'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/20',
                        'disabled:bg-surface-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
                        className,
                    )}
                    {...props}
                />
            )}
        </FormField>
    ),
);

Textarea.displayName = 'Textarea';
