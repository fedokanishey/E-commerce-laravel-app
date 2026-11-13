import { Head } from '@inertiajs/react';
import { AddressForm } from '@/components/organisms/address-form';
import { AccountShell } from '@/components/organisms/account-shell';
import type { Address } from '@/types/ecommerce';

type AddressEditProps = {
    address: Address;
};

export default function AddressEdit({ address }: AddressEditProps) {
    return (
        <>
            <Head title={`Edit ${address.label}`} />

            <AccountShell
                title={`Edit ${address.label}`}
                description="Update the details we use to deliver your orders."
                eyebrow="Delivery"
            >
                <AddressForm address={address} />
            </AccountShell>
        </>
    );
}
