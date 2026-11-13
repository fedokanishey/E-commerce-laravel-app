import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { PasswordInput } from '@/components/molecules/password-input';
import { AuthShell } from '@/components/organisms/auth-shell';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';

export default function Register() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = () => {
        form.post('/register', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Create an account" />

            <AuthShell>
                <div className="rounded-panel border-line bg-surface shadow-card border p-6 sm:p-8">
                    <p className="text-eyebrow text-brand uppercase">
                        Join the marketplace
                    </p>
                    <h1 className="text-h1 text-ink mt-2">Create an account</h1>
                    <p className="text-small text-ink-muted mt-2">
                        Save your favourite finds, follow orders, and check out
                        faster.
                    </p>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            submit();
                        }}
                        className="mt-6 space-y-4"
                    >
                        <Input
                            label="Full name"
                            name="name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            error={form.errors.name}
                            autoComplete="name"
                            autoFocus
                            required
                        />

                        <Input
                            label="Email address"
                            type="email"
                            name="email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            error={form.errors.email}
                            hint="Use an address you check regularly."
                            autoComplete="email"
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
                            hint="At least 8 characters."
                            autoComplete="new-password"
                            required
                        />

                        <PasswordInput
                            label="Confirm password"
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
                            Create account
                        </Button>

                        <p className="text-caption text-ink-muted text-center">
                            By creating an account, you agree to the
                            marketplace&apos;s terms and privacy policy.
                        </p>
                    </form>

                    <p className="text-small text-ink-muted border-line mt-6 border-t pt-5 text-center">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className={cn(
                                'text-brand hover:text-brand-ink rounded-sm font-semibold transition-colors',
                                focusRing,
                            )}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </AuthShell>
        </>
    );
}
