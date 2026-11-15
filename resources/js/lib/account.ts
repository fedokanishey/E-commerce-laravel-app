import type { IconName } from '@/components/atoms/icon';
import type {
    AccountNotification,
    Address,
    OrderStatus,
} from '@/types/ecommerce';
import type { Tone } from '@/types/ui';

type StatusTone = Tone;

const orderStatusLabels: Record<OrderStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

const orderStatusTones: Record<OrderStatus, StatusTone> = {
    pending: 'warning',
    processing: 'info',
    shipped: 'brand',
    delivered: 'success',
    cancelled: 'danger',
};

export function orderStatusLabel(status: OrderStatus): string {
    return orderStatusLabels[status] ?? status;
}

export function orderStatusTone(status: OrderStatus): StatusTone {
    return orderStatusTones[status] ?? 'neutral';
}

export function paymentStatusTone(
    status: 'pending' | 'paid' | 'failed' | 'refunded' | 'voided',
): StatusTone {
    return status === 'paid'
        ? 'success'
        : status === 'failed'
          ? 'danger'
          : status === 'refunded'
            ? 'info'
            : status === 'voided'
              ? 'neutral'
              : 'warning';
}

const paymentStatusLabels: Record<
    'pending' | 'paid' | 'failed' | 'refunded' | 'voided',
    string
> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    voided: 'Voided',
};

export function paymentStatusLabel(
    status: 'pending' | 'paid' | 'failed' | 'refunded' | 'voided',
): string {
    return paymentStatusLabels[status] ?? status;
}

export function formatAddress(address: Address): string[] {
    return [
        address.address_line_1,
        address.address_line_2,
        `${address.city}, ${address.state} ${address.postal_code}`,
        address.country,
    ].filter((line): line is string => Boolean(line));
}

export function formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

type NotificationMeta = {
    title: string;
    icon: IconName;
    href: string | null;
    linkLabel: string | null;
};

export function notificationMeta(
    notification: AccountNotification,
): NotificationMeta {
    const { data } = notification;

    switch (data.type) {
        case 'order_placed':
            return {
                title: 'Order placed',
                icon: 'package',
                href: data.order_id ? `/orders/${data.order_id}` : null,
                linkLabel: 'View order',
            };
        case 'order_cancelled':
            return {
                title: 'Order cancelled',
                icon: 'package',
                href: data.order_id ? `/orders/${data.order_id}` : null,
                linkLabel: 'View order',
            };
        case 'seller_order_status_updated':
            return {
                title: 'Order status updated',
                icon: 'truck',
                href: null,
                linkLabel: null,
            };
        case 'new_seller_order':
            return {
                title: 'New order received',
                icon: 'store',
                href: data.seller_order_id
                    ? `/seller/orders/${data.seller_order_id}`
                    : null,
                linkLabel: 'View seller order',
            };
        case 'seller_order_cancelled':
            return {
                title: 'Seller order cancelled',
                icon: 'package',
                href: data.seller_order_id
                    ? `/seller/orders/${data.seller_order_id}`
                    : null,
                linkLabel: 'View seller order',
            };
        default:
            return {
                title: 'Account update',
                icon: 'info',
                href: null,
                linkLabel: null,
            };
    }
}

export function relativeTime(value: string): string {
    const date = new Date(value);
    const seconds = Math.round((date.getTime() - Date.now()) / 1000);
    const formatter = new Intl.RelativeTimeFormat('en-US', {
        numeric: 'auto',
    });

    const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
        ['year', 31536000],
        ['month', 2592000],
        ['week', 604800],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
    ];

    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) {
            return formatter.format(Math.round(seconds / size), unit);
        }
    }

    return formatter.format(seconds, 'second');
}
