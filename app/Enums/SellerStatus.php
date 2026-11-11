<?php

namespace App\Enums;

enum SellerStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending review',
            self::Active => 'Active',
            self::Suspended => 'Suspended',
        };
    }

    public function canSell(): bool
    {
        return $this === self::Active;
    }
}
