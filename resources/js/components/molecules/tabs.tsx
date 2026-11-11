import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Badge } from '@/components/atoms/badge';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';

export type TabItem = {
    id: string;
    label: string;
    count?: number;
    content?: ReactNode;
};

type TabsProps = {
    items: TabItem[];
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
    panelClassName?: string;
};

export function Tabs({
    items,
    value,
    onValueChange,
    className,
    panelClassName,
}: TabsProps) {
    const baseId = useId();
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const activeItem = items.find((item) => item.id === value) ?? items[0];

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const currentIndex = items.findIndex((item) => item.id === value);

        if (currentIndex === -1) {
            return;
        }

        const isRtl =
            event.currentTarget.closest('[dir]')?.getAttribute('dir') === 'rtl';

        let nextIndex = currentIndex;

        if (event.key === 'ArrowRight') {
            nextIndex = currentIndex + (isRtl ? -1 : 1);
        } else if (event.key === 'ArrowLeft') {
            nextIndex = currentIndex + (isRtl ? 1 : -1);
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = items.length - 1;
        } else {
            return;
        }

        event.preventDefault();

        const wrappedIndex = (nextIndex + items.length) % items.length;
        const nextItem = items[wrappedIndex];

        onValueChange(nextItem.id);
        tabRefs.current[wrappedIndex]?.focus();
    };

    return (
        <div className={className}>
            <div
                role="tablist"
                aria-label="Tabs"
                onKeyDown={handleKeyDown}
                className="border-line flex gap-6 overflow-x-auto border-b"
            >
                {items.map((item, index) => {
                    const isActive = item.id === activeItem?.id;

                    return (
                        <button
                            key={item.id}
                            ref={(element) => {
                                tabRefs.current[index] = element;
                            }}
                            id={`${baseId}-tab-${item.id}`}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`${baseId}-panel-${item.id}`}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => onValueChange(item.id)}
                            className={cn(
                                'text-small -mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-1 py-3 font-medium transition-colors',
                                focusRing,
                                isActive
                                    ? 'border-brand text-ink'
                                    : 'text-ink-muted hover:text-ink border-transparent',
                            )}
                        >
                            {item.label}
                            {item.count != null && (
                                <Badge variant="neutral" size="sm">
                                    {item.count}
                                </Badge>
                            )}
                        </button>
                    );
                })}
            </div>

            {activeItem?.content != null && (
                <div
                    id={`${baseId}-panel-${activeItem.id}`}
                    role="tabpanel"
                    aria-labelledby={`${baseId}-tab-${activeItem.id}`}
                    tabIndex={0}
                    className={cn('pt-4', focusRing, panelClassName)}
                >
                    {activeItem.content}
                </div>
            )}
        </div>
    );
}
