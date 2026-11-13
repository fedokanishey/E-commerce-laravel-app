import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { PasswordInput } from '@/components/molecules/password-input';
import { AccountShell } from '@/components/organisms/account-shell';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';

export default function Password() {
    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = () => {
        form.put('/settings/password', {
            preserveScroll: true,
            onFinish: () =>
                form.reset(
                    'current_password',
                    'password',
                    'password_confirmation',
                ),
        });
    };

    return (
        <>
            <Head title="Password settings" />

            <AccountShell
                title="Password"
                description="Use a strong, unique password to protect your account."
                eyebrow="Settings"
            >
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit();
                    }}
                    className={cn(cardSurface, 'p-5 sm:p-6')}
                >
                    <div className="max-w-xl space-y-4">
                        <PasswordInput
                            label="Current password"
                            name="current_password"
                            value={form.data.current_password}
                            onChange={(event) =>
                                form.setData(
                                    'current_password',
                                    event.target.value,
                                )
                            }
                            error={form.errors.current_password}
                            autoComplete="current-password"
                            required
                        />

                        <PasswordInput
                            label="New password"
                            name="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            error={form.errors.password}
                            hint="Choose something you do not use anywhere else."
                            autoComplete="new-password"
                            required
                        />

                        <PasswordInput
                            label="Confirm new password"
                            name="password_confirmation"
                            value={form.data.password_confirmation}
                            onChange={(event) =>
                                form.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            error={form.errors.password_confirmation}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className="border-line mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
                        <Button type="submit" loading={form.processing}>
                            <Icon name="shield-check" size="sm" />
                            Update password
                        </Button>

                        <p className="text-caption text-ink-muted">
                            You will stay signed in on this device.
                        </p>
                    </div>
                </form>
            </AccountShell>
        </>
    );
}
