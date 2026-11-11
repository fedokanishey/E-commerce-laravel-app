import { Skeleton } from '@/components/atoms/skeleton';
import { cn } from '@/lib/utils';

type ProductCardSkeletonProps = {
    layout?: 'grid' | 'list';
    className?: string;
};

export function ProductCardSkeleton({
    layout = 'grid',
    className,
}: ProductCardSkeletonProps) {
    if (layout === 'list') {
        return (
            <div
                className={cn(
                    'rounded-card border-line bg-surface flex overflow-hidden border',
                    className,
                )}
            >
                <Skeleton className="min-h-40 w-28 shrink-0 rounded-none sm:w-40" />

                <div className="flex flex-1 flex-col gap-3 p-4">
                    <Skeleton variant="text" className="w-1/4" />
                    <Skeleton variant="text" className="w-4/5" />
                    <Skeleton variant="text" className="w-1/2" />
                    <Skeleton className="mt-auto h-9 w-28" />
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'rounded-card border-line bg-surface overflow-hidden border',
                className,
            )}
        >
            <Skeleton className="aspect-[4/5] rounded-none" />

            <div className="space-y-3 p-4">
                <Skeleton variant="text" className="w-1/3" />
                <Skeleton variant="text" className="w-4/5" />
                <Skeleton variant="text" className="w-1/2" />
                <Skeleton className="h-9 w-full" />
            </div>
        </div>
    );
}
