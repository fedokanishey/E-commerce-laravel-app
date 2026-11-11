<?php

namespace App\Notifications;

use App\Models\SellerOrder;
use Illuminate\Notifications\Notification;

class SellerOrderStatusUpdated extends Notification
{
    public function __construct(public SellerOrder $sellerOrder) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'seller_order_status_updated',
            'seller_order_id' => $this->sellerOrder->id,
            'status' => $this->sellerOrder->status->value,
            'order_number' => $this->sellerOrder->order->number,
            'message' => "Your order {$this->sellerOrder->order->number} is now {$this->sellerOrder->status->label()}.",
        ];
    }
}
