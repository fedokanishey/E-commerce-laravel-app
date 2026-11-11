import {
    useId,
    type MouseEvent,
    type ReactNode,
    type SyntheticEvent,
} from 'react';
import { IconButton } from '@/components/atoms/icon-button';
import { useDialog } from '@/hooks/use-dialog';
import { cn } from '@/lib/utils';

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
} as const;

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: keyof typeof sizeClasses;
    className?: string;
};

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    className,
}: ModalProps) {
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
                'rounded-panel border-line bg-surface text-ink shadow-panel backdrop:bg-overlay open:animate-rise-in m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-hidden border p-0 backdrop:backdrop-blur-[2px]',
                sizeClasses[size],
                className,
            )}
        >
            <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
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
                        label="Close dialog"
                        icon="close"
                        variant="ghost"
                        onClick={onClose}
                    />
                </div>

                <div className="overflow-y-auto px-5 py-5">{children}</div>

                {footer && (
                    <div className="border-line flex flex-wrap justify-end gap-2 border-t px-5 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </dialog>
    );
}
