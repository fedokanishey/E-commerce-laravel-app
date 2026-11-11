import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';
import { Icon } from './icon';

type TextLinkProps = {
    href: string;
    children: ReactNode;
    external?: boolean;
    showIcon?: boolean;
    className?: string;
};

export function TextLink({
    href,
    children,
    external = false,
    showIcon = false,
    className,
}: TextLinkProps) {
    const isExternal =
        external ||
        href.startsWith('#') ||
        /^(https?:|mailto:|tel:)/.test(href);

    const classes = cn(
        'group text-brand hover:text-brand-ink inline-flex items-center gap-1 rounded-sm underline-offset-4 transition-colors hover:underline',
        focusRing,
        className,
    );

    const content = (
        <>
            {children}
            {showIcon && (
                <Icon
                    name={isExternal ? 'arrow-up-right' : 'arrow-right'}
                    size="sm"
                    directional={!isExternal}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
            )}
        </>
    );

    if (isExternal) {
        return (
            <a
                href={href}
                target={href.startsWith('#') ? undefined : '_blank'}
                rel={href.startsWith('#') ? undefined : 'noreferrer'}
                className={classes}
            >
                {content}
            </a>
        );
    }

    return (
        <Link href={href} className={classes}>
            {content}
        </Link>
    );
}
