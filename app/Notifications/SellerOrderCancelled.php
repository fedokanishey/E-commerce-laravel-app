<?php

namespace App\Notifications;

use App\Models\SellerOrder;
use Illuminate\Notifications\Notification;

class SellerOrderCancelled extends Notification
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
            'type' => 'seller_order_cancelled',
            'seller_order_id' => $this->sellerOrder->id,
            'order_number' => $this->sellerOrder->order->number,
            'message' => "Order {$this->sellerOrder->order->number} was cancelled by the customer.",
        ];
    }
}
