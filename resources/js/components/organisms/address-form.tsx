import { Link, useForm } from '@inertiajs/react';
import { Button, buttonStyles } from '@/components/atoms/button';
import { Checkbox } from '@/components/atoms/checkbox';
import { Icon } from '@/components/atoms/icon';
import { Input } from '@/components/atoms/input';
import { cardSurface } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { Address } from '@/types/ecommerce';

type AddressFormProps = {
    address?: Address;
};

export function AddressForm({ address }: AddressFormProps) {
    const form = useForm({
        label: address?.label ?? '',
        recipient_name: address?.recipient_name ?? '',
        phone: address?.phone ?? '',
        address_line_1: address?.address_line_1 ?? '',
        address_line_2: address?.address_line_2 ?? '',
        city: address?.city ?? '',
        state: address?.state ?? '',
        postal_code: address?.postal_code ?? '',
        country: address?.country ?? '',
        is_default: address?.is_default ?? false,
    });

    const submit = () => {
        if (address) {
            form.patch(`/addresses/${address.id}`, {
                preserveScroll: true,
            });

            return;
        }

        form.post('/addresses');
    };

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
            className={cn(cardSurface, 'p-5 sm:p-6')}
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <Input
                    label="Address label"
                    name="label"
                    value={form.data.label}
                    onChange={(event) =>
                        form.setData('label', event.target.value)
                    }
                    error={form.errors.label}
                    placeholder="Home, Work, etc."
                    required
                    autoFocus
                />

                <Input
                    label="Recipient name"
                    name="recipient_name"
                    value={form.data.recipient_name}
                    onChange={(event) =>
                        form.setData('recipient_name', event.target.value)
                    }
                    error={form.errors.recipient_name}
                    autoComplete="name"
                    required
                />

                <Input
                    label="Phone number"
                    name="phone"
                    type="tel"
                    value={form.data.phone}
                    onChange={(event) =>
                        form.setData('phone', event.target.value)
                    }
                    error={form.errors.phone}
                    autoComplete="tel"
                    required
                />

                <Input
                    label="Country"
                    name="country"
                    value={form.data.country}
                    onChange={(event) =>
                        form.setData('country', event.target.value)
                    }
                    error={form.errors.country}
                    autoComplete="country-name"
                    required
                />

                <Input
                    label="Address line 1"
                    name="address_line_1"
                    value={form.data.address_line_1}
                    onChange={(event) =>
                        form.setData('address_line_1', event.target.value)
                    }
                    error={form.errors.address_line_1}
                    autoComplete="address-line1"
                    containerClassName="sm:col-span-2"
                    required
                />

                <Input
                    label="Address line 2"
                    name="address_line_2"
                    value={form.data.address_line_2}
                    onChange={(event) =>
                        form.setData('address_line_2', event.target.value)
                    }
                    error={form.errors.address_line_2}
                    autoComplete="address-line2"
                    hint="Apartment, suite, floor, or landmark (optional)"
                    containerClassName="sm:col-span-2"
                />

                <Input
                    label="City"
                    name="city"
                    value={form.data.city}
                    onChange={(event) =>
                        form.setData('city', event.target.value)
                    }
                    error={form.errors.city}
                    autoComplete="address-level2"
                    required
                />

                <Input
                    label="State or region"
                    name="state"
                    value={form.data.state}
                    onChange={(event) =>
                        form.setData('state', event.target.value)
                    }
                    error={form.errors.state}
                    autoComplete="address-level1"
                    required
                />

                <Input
                    label="Postal code"
                    name="postal_code"
                    value={form.data.postal_code}
                    onChange={(event) =>
                        form.setData('postal_code', event.target.value)
                    }
                    error={form.errors.postal_code}
                    autoComplete="postal-code"
                    required
                />
            </div>

            <div className="border-line mt-5 border-t pt-5">
                <Checkbox
                    label="Set as my default delivery address"
                    checked={form.data.is_default}
                    onChange={(event) =>
                        form.setData('is_default', event.target.checked)
                    }
                />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button type="submit" loading={form.processing}>
                    {address ? 'Save changes' : 'Add address'}
                </Button>

                <Link
                    href="/addresses"
                    className={buttonStyles({ variant: 'ghost' })}
                >
                    <Icon name="chevron-left" size="sm" />
                    Back to addresses
                </Link>
            </div>
        </form>
    );
}
