import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/atoms/badge';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { EmptyState } from '@/components/molecules/empty-state';
import { Modal } from '@/components/molecules/modal';
import { AccountShell } from '@/components/organisms/account-shell';
import { formatAddress } from '@/lib/account';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { Address } from '@/types/ecommerce';

type AddressesIndexProps = {
    addresses: Address[];
};

export default function AddressesIndex({ addresses }: AddressesIndexProps) {
    const [addressToDelete, setAddressToDelete] = useState<Address | null>(
        null,
    );
    const [deleting, setDeleting] = useState(false);

    const deleteAddress = () => {
        if (!addressToDelete) {
            return;
        }

        setDeleting(true);

        router.delete(`/addresses/${addressToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setAddressToDelete(null),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <>
            <Head title="Your addresses" />

            <AccountShell
                title="Addresses"
                description="Manage the delivery addresses saved to your account."
                eyebrow="Delivery"
                action={
                    <Link href="/addresses/create" className={buttonStyles()}>
                        <Icon name="plus" size="sm" />
                        Add address
                    </Link>
                }
            >
                {addresses.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {addresses.map((address) => (
                            <article
                                key={address.id}
                                className={cn(cardSurface, 'flex flex-col p-5')}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-small text-ink font-semibold">
                                                {address.label}
                                            </h2>
                                            {address.is_default && (
                                                <Badge
                                                    variant="brand"
                                                    size="sm"
                                                >
                                                    Default
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-caption text-ink-muted mt-1">
                                            {address.recipient_name}
                                        </p>
                                    </div>

                                    <span className="bg-surface-muted text-ink-muted flex size-9 shrink-0 items-center justify-center rounded-full">
                                        <Icon name="map-pin" size="md" />
                                    </span>
                                </div>

                                <address className="text-small text-ink-muted mt-4 space-y-0.5 not-italic">
                                    {formatAddress(address).map((line) => (
                                        <span key={line} className="block">
                                            {line}
                                        </span>
                                    ))}
                                    <span className="block pt-1">
                                        {address.phone}
                                    </span>
                                </address>

                                <div className="border-line mt-5 flex items-center gap-2 border-t pt-4">
                                    <Link
                                        href={`/addresses/${address.id}/edit`}
                                        className={buttonStyles({
                                            variant: 'outline',
                                            size: 'sm',
                                        })}
                                    >
                                        <Icon name="settings" size="sm" />
                                        Edit
                                    </Link>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-danger-ink hover:bg-danger-soft hover:text-danger-ink"
                                        onClick={() =>
                                            setAddressToDelete(address)
                                        }
                                    >
                                        <Icon name="trash" size="sm" />
                                        Remove
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No saved addresses"
                        description="Add a delivery address to make checkout quicker."
                        icon="map-pin"
                        action={
                            <Link
                                href="/addresses/create"
                                className={buttonStyles()}
                            >
                                Add your first address
                            </Link>
                        }
                    />
                )}
            </AccountShell>

            <Modal
                open={addressToDelete !== null}
                onClose={() => setAddressToDelete(null)}
                title="Remove this address?"
                description={
                    addressToDelete
                        ? `${addressToDelete.label} — ${addressToDelete.recipient_name}`
                        : undefined
                }
                size="sm"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setAddressToDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            loading={deleting}
                            onClick={deleteAddress}
                        >
                            Remove address
                        </Button>
                    </>
                }
            >
                <p className="text-small text-ink-muted">
                    You can add this address again later. Existing orders keep
                    their original delivery details.
                </p>
            </Modal>
        </>
    );
}
