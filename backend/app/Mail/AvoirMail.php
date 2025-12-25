<?php

namespace App\Mail;

use App\Models\Avoir;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class AvoirMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Avoir $avoir,
        public ?string $pdfPath = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Avoir {$this->avoir->numero} - LogistiGa",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.avoir',
            with: [
                'avoir' => $this->avoir,
                'client' => $this->avoir->client,
            ],
        );
    }

    public function attachments(): array
    {
        $attachments = [];

        if ($this->pdfPath && file_exists($this->pdfPath)) {
            $attachments[] = Attachment::fromPath($this->pdfPath)
                ->as("avoir-{$this->avoir->numero}.pdf")
                ->withMime('application/pdf');
        }

        return $attachments;
    }
}
