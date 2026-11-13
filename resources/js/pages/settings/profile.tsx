import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Alert } from '@/components/molecules/alert';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Input } from '@/components/atoms/input';
import { Modal } from '@/components/molecules/modal';
import { PasswordInput } from '@/components/molecules/password-input';
import { AccountShell } from '@/components/organisms/account-shell';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types/ecommerce';

type ProfileProps = {
    mustVerifyEmail: boolean;
    status?: string | null;
};

type ProfilePage = SharedData & {
    errors: {
        userDeletion?: {
            password?: string;
        };
    };
};

export default function Profile({ mustVerifyEmail }: ProfileProps) {
    const page = usePage<ProfilePage>();
    const { auth } = page.props;
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [resending, setResending] = useState(false);

    const form = useForm({
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
    });

    const deleteForm = useForm({
        password: '',
    });

    const submitProfile = () => {
        form.patch('/settings/profile', {
            preserveScroll: true,
        });
    };

    const resendVerification = () => {
        setResending(true);

        router.post(
            '/email/verification-notification',
            {},
            {
                preserveScroll: true,
                onFinish: () => setResending(false),
            },
        );
    };

    const deleteAccount = () => {
        deleteForm.delete('/settings/profile', {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => deleteForm.reset('password'),
        });
    };

    const needsVerification =
        mustVerifyEmail && auth.user?.email_verified_at === null;
    const deletionError =
        page.props.errors.userDeletion?.password ?? deleteForm.errors.password;

    return (
        <>
            <Head title="Profile settings" />

            <AccountShell
                title="Profile"
                description="Keep your account details up to date."
                eyebrow="Settings"
            >
                <div className="space-y-5">
                    {needsVerification && (
                        <Alert
                            tone="warning"
                            title="Verify your email address"
                            action={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    loading={resending}
                                    onClick={resendVerification}
                                >
                                    Resend link
                                </Button>
                            }
                        >
                            We sent a verification link to {auth.user?.email}.
                            Verify your email to secure your account.
                        </Alert>
                    )}

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            submitProfile();
                        }}
                        className={cn(cardSurface, 'p-5 sm:p-6')}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-h3 text-ink">
                                    Personal details
                                </h2>
                                <p className="text-caption text-ink-muted mt-1">
                                    This information appears on your account and
                                    orders.
                                </p>
                            </div>

                            {auth.user?.email_verified_at ? (
                                <Badge variant="success" size="sm" dot>
                                    Email verified
                                </Badge>
                            ) : (
                                <Badge variant="warning" size="sm" dot>
                                    Email unverified
                                </Badge>
                            )}
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <Input
                                label="Full name"
                                name="name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                error={form.errors.name}
                                autoComplete="name"
                                required
                            />

                            <Input
                                label="Email address"
                                name="email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                error={form.errors.email}
                                hint="Changing your email requires verification again."
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="mt-6">
                            <Button type="submit" loading={form.processing}>
                                <Icon name="check" size="sm" />
                                Save changes
                            </Button>
                        </div>
                    </form>

                    <section
                        className={cn(
                            cardSurface,
                            'border-danger/20 p-5 sm:p-6',
                        )}
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-h3 text-danger-ink">
                                    Delete account
                                </h2>
                                <p className="text-small text-ink-muted mt-1 max-w-xl">
                                    Permanently remove your account and personal
                                    data. Order records may be retained where
                                    required by law.
                                </p>
                            </div>

                            <Button
                                variant="danger"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <Icon name="trash" size="sm" />
                                Delete account
                            </Button>
                        </div>
                    </section>
                </div>
            </AccountShell>

            <Modal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                title="Delete your account?"
                description="This action permanently removes your account and cannot be undone."
                size="sm"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                        >
                            Keep account
                        </Button>
                        <Button
                            variant="danger"
                            loading={deleteForm.processing}
                            onClick={deleteAccount}
                        >
                            Delete account
                        </Button>
                    </>
                }
            >
                <p className="text-small text-ink-muted">
                    Enter your password to confirm. You will be signed out
                    immediately.
                </p>

                <div className="mt-4">
                    <PasswordInput
                        label="Password"
                        name="delete_password"
                        value={deleteForm.data.password}
                        onChange={(event) =>
                            deleteForm.setData('password', event.target.value)
                        }
                        error={deletionError}
                        autoComplete="current-password"
                        required
                    />
                </div>
            </Modal>
        </>
    );
}
