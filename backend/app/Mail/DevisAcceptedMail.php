<?php

namespace App\Mail;

use App\Models\Devis;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DevisAcceptedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Devis $devis
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Devis {$this->devis->numero} accepté - Confirmation",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.devis-accepted',
            with: [
                'devis' => $this->devis,
                'client' => $this->devis->client,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
