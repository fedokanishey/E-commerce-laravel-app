import type { ComponentPropsWithoutRef } from 'react';
import { Button, type ButtonVariant } from './button';
import { Icon, type IconName } from './icon';

type IconButtonProps = Omit<
    ComponentPropsWithoutRef<typeof Button>,
    'children' | 'size' | 'variant' | 'aria-label'
> & {
    label: string;
    icon: IconName;
    variant?: Extract<
        ButtonVariant,
        'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    >;
};

export function IconButton({
    label,
    icon,
    variant = 'ghost',
    ...props
}: IconButtonProps) {
    return (
        <Button
            type="button"
            size="icon"
            variant={variant}
            aria-label={label}
            title={label}
            {...props}
        >
            <Icon name={icon} size="md" />
        </Button>
    );
}
