import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Input } from '@/components/atoms/input';
import { Alert } from '@/components/molecules/alert';
import { AuthShell } from '@/components/organisms/auth-shell';
import { focusRing } from '@/lib/styles';
import { cn } from '@/lib/utils';

type ForgotPasswordProps = {
    status?: string | null;
};

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const form = useForm({
        email: '',
    });

    const submit = () => {
        form.post('/forgot-password', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Forgot password" />

            <AuthShell>
                <div className="rounded-panel border-line bg-surface shadow-card border p-6 sm:p-8">
                    <span className="bg-brand-soft text-brand-ink inline-flex size-11 items-center justify-center rounded-full">
                        <Icon name="shield-check" size="md" />
                    </span>

                    <h1 className="text-h1 text-ink mt-4">
                        Reset your password
                    </h1>
                    <p className="text-small text-ink-muted mt-2">
                        Enter the email address on your account and we will send
                        you a secure link to choose a new password.
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
                            autoComplete="email"
                            autoFocus
                            required
                        />

                        <Button
                            type="submit"
                            size="lg"
                            fullWidth
                            loading={form.processing}
                        >
                            Send reset link
                        </Button>
                    </form>

                    <p className="text-small text-ink-muted border-line mt-6 border-t pt-5 text-center">
                        Remembered it?{' '}
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
