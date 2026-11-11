<?php

namespace App\Models;

use Database\Factories\AddressFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $label
 * @property string $recipient_name
 * @property string $phone
 * @property string $address_line_1
 * @property string|null $address_line_2
 * @property string $city
 * @property string $state
 * @property string $postal_code
 * @property string $country
 * @property bool $is_default
 */
#[Fillable([
    'label',
    'recipient_name',
    'phone',
    'address_line_1',
    'address_line_2',
    'city',
    'state',
    'postal_code',
    'country',
    'is_default',
])]
class Address extends Model
{
    /** @use HasFactory<AddressFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string|null>
     */
    public function toShippingSnapshot(): array
    {
        return [
            'shipping_recipient_name' => $this->recipient_name,
            'shipping_phone' => $this->phone,
            'shipping_address_line_1' => $this->address_line_1,
            'shipping_address_line_2' => $this->address_line_2,
            'shipping_city' => $this->city,
            'shipping_state' => $this->state,
            'shipping_postal_code' => $this->postal_code,
            'shipping_country' => $this->country,
        ];
    }
}
