import { Link } from '@inertiajs/react';
import { Icon } from '@/components/atoms/icon';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
    label: string;
    href?: string;
};

type BreadcrumbsProps = {
    items: BreadcrumbItem[];
    className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="text-caption flex flex-wrap items-center gap-1.5">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={`${item.label}-${index}`}>
                            <div className="flex items-center gap-1.5">
                                {index > 0 && (
                                    <Icon
                                        name="chevron-right"
                                        size="sm"
                                        directional
                                        className="text-ink-subtle"
                                    />
                                )}

                                {item.href && !isLast ? (
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'text-ink-muted hover:text-ink rounded-sm transition-colors',
                                            focusRing,
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span
                                        aria-current={
                                            isLast ? 'page' : undefined
                                        }
                                        className={cn(
                                            isLast
                                                ? 'text-ink font-medium'
                                                : 'text-ink-muted',
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
