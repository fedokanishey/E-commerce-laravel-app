import { useEffect, useRef } from 'react';

export function useDialog(open: boolean, onClose: () => void) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;

        if (!dialog) {
            return;
        }

        if (open && !dialog.open) {
            dialog.showModal();
        }

        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        const dialog = ref.current;

        if (!dialog) {
            return;
        }

        const handleClose = () => {
            if (open) {
                onClose();
            }
        };

        dialog.addEventListener('close', handleClose);

        return () => dialog.removeEventListener('close', handleClose);
    }, [onClose, open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    return ref;
}
