import { Button } from '@/components/atoms/button';
import { IconButton } from '@/components/atoms/icon-button';
import { getPaginationItems } from '@/lib/pagination';
import { cn } from '@/lib/utils';
import type { PaginationProps } from '@/types/ui';

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
    className,
}: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const items = getPaginationItems(currentPage, totalPages, siblingCount);
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    return (
        <nav
            aria-label="Pagination"
            className={cn(
                'flex flex-wrap items-center justify-center gap-1.5',
                className,
            )}
        >
            <IconButton
                label="Previous page"
                icon="chevron-left"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
            />

            {items.map((item) =>
                typeof item === 'number' ? (
                    <Button
                        key={item}
                        type="button"
                        size="icon"
                        variant={item === currentPage ? 'primary' : 'ghost'}
                        aria-label={`Page ${item}`}
                        aria-current={item === currentPage ? 'page' : undefined}
                        onClick={() => goToPage(item)}
                    >
                        {item}
                    </Button>
                ) : (
                    <span
                        key={item}
                        aria-hidden="true"
                        className="text-ink-subtle inline-flex size-11 items-center justify-center"
                    >
                        …
                    </span>
                ),
            )}

            <IconButton
                label="Next page"
                icon="chevron-right"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
            />
        </nav>
    );
}
