import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Alert } from '@/components/molecules/alert';
import { AuthShell } from '@/components/organisms/auth-shell';
import type { SharedData } from '@/types/ecommerce';

type VerifyEmailProps = {
    status?: string | null;
};

export default function VerifyEmail({ status }: VerifyEmailProps) {
    const { auth } = usePage<SharedData>().props;
    const form = useForm({});

    const resend = () => {
        form.post('/email/verification-notification', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Verify your email" />

            <AuthShell>
                <div className="rounded-panel border-line bg-surface shadow-card border p-6 sm:p-8">
                    <span className="bg-brand-soft text-brand-ink inline-flex size-12 items-center justify-center rounded-full">
                        <Icon name="shield-check" size="lg" />
                    </span>

                    <h1 className="text-h1 text-ink mt-4">Verify your email</h1>
                    <p className="text-small text-ink-muted mt-2">
                        We sent a verification link to{' '}
                        <span className="text-ink font-semibold">
                            {auth.user?.email}
                        </span>
                        . Open it to activate your account and continue to your
                        dashboard.
                    </p>

                    {status === 'verification-link-sent' && (
                        <Alert tone="success" className="mt-5">
                            A new verification link has been sent to your email
                            address.
                        </Alert>
                    )}

                    <div className="mt-6 space-y-3">
                        <Button
                            type="button"
                            size="lg"
                            fullWidth
                            loading={form.processing}
                            onClick={resend}
                        >
                            Resend verification email
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            fullWidth
                            onClick={() => router.post('/logout')}
                        >
                            Use a different account
                        </Button>
                    </div>

                    <p className="text-caption text-ink-muted mt-6 text-center">
                        If you do not see the email, check your spam or
                        promotions folder.
                    </p>
                </div>
            </AuthShell>
        </>
    );
}
