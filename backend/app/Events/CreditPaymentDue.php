<?php

namespace App\Events;

use App\Models\Credit;
use App\Models\CreditPayment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CreditPaymentDue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Credit $credit,
        public CreditPayment $payment,
        public int $daysUntilDue
    ) {}
}
