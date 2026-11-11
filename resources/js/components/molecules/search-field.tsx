import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/utils';

type SearchFieldProps = {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (value: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
};

export function SearchField({
    value,
    onChange,
    onSubmit,
    placeholder = 'Search products, brands, and categories',
    label = 'Search products',
    className,
}: SearchFieldProps) {
    return (
        <form
            role="search"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit?.(value);
            }}
            className={cn('min-w-0', className)}
        >
            <Input
                type="search"
                name="q"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                aria-label={label}
                startIcon="search"
                autoComplete="off"
            />
        </form>
    );
}
