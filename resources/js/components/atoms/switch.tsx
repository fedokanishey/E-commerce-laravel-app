import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SwitchProps = {
    label: ReactNode;
    description?: ReactNode;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    name?: string;
    className?: string;
};

export function Switch({
    label,
    description,
    checked,
    onCheckedChange,
    disabled = false,
    id,
    name,
    className,
}: SwitchProps) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const descriptionId = description ? `${fieldId}-description` : undefined;

    return (
        <label
            htmlFor={fieldId}
            className={cn(
                'group flex cursor-pointer items-start gap-3',
                disabled && 'cursor-not-allowed opacity-60',
                className,
            )}
        >
            <input
                id={fieldId}
                name={name}
                type="checkbox"
                role="switch"
                checked={checked}
                disabled={disabled}
                aria-describedby={descriptionId}
                onChange={(event) => onCheckedChange(event.target.checked)}
                className="peer sr-only"
            />

            <span
                aria-hidden="true"
                className="border-line-strong bg-surface-muted peer-checked:border-brand-solid peer-checked:bg-brand-solid peer-focus-visible:ring-brand/30 peer-focus-visible:ring-offset-canvas relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-checked:[&>span]:translate-x-[1.375rem] rtl:peer-checked:[&>span]:-translate-x-[1.375rem]"
            >
                <span className="ease-smooth absolute start-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200" />
            </span>

            <span className="min-w-0">
                <span className="text-small text-ink block font-medium">
                    {label}
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
    );
}
