<?php

namespace App\Notifications;

use App\Models\SellerOrder;
use Illuminate\Notifications\Notification;

class NewSellerOrder extends Notification
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
            'type' => 'new_seller_order',
            'seller_order_id' => $this->sellerOrder->id,
            'order_number' => $this->sellerOrder->order->number,
            'total' => $this->sellerOrder->total,
            'message' => "You received a new order ({$this->sellerOrder->order->number}).",
        ];
    }
}
