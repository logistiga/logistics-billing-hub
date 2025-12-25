<?php

namespace App\Mail;

use App\Models\Devis;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class DevisMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Devis $devis,
        public ?string $pdfPath = null,
        public ?string $message = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Devis {$this->devis->numero} - LogistiGa",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.devis',
            with: [
                'devis' => $this->devis,
                'client' => $this->devis->client,
                'customMessage' => $this->message,
            ],
        );
    }

    public function attachments(): array
    {
        $attachments = [];

        if ($this->pdfPath && file_exists($this->pdfPath)) {
            $attachments[] = Attachment::fromPath($this->pdfPath)
                ->as("devis-{$this->devis->numero}.pdf")
                ->withMime('application/pdf');
        }

        return $attachments;
    }
}
