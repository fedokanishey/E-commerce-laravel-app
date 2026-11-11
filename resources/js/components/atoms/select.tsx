import {
    forwardRef,
    type ComponentPropsWithoutRef,
    type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { FormField } from './form-field';
import { Icon } from './icon';

type SelectProps = ComponentPropsWithoutRef<'select'> & {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string;
    placeholder?: string;
    containerClassName?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            hint,
            error,
            placeholder,
            containerClassName,
            className,
            id,
            required,
            children,
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
                    <select
                        ref={ref}
                        id={fieldId}
                        required={required}
                        aria-invalid={invalid || undefined}
                        aria-describedby={describedBy}
                        className={cn(
                            'rounded-control border-line bg-surface text-small text-ink h-11 w-full appearance-none border px-3 pe-10 transition-colors outline-none',
                            'focus:border-brand focus-visible:ring-brand/30 focus-visible:ring-offset-canvas focus-visible:ring-2 focus-visible:ring-offset-2',
                            'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/20',
                            'disabled:bg-surface-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
                            className,
                        )}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {children}
                    </select>

                    <Icon
                        name="chevron-down"
                        size="sm"
                        className="text-ink-subtle pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
                    />
                </div>
            )}
        </FormField>
    ),
);

Select.displayName = 'Select';
