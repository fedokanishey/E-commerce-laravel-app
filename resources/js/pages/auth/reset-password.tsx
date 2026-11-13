import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { PasswordInput } from '@/components/molecules/password-input';
import { AuthShell } from '@/components/organisms/auth-shell';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';

type ResetPasswordProps = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const form = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = () => {
        form.post('/reset-password', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Choose a new password" />

            <AuthShell>
                <div className="rounded-panel border-line bg-surface shadow-card border p-6 sm:p-8">
                    <p className="text-eyebrow text-brand uppercase">
                        Almost there
                    </p>
                    <h1 className="text-h1 text-ink mt-2">
                        Choose a new password
                    </h1>
                    <p className="text-small text-ink-muted mt-2">
                        Set a strong password you have not used before. You will
                        be signed in with it from now on.
                    </p>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            submit();
                        }}
                        className="mt-6 space-y-4"
                    >
                        <Input
                            label="Email address"
                            type="email"
                            name="email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            error={form.errors.email}
                            autoComplete="username"
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
                            hint="At least 8 characters."
                            autoComplete="new-password"
                            autoFocus
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

                        <Button
                            type="submit"
                            size="lg"
                            fullWidth
                            loading={form.processing}
                        >
                            Update password
                        </Button>
                    </form>

                    <p className="text-small text-ink-muted border-line mt-6 border-t pt-5 text-center">
                        <Link
                            href="/login"
                            className={cn(
                                'text-brand hover:text-brand-ink rounded-sm font-semibold transition-colors',
                                focusRing,
                            )}
                        >
                            Back to sign in
                        </Link>
                    </p>
                </div>
            </AuthShell>
        </>
    );
}
