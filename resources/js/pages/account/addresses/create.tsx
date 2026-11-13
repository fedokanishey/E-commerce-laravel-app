import { Head } from '@inertiajs/react';
import { AddressForm } from '@/components/organisms/address-form';
import { AccountShell } from '@/components/organisms/account-shell';

export default function AddressCreate() {
    return (
        <>
            <Head title="Add an address" />

            <AccountShell
                title="Add an address"
                description="Save a delivery destination to use at checkout."
                eyebrow="Delivery"
            >
                <AddressForm />
            </AccountShell>
        </>
    );
}
