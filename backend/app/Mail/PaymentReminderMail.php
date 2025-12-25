<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReminderMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invoice $invoice,
        public int $daysOverdue = 0
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->daysOverdue > 0
            ? "Rappel: Facture {$this->invoice->numero} en retard de {$this->daysOverdue} jours"
            : "Rappel: Facture {$this->invoice->numero} arrive à échéance";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-reminder',
            with: [
                'invoice' => $this->invoice,
                'client' => $this->invoice->client,
                'daysOverdue' => $this->daysOverdue,
                'amountDue' => $this->invoice->total - $this->invoice->amount_paid,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
