import { useState, type ComponentProps } from 'react';
import { Icon } from '@/components/atoms/icon';
import { Input } from '@/components/atoms/input';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';

type PasswordInputProps = Omit<
    ComponentProps<typeof Input>,
    'type' | 'endSlot'
>;

export function PasswordInput(props: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <Input
            {...props}
            type={visible ? 'text' : 'password'}
            endSlot={
                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    aria-pressed={visible}
                    className={cn(
                        'rounded-control text-ink-subtle hover:bg-surface-muted hover:text-ink inline-flex size-8 items-center justify-center transition-colors',
                        focusRing,
                    )}
                >
                    <Icon name={visible ? 'eye-off' : 'eye'} size="sm" />
                </button>
            }
        />
    );
}
