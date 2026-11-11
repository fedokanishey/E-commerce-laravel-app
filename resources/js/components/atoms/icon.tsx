import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { ControlSize } from '@/types/ui';

const iconPaths = {
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </>
    ),
    'shopping-bag': (
        <>
            <path d="M6 7h12l1 13H5L6 7Z" />
            <path d="M9 7a3 3 0 0 1 6 0" />
        </>
    ),
    heart: (
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    'chevron-left': <path d="m15 18-6-6 6-6" />,
    'chevron-right': <path d="m9 18 6-6-6-6" />,
    'chevron-down': <path d="m6 9 6 6 6-6" />,
    'chevron-up': <path d="m18 15-6-6-6 6" />,
    star: (
        <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
    ),
    minus: <path d="M5 12h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    check: <path d="M20 6 9 17l-5-5" />,
    'alert-circle': (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 17h.01" />
        </>
    ),
    info: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
        </>
    ),
    package: (
        <>
            <path d="M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7Z" />
            <path d="M3.3 8.7 12 13.5l8.7-4.8M12 21v-7.5" />
        </>
    ),
    store: (
        <>
            <path d="M4 10v10h16V10" />
            <path d="m3 10 2-6h14l2 6" />
            <path d="M9 20v-6h6v6" />
        </>
    ),
    truck: (
        <>
            <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
        </>
    ),
    'shield-check': (
        <>
            <path d="m12 3 8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" />
            <path d="m8.5 12 2.2 2.2 4.8-5" />
        </>
    ),
    'arrow-right': <path d="M4 12h16m-6-6 6 6-6 6" />,
    'arrow-up-right': <path d="M7 17 17 7M8 7h9v9" />,
    trash: (
        <>
            <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14" />
            <path d="M10 11v6M14 11v6" />
        </>
    ),
    filter: <path d="M4 5h16M7 12h10M10 19h4" />,
    sliders: (
        <>
            <path d="M4 7h16M4 17h16" />
            <circle cx="9" cy="7" r="2" />
            <circle cx="15" cy="17" r="2" />
        </>
    ),
    'map-pin': (
        <>
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
        </>
    ),
    'credit-card': (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 10h18M7 15h4" />
        </>
    ),
    bell: (
        <>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
        </>
    ),
    eye: (
        <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    'eye-off': (
        <>
            <path d="m3 3 18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 5.2A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.1 4.1" />
            <path d="M6.1 6.1C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4.2-.9" />
        </>
    ),
    grid: (
        <>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </>
    ),
    list: (
        <>
            <path d="M8 6h13M8 12h13M8 18h13" />
            <path d="M3 6h.01M3 12h.01M3 18h.01" />
        </>
    ),
    sparkles: (
        <>
            <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
            <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
        </>
    ),
    refresh: (
        <>
            <path d="M20 11a8 8 0 1 0-2.3 5.7" />
            <path d="M20 4v7h-7" />
        </>
    ),
    home: (
        <>
            <path d="m3 11 9-8 9 8" />
            <path d="M5 10v10h14V10" />
        </>
    ),
    'log-out': (
        <>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5M21 12H9" />
        </>
    ),
    settings: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-3v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3v-3h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h3v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21v3h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </>
    ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof iconPaths;

const sizeClasses: Record<ControlSize, string> = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
};

type IconProps = Omit<ComponentPropsWithoutRef<'svg'>, 'name'> & {
    name: IconName;
    size?: ControlSize | number;
    label?: string;
    directional?: boolean;
    filled?: boolean;
};

export function Icon({
    name,
    size = 'md',
    label,
    directional = false,
    filled = false,
    className,
    ...props
}: IconProps) {
    const sizeClass = typeof size === 'number' ? undefined : sizeClasses[size];

    return (
        <svg
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
            role={label ? 'img' : undefined}
            aria-hidden={label ? undefined : true}
            className={cn(
                'shrink-0',
                sizeClass,
                directional && 'rtl:-scale-x-100',
                className,
            )}
            style={
                typeof size === 'number'
                    ? { width: size, height: size }
                    : undefined
            }
            {...props}
        >
            {label && <title>{label}</title>}
            {iconPaths[name]}
        </svg>
    );
}
