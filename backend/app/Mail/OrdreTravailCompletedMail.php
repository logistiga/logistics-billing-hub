<?php

namespace App\Mail;

use App\Models\OrdreTravail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrdreTravailCompletedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public OrdreTravail $ordreTravail
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Ordre de travail {$this->ordreTravail->numero} terminé",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ordre-travail-completed',
            with: [
                'ordre' => $this->ordreTravail,
                'client' => $this->ordreTravail->client,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
