export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

function range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function getPaginationItems(
    currentPage: number,
    totalPages: number,
    siblingCount = 1,
): PaginationItem[] {
    const visiblePageCount = siblingCount * 2 + 5;

    if (totalPages <= visiblePageCount) {
        return range(1, totalPages);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);
    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
        const leftItemCount = 3 + siblingCount * 2;

        return [...range(1, leftItemCount), 'ellipsis-end', totalPages];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
        const rightItemCount = 3 + siblingCount * 2;

        return [
            1,
            'ellipsis-start',
            ...range(totalPages - rightItemCount + 1, totalPages),
        ];
    }

    return [
        1,
        'ellipsis-start',
        ...range(leftSibling, rightSibling),
        'ellipsis-end',
        totalPages,
    ];
}
