import { Head, Link, useForm } from '@inertiajs/react';
import { Alert } from '@/components/molecules/alert';
import { Button } from '@/components/atoms/button';
import { Checkbox } from '@/components/atoms/checkbox';
import { Input } from '@/components/atoms/input';
import { PasswordInput } from '@/components/molecules/password-input';
import { AuthShell } from '@/components/organisms/auth-shell';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';

type LoginProps = {
    status?: string | null;
};

export default function Login({ status }: LoginProps) {
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = () => {
        form.post('/login', {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <>
            <Head title="Sign in" />

            <AuthShell>
                <div className="rounded-panel border-line bg-surface shadow-card border p-6 sm:p-8">
                    <p className="text-eyebrow text-brand uppercase">
                        Welcome back
                    </p>
                    <h1 className="text-h1 text-ink mt-2">Sign in</h1>
                    <p className="text-small text-ink-muted mt-2">
                        Pick up where you left off, manage your orders, and keep
                        your wishlist close.
                    </p>

                    {status && (
                        <Alert tone="success" className="mt-5">
                            {status}
                        </Alert>
                    )}

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
                            autoFocus
                            required
                        />

                        <PasswordInput
                            label="Password"
                            name="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            error={form.errors.password}
                            autoComplete="current-password"
                            required
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <Checkbox
                                label="Remember me"
                                checked={form.data.remember}
                                onChange={(event) =>
                                    form.setData(
                                        'remember',
                                        event.target.checked,
                                    )
                                }
                            />

                            <Link
                                href="/forgot-password"
                                className={cn(
                                    'text-small text-brand hover:text-brand-ink rounded-sm font-medium transition-colors',
                                    focusRing,
                                )}
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            fullWidth
                            loading={form.processing}
                        >
                            Sign in
                        </Button>
                    </form>

                    <p className="text-small text-ink-muted border-line mt-6 border-t pt-5 text-center">
                        New to the marketplace?{' '}
                        <Link
                            href="/register"
                            className={cn(
                                'text-brand hover:text-brand-ink rounded-sm font-semibold transition-colors',
                                focusRing,
                            )}
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </AuthShell>
        </>
    );
}
