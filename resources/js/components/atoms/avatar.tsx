import { useEffect, useState } from 'react';
import { getInitials } from '@/lib/format';
import { cn } from '@/lib/utils';

const sizeClasses = {
    xs: 'size-6 text-[0.625rem]',
    sm: 'size-8 text-caption',
    md: 'size-10 text-small',
    lg: 'size-14 text-body',
    xl: 'size-20 text-h3',
} as const;

type AvatarProps = {
    name: string;
    src?: string | null;
    alt?: string;
    size?: keyof typeof sizeClasses;
    status?: 'online' | 'offline';
    className?: string;
};

export function Avatar({
    name,
    src,
    alt,
    size = 'md',
    status,
    className,
}: AvatarProps) {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [src]);

    const showImage = Boolean(src) && !failed;

    return (
        <span className={cn('relative inline-flex shrink-0', className)}>
            <span
                role={showImage ? undefined : 'img'}
                aria-label={showImage ? undefined : (alt ?? name)}
                className={cn(
                    'bg-brand-soft text-brand-ink flex items-center justify-center overflow-hidden rounded-full font-semibold',
                    sizeClasses[size],
                )}
            >
                {showImage ? (
                    <img
                        src={src ?? undefined}
                        alt={alt ?? name}
                        onError={() => setFailed(true)}
                        className="size-full object-cover"
                    />
                ) : (
                    <span aria-hidden="true">{getInitials(name)}</span>
                )}
            </span>

            {status && (
                <span
                    aria-hidden="true"
                    className={cn(
                        'border-surface absolute end-0 bottom-0 size-2.5 rounded-full border-2',
                        status === 'online' ? 'bg-success' : 'bg-ink-subtle',
                    )}
                />
            )}
        </span>
    );
}
