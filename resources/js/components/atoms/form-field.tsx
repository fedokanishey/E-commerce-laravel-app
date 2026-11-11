import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type FieldRenderProps = {
    id: string;
    describedBy?: string;
    invalid: boolean;
};

type FormFieldProps = {
    id?: string;
    label?: ReactNode;
    hint?: ReactNode;
    error?: string;
    required?: boolean;
    className?: string;
    children: (props: FieldRenderProps) => ReactNode;
};

export function FormField({
    id,
    label,
    hint,
    error,
    required = false,
    className,
    children,
}: FormFieldProps) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const hintId = hint ? `${fieldId}-hint` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;
    const describedBy =
        [hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            {label && (
                <label
                    htmlFor={fieldId}
                    className="text-small text-ink font-medium"
                >
                    {label}
                    {required && (
                        <span aria-hidden="true" className="text-danger ms-1">
                            *
                        </span>
                    )}
                </label>
            )}

            {children({
                id: fieldId,
                describedBy,
                invalid: Boolean(error),
            })}

            {hint && (
                <p id={hintId} className="text-caption text-ink-muted">
                    {hint}
                </p>
            )}

            {error && (
                <p id={errorId} className="text-caption text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
