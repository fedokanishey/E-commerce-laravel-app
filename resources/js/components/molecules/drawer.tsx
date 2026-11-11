import {
    useId,
    type MouseEvent,
    type ReactNode,
    type SyntheticEvent,
} from 'react';
import { IconButton } from '@/components/atoms/icon-button';
import { useDialog } from '@/hooks/use-dialog';
import { cn } from '@/lib/utils';

type DrawerProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    side?: 'start' | 'end';
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
};

export function Drawer({
    open,
    onClose,
    title,
    description,
    side = 'end',
    children,
    footer,
    className,
}: DrawerProps) {
    const dialogRef = useDialog(open, onClose);
    const titleId = useId();
    const descriptionId = useId();

    const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
        event.preventDefault();
        onClose();
    };

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            onCancel={handleCancel}
            onClick={handleBackdropClick}
            className={cn(
                'border-line bg-surface text-ink shadow-panel backdrop:bg-overlay open:animate-fade-in m-0 h-dvh max-h-none w-[min(22rem,90vw)] max-w-none p-0',
                side === 'end' ? 'ms-auto border-s' : 'me-auto border-e',
                className,
            )}
        >
            <div className="flex h-full flex-col">
                <div className="border-line flex items-start justify-between gap-4 border-b px-5 py-4">
                    <div className="min-w-0">
                        <h2 id={titleId} className="text-h3 text-ink">
                            {title}
                        </h2>
                        {description && (
                            <p
                                id={descriptionId}
                                className="text-small text-ink-muted mt-1"
                            >
                                {description}
                            </p>
                        )}
                    </div>

                    <IconButton
                        label="Close menu"
                        icon="close"
                        variant="ghost"
                        onClick={onClose}
                    />
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5">
                    {children}
                </div>

                {footer && (
                    <div className="border-line border-t px-5 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </dialog>
    );
}
